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
      ...translation,
      category_id: category.category_id,
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
}
