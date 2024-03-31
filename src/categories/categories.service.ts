import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { CategoryTranslations } from './category-translations.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { LanguagesService } from '../languages/languages.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category) private categoryModel: typeof Category,
    @InjectModel(CategoryTranslations)
    private categoryTranslationsModel: typeof CategoryTranslations,
    private readonly languagesService: LanguagesService,
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

  public async getCategories() {
    const enLangId = await this.languagesService.findLanguageByName('en');

    const categories = await this.categoryModel.findAll({
      attributes: ['category_id'],
      include: [
        {
          model: CategoryTranslations,
          attributes: ['category_name'],
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
