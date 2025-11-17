import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { CategoryTranslations } from './category-translations.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { LanguagesService } from '../languages/languages.service';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { GetCategoryById } from './dto/get-category-by-id';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { News } from '../news/news.model';
import { GetCategoriesByLangCodeDto } from './dto/get-categories-by-lang-code.dto';
import { GetCategoryByNameDto } from './dto/get-category-by-name.dto';
import { Language } from '../languages/languages.model';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category) private categoryModel: typeof Category,
    @InjectModel(CategoryTranslations)
    private categoryTranslationsModel: typeof CategoryTranslations,
    private readonly languagesService: LanguagesService,
    private sequelize: Sequelize,
    @InjectModel(News) private newsModel: typeof News,
  ) {}

  public async createCategory(dto: CreateCategoryDto) {
    // If client provided a single universal category name, create/find it in `categories`
    if (dto.category_name) {
      const name = dto.category_name.toLowerCase().trim();

      if (!/^[a-z0-9_]+$/.test(name)) {
        throw new HttpException(
          'Category name must contain only lowercase letters, numbers, and underscores',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.findOrCreateCategory(name);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Category created successfully',
      };
    }

    // Otherwise expect translations array (backward-compatible flow)
    if (!dto.translations || dto.translations.length === 0) {
      throw new HttpException(
        'Either translations or category_name must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const languageIds = dto.translations.map((t) => t.language_id);
    const isLanguageExists =
      await this.languagesService.checkLanguageExists(languageIds);

    if (!isLanguageExists)
      throw new HttpException(
        'Language does not exist',
        HttpStatus.BAD_REQUEST,
      );

    const category = await this.categoryModel.create();

    const translations = dto.translations.map((translation) => ({
      category_id: category.category_id,
      category_name: translation.category_name.toLowerCase(),
      language_id: translation.language_id,
    }));

    await this.categoryTranslationsModel.bulkCreate(translations);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Category created successfully',
    };
  }

  public async getCategoryTranslations(dto: GetCategoriesByLangCodeDto) {
    // Для обратной совместимости возвращаем категории из новой таблицы
    const categories = await this.categoryModel.findAll({
      attributes: [
        'category_id',
        'category_name',
        [
          Sequelize.literal('category_name'),
          'category_key',
        ],
      ],
      where: {
        category_name: { [Op.ne]: null },
      },
    });

    if (!categories)
      throw new HttpException('Categories not found', HttpStatus.NOT_FOUND);

    return {
      statusCode: HttpStatus.OK,
      message: 'Categories have been found',
      data: { categories },
    };
  }

  public async getCategories() {
    const categories = await this.categoryModel.findAll({
      attributes: ['category_id', 'category_name', 'createdAt'],
      where: {
        category_name: { [Op.ne]: null },
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Categories have been found',
      data: { categories },
    };
  }

  public async deleteCategory(dto: DeleteCategoryDto) {
    const id = Number(dto.id);
    const isCategoryExists = await this.checkCategoryIdExists(id);

    if (!isCategoryExists)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    const t = await this.sequelize.transaction();

    try {
      await this.categoryModel.destroy({
        where: { category_id: id },
        transaction: t,
      });

      await this.newsModel.destroy({
        where: { category_id: id },
        transaction: t,
      });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Category has been deleted',
    };
  }

  public async getCategoryById(dto: GetCategoryById) {
    const id = Number(dto.id);

    const isCategoryExists = await this.checkCategoryIdExists(id);

    if (!isCategoryExists)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    const category = await this.categoryTranslationsModel.findAll({
      attributes: [
        [Sequelize.col('category_name'), 'categoryName'],
        [Sequelize.col('language_code'), 'languageCode'],
        [Sequelize.col('language.language_id'), 'languageId'],
      ],
      where: {
        category_id: id,
      },
      include: [
        {
          model: Language,
          attributes: [],
          as: 'language',
        },
      ],
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Category has been found',
      data: {
        category: {
          id,
          translations: category,
        },
      },
    };
  }

  public async getCategoryByName(dto: GetCategoryByNameDto) {
    const langId = await this.languagesService.findLanguageByName(dto.langCode);

    const category = await this.categoryTranslationsModel.findOne({
      where: {
        category_name: dto.name.toLowerCase(),
      },
    });

    if (!category)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    const translatedCategory = await this.categoryTranslationsModel.findOne({
      attributes: ['category_name'],
      where: {
        category_id: category.category_id,
        language_id: langId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Category has been found',
      data: {
        categoryName: translatedCategory.category_name,
      },
    };
  }

  public async updateCategory(dto: UpdateCategoryDto) {
    const isCategoryExists = await this.checkCategoryIdExists(dto.categoryId);

    if (!isCategoryExists)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    const categoryName = typeof dto.categoryName === 'string' ? dto.categoryName.trim() : '';

    if (categoryName.length < 2)
      throw new HttpException(
        'Category name must be a string with at least 2 characters',
        HttpStatus.BAD_REQUEST,
      );

    // Categories are now language-agnostic tags
    await this.categoryModel.update(
      { category_name: categoryName.toLowerCase() },
      { where: { category_id: dto.categoryId } },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Category has been updated',
    };
  }

  public async findCategoryByName(categoryName: string): Promise<number> {
    const normalizedName = categoryName.toLowerCase();
    
    // Сначала ищем в новой таблице categories
    let category = await this.categoryModel.findOne({
      where: { category_name: normalizedName },
    });

    // Если не найдено, ищем в старой таблице переводов (для обратной совместимости)
    if (!category) {
      const categoryTranslation = await this.categoryTranslationsModel.findOne({
        where: { category_name: normalizedName },
      });

      if (!categoryTranslation)
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

      return categoryTranslation.category_id;
    }

    return category.category_id;
  }

  public async findCategoryById(categoryId: number): Promise<string> {
    // Сначала ищем в новой таблице categories
    const category = await this.categoryModel.findByPk(categoryId);

    if (category && category.category_name) {
      return category.category_name;
    }

    // Если не найдено, ищем в старой таблице переводов (для обратной совместимости)
    const enLangId = await this.languagesService.findLanguageByName('en');
    const categoryTranslation = await this.categoryTranslationsModel.findOne({
      where: { category_id: categoryId, language_id: enLangId },
    });

    if (!categoryTranslation)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    return categoryTranslation.category_name;
  }

  public async checkCategoryIdExists(categoryId: number): Promise<boolean> {
    const category = await this.categoryModel.findByPk(categoryId);
    return !!category;
  }

  public async findOrCreateCategory(categoryName: string): Promise<number> {
    const normalizedName = categoryName.toLowerCase().trim();
    
    // Проверяем валидацию: только латиница, цифры, подчеркивания
    if (!/^[a-z0-9_]+$/.test(normalizedName)) {
      throw new HttpException(
        'Category name must contain only lowercase letters, numbers, and underscores',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Ищем существующую категорию
    let category = await this.categoryModel.findOne({
      where: { category_name: normalizedName },
    });

    if (category) {
      return category.category_id;
    }

    // Создаем новую категорию
    category = await this.categoryModel.create({
      category_name: normalizedName,
    });

    return category.category_id;
  }
}
