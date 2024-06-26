import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { CategoryTranslations } from './category-translations.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { LanguagesService } from '../languages/languages.service';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { GetCategoryById } from './dto/get-category-by-id';
import { Sequelize } from 'sequelize-typescript';
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
    const langCode = dto.langCode;
    const languageId = await this.languagesService.findLanguageByName(langCode);
    const enLangId = await this.languagesService.findLanguageByName('en');

    if (!languageId)
      throw new HttpException('Language not found', HttpStatus.NOT_FOUND);

    const categories = await this.categoryModel.findAll({
      attributes: [
        'category_id',
        [Sequelize.col('categoryTranslations.category_name'), 'category_name'],
        [
          Sequelize.literal(
            `(SELECT REPLACE(REPLACE(categoryTranslations.category_name, '/', '-'), '\\', '-') FROM category_translations AS categoryTranslations WHERE categoryTranslations.category_id = "Category"."category_id" AND categoryTranslations.language_id = ${enLangId})`,
          ),
          'category_key',
        ],
      ],
      include: [
        {
          attributes: [],
          model: CategoryTranslations,
          as: 'categoryTranslations',
          where: { language_id: languageId },
        },
      ],
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
    const enLangId = await this.languagesService.findLanguageByName('en');

    const categories = await this.categoryModel.findAll({
      attributes: [
        'category_id',
        'createdAt',
        [Sequelize.col('categoryTranslations.category_name'), 'category_name'],
      ],
      include: [
        {
          model: CategoryTranslations,
          attributes: [],
          where: { language_id: enLangId },
        },
      ],
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

    const isCategoryTranslationExists =
      await this.categoryTranslationsModel.findOne({
        where: {
          category_id: dto.categoryId,
          language_id: dto.languageId,
        },
      });

    if (!isCategoryTranslationExists)
      throw new HttpException(
        'Category translation not found',
        HttpStatus.NOT_FOUND,
      );

    await this.categoryTranslationsModel.update(
      {
        category_name: dto.categoryName.toLowerCase(),
      },
      {
        where: {
          category_id: dto.categoryId,
          language_id: dto.languageId,
        },
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Category has been updated',
    };
  }

  public async findCategoryByName(categoryName: string): Promise<number> {
    const category = await this.categoryTranslationsModel.findOne({
      where: { category_name: categoryName.toLowerCase() },
    });

    if (!category)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    return category.category_id;
  }

  public async findCategoryById(categoryId: number): Promise<string> {
    const enLangId = await this.languagesService.findLanguageByName('en');
    const category = await this.categoryTranslationsModel.findOne({
      where: { category_id: categoryId, language_id: enLangId },
    });

    if (!category)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    return category.category_name;
  }

  public async checkCategoryIdExists(categoryId: number): Promise<boolean> {
    const category = await this.categoryModel.findByPk(categoryId);
    return !!category;
  }
}
