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
import { GetNewsByFilterDto } from './dto/get-news-by-filter.dto';
import { CategoriesService } from '../categories/categories.service';
import { CategoryTranslations } from '../categories/category-translations.model';
import { Category } from '../categories/categories.model';
import { GetNewsDto } from './dto/get-news.dto';
import { GetRecommendedNewsDto } from './dto/get-recommended-news.dto';
import { col } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UpdateNewsDto } from './dto/update-news.dto';
import { TelegramNewsletterService } from '../telegram-newsletter/telegram-newsletter.service';
import { escapeSpecialCharacters } from '../common/utils';

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

  public async getNewsById(dto: GetNewsDto) {
    const { languageCode, id } = dto;
    const languageId =
      await this.languageService.findLanguageByName(languageCode);

    const news = await this.newsModel.findOne({
      where: { news_id: Number(id) },
      attributes: [
        'news_id',
        'views',
        'poster_link',
        'city',
        'province',
        'createdAt',
      ],
      include: [
        {
          model: NewsTranslations,
          where: { language_id: languageId },
          attributes: ['title', 'content', 'link', 'description'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['category_id'],
          include: [
            {
              model: CategoryTranslations,
              where: { language_id: languageId },
              attributes: ['category_name'],
            },
          ],
        },
      ],
    });

    if (!news) throw new HttpException('News not found', HttpStatus.NOT_FOUND);

    news.views += 1;
    await news.save();

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: { news },
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
      const ivLink = `https://t.me/iv?url=https://spaininter.com/en/news/${enLink}&rhash=66ac0b9968d595`;
      const tgMessage = `[${enTitle}](${ivLink})\n\n${escapeSpecialCharacters(
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

    await this.newsTranslationsModel.update(
      {
        title: dto.title,
        description: dto.description,
        content: dto.content,
      },
      { where: { news_id: dto.newsId, language_id: dto.languageId } },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'News updated successfully',
    };
  }

  public async getRecommendedNews(dto: GetRecommendedNewsDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const offset = (page - 1) * limit;
    const languageCode = dto.languageCode;
    const languageId =
      await this.languageService.findLanguageByName(languageCode);

    const news = await this.newsModel.findAndCountAll({
      limit,
      offset,
      order: [['views', 'DESC']],
      include: [
        {
          model: NewsTranslations,
          attributes: ['title', 'link'],
          where: { language_id: languageId },
        },
        {
          model: Category,
          as: 'category',
          attributes: ['category_id'],
          include: [
            {
              model: CategoryTranslations,
              where: { language_id: languageId },
              attributes: ['category_name'],
            },
          ],
        },
      ],
      attributes: ['news_id', 'createdAt', 'poster_link', 'views'],
    });

    const pages = Math.ceil(news.count / limit);

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: {
        news: {
          page,
          pages,
          ...news,
        },
      },
    };
  }

  public async getNewsByFilter(dto: GetNewsByFilterDto) {
    const { search } = dto;
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const offset = (page - 1) * limit;
    const languageCode = dto.languageCode || 'en';
    const languageId =
      await this.languageService.findLanguageByName(languageCode);

    if (search === 'latest' || !search) {
      const latestNews = await this.newsModel.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: NewsTranslations,
            attributes: ['title', 'link'],
            where: { language_id: languageId },
          },
          {
            model: Category,
            as: 'category',
            attributes: ['category_id'],
            include: [
              {
                model: CategoryTranslations,
                where: { language_id: languageId },
                attributes: ['category_name'],
              },
            ],
          },
        ],
        attributes: ['news_id', 'createdAt', 'poster_link'],
      });
      const pages = Math.ceil(latestNews.count / limit);

      return {
        statusCode: HttpStatus.OK,
        message: 'News fetched successfully',
        data: {
          news: {
            page,
            pages,
            categoryName: 'latest',
            ...latestNews,
          },
        },
      };
    }

    const categoryId = await this.categoryService.findCategoryByName(search);
    const categoryName =
      await this.categoryService.findCategoryById(categoryId);

    const news = await this.newsModel.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: NewsTranslations,
          attributes: ['title', 'link'],
          where: { language_id: languageId },
        },
        {
          model: Category,
          as: 'category',
          attributes: ['category_id'],
          include: [
            {
              model: CategoryTranslations,
              where: { language_id: languageId },
              attributes: ['category_name'],
            },
          ],
        },
      ],
      where: {
        category_id: categoryId,
      },
      attributes: ['news_id', 'createdAt', 'poster_link'],
    });

    const pages = Math.ceil(news.count / limit);

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: {
        news: {
          page,
          pages,
          categoryName,
          ...news,
        },
      },
    };
  }

  public async getLinks() {}

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
