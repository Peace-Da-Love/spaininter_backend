import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { News } from './news.model';
import { InjectModel } from '@nestjs/sequelize';
import { NewsTranslations } from './news-translations.model';
import { REQUEST } from '@nestjs/core';
import { LanguagesService } from '../languages/languages.service';
import { GetNewsForAdminDto } from './dto/get-news-for-admin.dto';
import { linkFormatter } from '../common/utils/link-formatter';
import { DeleteNewsDto } from './dto/delete-news.dto';
import { CategoriesService } from '../categories/categories.service';
import { CategoryTranslations } from '../categories/category-translations.model';
import { Category } from '../categories/categories.model';
import { col, literal } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UpdateNewsDto } from './dto/update-news.dto';
import { TelegramNewsletterService } from '../telegram-newsletter/telegram-newsletter.service';
import { escapeSpecialCharacters } from '../common/utils';
import { Language } from '../languages/languages.model';
import { GetNewsByIdDto } from './dto/get-news-by-id.dto';
import { GetLatestNewsDto } from './dto/get-latest-news.dto';
import { GetCategoryNewsDto } from './dto/get-category-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News) private newsModel: typeof News,
    @InjectModel(NewsTranslations)
    private newsTranslationsModel: typeof NewsTranslations,
    @Inject(REQUEST) private readonly request: Request,
    private readonly languageService: LanguagesService,
    private readonly categoryService: CategoriesService,
    private readonly telegramNewsletterService: TelegramNewsletterService,
    private sequelize: Sequelize,
  ) {}

  public async getNewsByIdForSite(dto: GetNewsByIdDto, languageCode?: string) {
    const id = Number(dto.id);
    const news = await this.newsModel.findOne({
      attributes: [
        ['news_id', 'newsId'],
        ['poster_link', 'posterLink'],
        'city',
        ['ad_link', 'adLink'],
        [col('newsTranslations.title'), 'title'],
        [col('newsTranslations.content'), 'content'],
        [col('newsTranslations.link'), 'link'],
        [col('category.category_id'), 'categoryId'],
        [col('category.categoryTranslations.category_name'), 'categoryName'],
        [
          literal(
            `REGEXP_REPLACE((SELECT category_name FROM category_translations WHERE category_translations.category_id = category.category_id AND category_translations.language_id = (SELECT language_id FROM languages WHERE language_code = 'en')), '[^a-zA-Z0-9]', '-', 'g')`,
          ),
          'categoryLink',
        ],
        'views',
        'createdAt',
        'updatedAt',
      ],
      where: { news_id: id },
      include: [
        {
          attributes: [],
          as: 'newsTranslations',
          model: NewsTranslations,
          include: [
            {
              attributes: [],
              model: Language,
              where: { language_code: languageCode ?? 'en' },
            },
          ],
        },
        {
          attributes: [],
          model: Category,
          include: [
            {
              attributes: [],
              as: 'categoryTranslations',
              model: CategoryTranslations,
              include: [
                {
                  model: Language,
                  attributes: [],
                  where: { language_code: languageCode ?? 'en' },
                },
              ],
            },
          ],
        },
      ],
    });

    if (!news) throw new HttpException('News not found', HttpStatus.NOT_FOUND);

    await this.newsModel.update(
      { views: news.views + 1 },
      { where: { news_id: Number(id) } },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: {
        news,
      },
    };
  }

  public async getNewsByIdForAdmin(dto: GetNewsByIdDto, languageCode?: string) {
    const id = Number(dto.id);
    const news = await this.newsModel.findOne({
      attributes: [
        ['news_id', 'newsId'],
        ['poster_link', 'posterLink'],
        'city',
        ['ad_link', 'adLink'],
        [col('newsTranslations.title'), 'title'],
        [col('newsTranslations.description'), 'description'],
        [col('newsTranslations.content'), 'content'],
        [col('newsTranslations.link'), 'link'],
        [col('category.category_id'), 'categoryId'],
        [col('category.categoryTranslations.category_name'), 'categoryName'],
        [
          literal(
            `REGEXP_REPLACE((SELECT category_name FROM category_translations WHERE category_translations.category_id = category.category_id AND category_translations.language_id = (SELECT language_id FROM languages WHERE language_code = 'en')), '[^a-zA-Z0-9]', '-', 'g')`,
          ),
          'categoryLink',
        ],
        'views',
        'createdAt',
        'updatedAt',
      ],
      where: { news_id: id },
      include: [
        {
          attributes: [],
          as: 'newsTranslations',
          model: NewsTranslations,
          include: [
            {
              attributes: [],
              model: Language,
              where: { language_code: languageCode ?? 'en' },
            },
          ],
        },
        {
          attributes: [],
          model: Category,
          include: [
            {
              attributes: [],
              as: 'categoryTranslations',
              model: CategoryTranslations,
              include: [
                {
                  model: Language,
                  attributes: [],
                  where: { language_code: languageCode ?? 'en' },
                },
              ],
            },
          ],
        },
      ],
    });

    if (!news) throw new HttpException('News not found', HttpStatus.NOT_FOUND);

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: {
        news,
      },
    };
  }

  public async getLatestNews(dto: GetLatestNewsDto, languageCode?: string) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const offset = (page - 1) * limit;

    const news = await this.newsModel.findAll({
      limit,
      offset,
      attributes: [
        ['news_id', 'newsId'],
        'city',
        [col('newsTranslations.title'), 'title'],
        [col('newsTranslations.link'), 'link'],
        [col('category.categoryTranslations.category_name'), 'categoryName'],
        [
          literal(
            `REGEXP_REPLACE((SELECT category_name FROM category_translations WHERE category_translations.category_id = category.category_id AND category_translations.language_id = (SELECT language_id FROM languages WHERE language_code = 'en')), '[^a-zA-Z0-9]', '-', 'g')`,
          ),
          'categoryLink',
        ],
        ['poster_link', 'posterLink'],
        'createdAt',
      ],
      include: [
        {
          as: 'newsTranslations',
          model: NewsTranslations,
          attributes: [],
          include: [
            {
              model: Language,
              attributes: [],
              where: { language_code: languageCode ?? 'en' },
            },
          ],
        },
        {
          attributes: [],
          as: 'category',
          model: Category,
          include: [
            {
              as: 'categoryTranslations',
              model: CategoryTranslations,
              attributes: [],
              include: [
                {
                  model: Language,
                  attributes: [],
                  where: { language_code: languageCode ?? 'en' },
                },
              ],
            },
          ],
        },
      ],
      subQuery: false,
      order: [['createdAt', 'DESC']],
    });

    const newsCount = await this.newsModel.count();
    const pageCount = Math.ceil(newsCount / limit);
    const hasNextPage = page < pageCount;
    const hasPreviousPage = page > 1;

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: {
        currentPage: page,
        pageCount,
        hasNextPage,
        hasPreviousPage,
        news,
      },
    };
  }

  public async getCategoryNews(dto: GetCategoryNewsDto, languageCode?: string) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const offset = (page - 1) * limit;

    const categoryName = dto.category.toLowerCase().replace(/-/g, '/');
    const category =
      await this.categoryService.findCategoryByName(categoryName);

    const news = await this.newsModel.findAll({
      limit,
      offset,
      where: { category_id: category },
      attributes: [
        ['news_id', 'newsId'],
        'city',
        [col('newsTranslations.title'), 'title'],
        [col('newsTranslations.link'), 'link'],
        [col('category.categoryTranslations.category_name'), 'categoryName'],
        [
          literal(
            `REGEXP_REPLACE((SELECT category_name FROM category_translations WHERE category_translations.category_id = category.category_id AND category_translations.language_id = (SELECT language_id FROM languages WHERE language_code = 'en')), '[^a-zA-Z0-9]', '-', 'g')`,
          ),
          'categoryLink',
        ],
        ['poster_link', 'posterLink'],
        'createdAt',
      ],
      include: [
        {
          as: 'newsTranslations',
          model: NewsTranslations,
          attributes: [],
          include: [
            {
              model: Language,
              attributes: [],
              where: { language_code: languageCode ?? 'en' },
            },
          ],
        },
        {
          attributes: [],
          as: 'category',
          model: Category,
          include: [
            {
              as: 'categoryTranslations',
              model: CategoryTranslations,
              attributes: [],
              include: [
                {
                  model: Language,
                  attributes: [],
                  where: { language_code: languageCode ?? 'en' },
                },
              ],
            },
          ],
        },
      ],
      subQuery: false,
      order: [['createdAt', 'DESC']],
    });

    const newsCount = await this.newsModel.count({
      where: { category_id: category },
    });
    const pageCount = Math.ceil(newsCount / limit);
    const hasNextPage = page < pageCount;
    const hasPreviousPage = page > 1;

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: {
        currentPage: page,
        pageCount,
        hasNextPage,
        hasPreviousPage,
        news,
      },
    };
  }

  public async createNews(dto: CreateNewsDto) {
    const isCategoryIdExists = this.categoryService.checkCategoryIdExists(
      dto.category_id,
    );

    if (!isCategoryIdExists)
      throw new HttpException(
        'Category does not exist',
        HttpStatus.BAD_REQUEST,
      );

    const languageIds = dto.translations.map((t) => t.language_id);
    const isLanguageExists =
      await this.languageService.checkLanguageExists(languageIds);

    if (!isLanguageExists)
      throw new HttpException(
        'Language does not exist',
        HttpStatus.BAD_REQUEST,
      );

    const t = await this.sequelize.transaction();

    try {
      const news = await this.newsModel.create({
        category_id: dto.category_id,
        admin_id: this.request['user'].admin_id,
        poster_link: dto.poster_link,
        province: dto.province,
        city: dto.city,
        ad_link: dto.ad_link,
      });

      const translations = dto.translations.map((translation) => {
        return {
          ...translation,
          link:
            translation.link || linkFormatter(translation.title, news.news_id),
          news_id: news.news_id,
          content: this.escapeJsonString(translation.content),
        };
      });

      await this.newsTranslationsModel.bulkCreate(translations);

      const enLangId = await this.languageService.findLanguageByName('en');
      const enTitle = escapeSpecialCharacters(
        translations.find((t) => t.language_id === enLangId).title,
      );
      const enLink = translations.find((t) => t.language_id === enLangId).link;
      const utmLink = `https://spaininter.com/en/news/${enLink}?utm_source=telegram&utm_medium=article`;
      const tgMessage = `[${enTitle}](${utmLink})\n\n${escapeSpecialCharacters(
        dto.telegramShortText,
      )}`;
      await this.telegramNewsletterService.sendNewsletter(tgMessage);
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw new HttpException('Failed to create news', HttpStatus.BAD_REQUEST);
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'News created successfully',
    };
  }

  public async getNewsForAdmin(dto: GetNewsForAdminDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const offset = (page - 1) * limit;

    const enLangId = await this.languageService.findLanguageByName('en');

    const news = await this.newsModel.findAndCountAll({
      limit,
      offset,
      attributes: ['news_id', 'createdAt', 'views'],
      include: [
        {
          attributes: ['title', 'link'],
          model: NewsTranslations,
          where: {
            language_id: enLangId,
          },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: news,
    };
  }

  public async deleteNews(dto: DeleteNewsDto) {
    const news = await this.newsModel.findOne({
      where: { ...dto },
    });
    if (!news) throw new HttpException('News not found', HttpStatus.NOT_FOUND);
    await news.destroy();
    await this.newsTranslationsModel.destroy({
      where: { news_id: dto.news_id },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'News deleted successfully',
    };
  }

  public async updateNews(dto: UpdateNewsDto) {
    const isNewsExists = await this.newsModel.findOne({
      where: { news_id: dto.newsId },
    });

    if (!isNewsExists)
      throw new HttpException('News not found', HttpStatus.NOT_FOUND);

    const isNewsTranslationExists = await this.newsTranslationsModel.findOne({
      where: { news_id: dto.newsId, language_id: dto.languageId },
    });

    if (!isNewsTranslationExists)
      throw new HttpException(
        'News translation not found',
        HttpStatus.NOT_FOUND,
      );

    const t = await this.sequelize.transaction();

    try {
      await this.newsModel.update(
        {
          ad_link: dto.adLink.length > 0 ? dto.adLink : null,
        },
        { where: { news_id: dto.newsId }, transaction: t },
      );

      const content = dto.content
        ? { content: this.escapeJsonString(dto.content) }
        : {};

      await this.newsTranslationsModel.update(
        {
          title: dto.title,
          description: dto.description,
          ...content,
        },
        {
          where: { news_id: dto.newsId, language_id: dto.languageId },
          transaction: t,
        },
      );

      await t.commit();
    } catch (err) {
      console.error(err);
      await t.rollback();
      throw new HttpException('Failed to update news', HttpStatus.BAD_REQUEST);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'News updated successfully',
    };
  }

  private escapeJsonString(str: string) {
    return str
      .replace(/[\\]/g, '\\\\')
      .replace(/[\"]/g, '\\"')
      .replace(/[\/]/g, '\\/')
      .replace(/[\b]/g, '\\b')
      .replace(/[\f]/g, '\\f')
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r')
      .replace(/[\t]/g, '\\t');
  }
}
