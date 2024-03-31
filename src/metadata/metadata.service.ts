import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../categories/categories.model';
import { CategoryTranslations } from '../categories/category-translations.model';
import { LanguagesService } from '../languages/languages.service';
import { NewsTranslations } from '../news/news-translations.model';
import { News } from '../news/news.model';
import { col, Sequelize } from 'sequelize';
import { Language } from '../languages/languages.model';

@Injectable()
export class MetadataService {
  constructor(
    @InjectModel(Category) private categoryModel: typeof Category,
    @InjectModel(CategoryTranslations)
    private categoryTranslationsModel: typeof CategoryTranslations,
    @InjectModel(News) private newsModel: typeof News,
    @InjectModel(NewsTranslations)
    private newsTranslationsModel: typeof NewsTranslations,
    private readonly languagesService: LanguagesService,
  ) {}

  public async getCategoryMetadata() {
    const enLangId = await this.languagesService.findLanguageByName('en');

    const newsCategories = await this.categoryModel.findAll({
      attributes: [
        [col('categoryTranslations.category_name'), 'category_name'],
        [
          Sequelize.cast(
            Sequelize.literal('CEIL(COUNT(news_id)::numeric / 8::numeric)'),
            'integer',
          ),
          'pages_count',
        ],
        [
          Sequelize.literal(
            '(SELECT MAX(news."updatedAt") FROM news WHERE news.category_id = "Category"."category_id")',
          ),
          'last_modified',
        ],
      ],
      include: [
        {
          model: CategoryTranslations,
          attributes: [],
          where: { language_id: enLangId },
        },
        {
          model: News,
          attributes: [],
        },
      ],
      group: ['Category.category_id', 'categoryTranslations.translation_id'],
    });

    const countNews = await this.newsModel.count();
    const latestNews = {
      category_name: 'latest',
      pages_count: Math.ceil(countNews / 8),
      last_modified: await this.newsModel.max('updatedAt'),
    };

    return {
      statusCode: 200,
      message: 'Categories have been found',
      data: [...newsCategories, latestNews],
    };
  }

  public async getNewsMetadata() {
    const news = await this.newsModel.findAll({
      attributes: ['createdAt', 'updatedAt'],
      include: [
        {
          model: NewsTranslations,
          attributes: ['link'],
          include: [{ model: Language, attributes: ['language_code'] }],
        },
      ],
    });

    return {
      statusCode: 200,
      message: 'News fetched successfully',
      data: news,
    };
  }
}
