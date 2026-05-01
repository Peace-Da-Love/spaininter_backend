import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { News, NewsStatus } from './news.model';
import { InjectModel } from '@nestjs/sequelize';
import { NewsTranslations } from './news-translations.model';
import { REQUEST } from '@nestjs/core';
import { LanguagesService } from '../languages/languages.service';
import { GetNewsForAdminDto } from './dto/get-news-for-admin.dto';
import { linkFormatter } from '../common/utils/link-formatter';
import { DeleteNewsDto } from './dto/delete-news.dto';
import { HashtagsService } from '../hashtags/hashtags.service';
import { Hashtag } from '../hashtags/hashtags.model';
import { col, literal, Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UpdateNewsDto } from './dto/update-news.dto';
import { UpdateNewsTranslationDto } from './dto/update-news-translations.dto';
import { TelegramNewsletterService } from '../telegram-newsletter/telegram-newsletter.service';
import {
  escapeSpecialCharacters,
  removeInvalidCharacters,
} from '../common/utils';
import { Language } from '../languages/languages.model';
import { GetNewsByIdDto } from './dto/get-news-by-id.dto';
import { GetLatestNewsDto } from './dto/get-latest-news.dto';
import { GetHashtagNewsDto } from './dto/get-hashtag-news.dto';
import { GoogleStorageService } from '../google-storage/google-storage.service';
import { transliterate as tr } from 'transliteration';
import { ReviewNewsDto } from './dto/review-news.dto';
import { NewsHashtag } from './news-hashtag.model';
import { User } from '../users/user.model';
import { Admin } from '../auth/admin.model';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News) private newsModel: typeof News,
    @InjectModel(NewsTranslations)
    private newsTranslationsModel: typeof NewsTranslations,
    @InjectModel(NewsHashtag)
    private newsHashtagModel: typeof NewsHashtag,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Admin) private adminModel: typeof Admin,
    @Inject(REQUEST) private readonly request: Request,
    private readonly languageService: LanguagesService,
    private readonly hashtagService: HashtagsService,
    private readonly telegramNewsletterService: TelegramNewsletterService,
    private readonly googleStorageService: GoogleStorageService,
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
        [col('hashtag.hashtag_id'), 'hashtagId'],
        [col('hashtag.hashtag_name'), 'hashtagName'],
        [literal(`COALESCE(hashtag.hashtag_name, '')`), 'hashtagLink'],
        [this.hashtagsJsonLiteral(), 'hashtags'],
        'views',
        'createdAt',
        'updatedAt',
      ],
      where: { news_id: id, status: 'approved' },
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
          model: Hashtag,
          as: 'hashtag',
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
        'province',
        'city',
        ['ad_link', 'adLink'],
        'status',
        'user_id',
        'admin_id',
        [col('newsTranslations.title'), 'title'],
        [col('newsTranslations.description'), 'description'],
        [col('newsTranslations.content'), 'content'],
        [col('newsTranslations.link'), 'link'],
        [col('hashtag.hashtag_id'), 'hashtagId'],
        [col('hashtag.hashtag_name'), 'hashtagName'],
        [literal(`COALESCE(hashtag.hashtag_name, '')`), 'hashtagLink'],
        [this.hashtagsJsonLiteral(), 'hashtags'],
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
          model: Hashtag,
          as: 'hashtag',
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
      where: { status: 'approved' },
      attributes: [
        ['news_id', 'newsId'],
        'city',
        [col('newsTranslations.title'), 'title'],
        [col('newsTranslations.link'), 'link'],
        [col('hashtag.hashtag_name'), 'hashtagName'],
        [literal(`COALESCE(hashtag.hashtag_name, '')`), 'hashtagLink'],
        [this.hashtagsJsonLiteral(), 'hashtags'],
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
          as: 'hashtag',
          model: Hashtag,
        },
      ],
      subQuery: false,
      order: [['createdAt', 'DESC']],
    });

    const newsCount = await this.newsModel.count({
      where: { status: 'approved' },
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

  public async getHashtagNews(dto: GetHashtagNewsDto, languageCode?: string) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const offset = (page - 1) * limit;

    if (!dto.hashtag) {
      throw new HttpException('hashtag is required', HttpStatus.BAD_REQUEST);
    }

    // Look up hashtag by name (supports hyphenated format)
    const hashtagName = dto.hashtag.toLowerCase().replace(/-/g, '_');
    const hashtagId = await this.hashtagService.findHashtagByName(hashtagName);

    const news = await this.newsModel.findAll({
      limit,
      offset,
      where: {
        status: 'approved',
        [Op.and]: literal(`EXISTS (
          SELECT 1
          FROM news_hashtags AS nh_filter
          WHERE nh_filter.news_id = "News"."news_id"
            AND nh_filter.hashtag_id = ${hashtagId}
        )`),
      },
      attributes: [
        ['news_id', 'newsId'],
        'city',
        [col('newsTranslations.title'), 'title'],
        [col('newsTranslations.link'), 'link'],
        [col('hashtag.hashtag_name'), 'hashtagName'],
        [literal(`COALESCE(hashtag.hashtag_name, '')`), 'hashtagLink'],
        [this.hashtagsJsonLiteral(), 'hashtags'],
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
          as: 'hashtag',
          model: Hashtag,
        },
      ],
      subQuery: false,
      order: [['createdAt', 'DESC']],
    });

    const newsCount = await this.newsModel.count({
      where: {
        status: 'approved',
        [Op.and]: literal(`EXISTS (
          SELECT 1
          FROM news_hashtags AS nh_filter
          WHERE nh_filter.news_id = "News"."news_id"
            AND nh_filter.hashtag_id = ${hashtagId}
        )`),
      },
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

  public async getMyNewsForUser(dto: GetNewsForAdminDto) {
    const actor = this.request['user'] as { user_id?: number } | undefined;
    const userId = actor?.user_id;

    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const offset = (page - 1) * limit;
    const user = await this.userModel.findByPk(userId, {
      attributes: ['tg_id'],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const admin = await this.adminModel.findOne({
      where: { tg_id: user.tg_id },
      attributes: ['id'],
    });
    const isAdmin = Boolean(admin);
    const where = isAdmin ? undefined : { user_id: userId };

    const news = await this.newsModel.findAndCountAll({
      limit,
      offset,
      where,
      distinct: true,
      attributes: [['news_id', 'newsId'], 'views', 'createdAt', 'status'],
      include: [
        {
          as: 'newsTranslations',
          model: NewsTranslations,
          attributes: ['title', 'link', 'language_id'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    const pageCount = Math.ceil(news.count / limit);
    const hasNextPage = page < pageCount;
    const hasPreviousPage = page > 1;

    const rows = news.rows.map((row) => {
      const plain = row.get({ plain: true }) as unknown as Record<
        string,
        unknown
      >;
      delete plain.admin_id;
      delete plain.user_id;
      return plain;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data: {
        news: {
          count: news.count,
          rows,
          currentPage: page,
          pageCount,
          hasNextPage,
          hasPreviousPage,
        },
        isAdmin,
      },
    };
  }

  public async createNews(dto: CreateNewsDto) {
    const actor = this.request['user'] as
      | { admin_id?: number; user_id?: number }
      | undefined;
    const adminId = actor?.admin_id ?? null;
    const userId = actor?.user_id ?? null;
    const status: NewsStatus = adminId ? 'approved' : 'pending';

    if (!adminId && !userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const hashtagIds = await this.resolveHashtagIds(dto, true);
    const primaryHashtagId = hashtagIds[0];

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
      const news = await this.newsModel.create(
        {
          hashtag_id: primaryHashtagId,
          admin_id: adminId,
          user_id: userId,
          status,
          poster_link: dto.poster_link,
          province: dto.province ?? null,
          city: dto.city ?? null,
          ad_link: dto.ad_link,
        },
        { transaction: t },
      );

      await this.syncNewsHashtags(news.news_id, hashtagIds, t);

      const translations = dto.translations.map((translation) => {
        return {
          ...translation,
          link: this.normalizeTranslationLink(
            translation.link,
            translation.title,
            news.news_id,
          ),
          news_id: news.news_id,
          content: this.escapeJsonString(translation.content),
        };
      });

      await this.newsTranslationsModel.bulkCreate(translations, {
        transaction: t,
      });

      if (status === 'approved') {
        const enLangId = await this.languageService.findLanguageByName('en');
        const enTranslation = translations.find(
          (t) => t.language_id === enLangId,
        );
        const enTitle = escapeSpecialCharacters(enTranslation.title);
        const enLink = enTranslation.link;
        const utmLink = `https://spaininter.com/en/news/${enLink}?utm_source=telegram&utm_medium=article`;
        const tgMessage = `[${enTitle}](${utmLink})`;
        await this.telegramNewsletterService.sendNewsletter(tgMessage);
      }
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

    const news = await this.newsModel.findAndCountAll({
      limit,
      offset,
      distinct: true,
      attributes: [
        'news_id',
        'createdAt',
        'views',
        'status',
        'user_id',
        'admin_id',
      ],
      include: [
        {
          attributes: ['title', 'link', 'language_id'],
          model: NewsTranslations,
          required: false,
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

  public async updateNewsStatus(newsId: number, status: NewsStatus) {
    const adminId = (this.request['user'] as { admin_id?: number } | undefined)
      ?.admin_id;

    if (!adminId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const news = await this.newsModel.findOne({
      where: { news_id: newsId },
    });

    if (!news) {
      throw new HttpException('News not found', HttpStatus.NOT_FOUND);
    }

    const updateData: Partial<News> = { status };

    if (status === 'approved') {
      updateData.admin_id = adminId;
    } else {
      updateData.admin_id = null;
    }

    await this.newsModel.update(updateData, { where: { news_id: newsId } });

    return {
      statusCode: HttpStatus.OK,
      message: 'News status updated successfully',
    };
  }

  public async reviewNews(newsId: number, dto: ReviewNewsDto) {
    const adminId = (this.request['user'] as { admin_id?: number } | undefined)
      ?.admin_id;

    if (!adminId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const news = await this.newsModel.findOne({
      where: { news_id: newsId },
    });

    if (!news) {
      throw new HttpException('News not found', HttpStatus.NOT_FOUND);
    }

    const hashtagIds = await this.resolveHashtagIds(dto, false);

    const updateData: Partial<News> = {};
    if (hashtagIds.length > 0) updateData.hashtag_id = hashtagIds[0];
    if (dto.poster_link !== undefined) updateData.poster_link = dto.poster_link;
    if (dto.province !== undefined) updateData.province = dto.province;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.ad_link !== undefined) updateData.ad_link = dto.ad_link;

    const t = await this.sequelize.transaction();

    try {
      if (Object.keys(updateData).length > 0) {
        await this.newsModel.update(updateData, {
          where: { news_id: newsId },
          transaction: t,
        });
      }

      if (hashtagIds.length > 0) {
        await this.syncNewsHashtags(newsId, hashtagIds, t);
      }

      if (dto.translations && dto.translations.length > 0) {
        const languageIds = dto.translations.map((tr) => tr.language_id);
        const isLanguageExists =
          await this.languageService.checkLanguageExists(languageIds);

        if (!isLanguageExists) {
          throw new HttpException(
            'Language does not exist',
            HttpStatus.BAD_REQUEST,
          );
        }

        for (const translation of dto.translations) {
          const existing = await this.newsTranslationsModel.findOne({
            where: {
              news_id: newsId,
              language_id: translation.language_id,
            },
            transaction: t,
          });

          const normalizedLink = translation.link
            ? this.normalizeTranslationLink(
                translation.link,
                translation.title,
                newsId,
              )
            : existing?.link ??
              this.normalizeTranslationLink(
                undefined,
                translation.title,
                newsId,
              );

          if (existing) {
            await existing.update(
              {
                title: translation.title,
                description: translation.description,
                content: translation.content,
                link: normalizedLink,
              },
              { transaction: t },
            );
          } else {
            await this.newsTranslationsModel.create(
              {
                news_id: newsId,
                language_id: translation.language_id,
                title: translation.title,
                description: translation.description,
                content: this.escapeJsonString(translation.content),
                link: normalizedLink,
              },
              { transaction: t },
            );
          }
        }
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to review news', HttpStatus.BAD_REQUEST);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'News updated successfully',
    };
  }

  public async deleteNews(dto: DeleteNewsDto) {
    const news = await this.newsModel.findOne({
      where: { ...dto },
    });
    if (!news) throw new HttpException('News not found', HttpStatus.NOT_FOUND);

    // Удаляем постер из Google Cloud Storage перед удалением записи
    if (news.poster_link) {
      console.log('🗑️ Удаление постера при удалении новости:', {
        newsId: dto.news_id,
        posterLink: news.poster_link,
      });
      await this.googleStorageService.deleteFile(news.poster_link);
    }

    await news.destroy();
    await this.newsTranslationsModel.destroy({
      where: { news_id: dto.news_id },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'News deleted successfully',
    };
  }

  public async uploadPosterFile(file: Express.Multer.File) {
    return this.googleStorageService.uploadFile(file);
  }

  public async updateNews(dto: UpdateNewsDto) {
    const isNewsExists = await this.newsModel.findOne({
      where: { news_id: dto.newsId },
    });

    if (!isNewsExists)
      throw new HttpException('News not found', HttpStatus.NOT_FOUND);

    // Проверяем перевод только если languageId передан
    if (dto.languageId) {
      const isNewsTranslationExists = await this.newsTranslationsModel.findOne({
        where: { news_id: dto.newsId, language_id: dto.languageId },
      });

      if (!isNewsTranslationExists)
        throw new HttpException(
          'News translation not found',
          HttpStatus.NOT_FOUND,
        );
    }

    const t = await this.sequelize.transaction();

    try {
      // Подготавливаем данные для обновления новости
      const newsUpdateData: any = {};
      console.log('🔍 UpdateNews Debug:', {
        newsId: dto.newsId,
        posterLink: dto.posterLink,
        currentPosterLink: isNewsExists.poster_link,
        adLink: dto.adLink,
      });

      if (dto.adLink !== undefined) {
        newsUpdateData.ad_link = dto.adLink;
      }
      // Обрабатываем постер
      if (dto.posterLink) {
        // Удаляем старый постер, если он существует и отличается от нового
        const oldPosterLink = isNewsExists.poster_link;
        const newPosterLink = dto.posterLink;

        if (newPosterLink && oldPosterLink && oldPosterLink !== newPosterLink) {
          console.log('🗑️ Удаление старого постера:', {
            oldPosterLink,
            newPosterLink,
            newsId: dto.newsId,
          });

          // Удаляем старый постер ДО обновления записи в БД
          await this.googleStorageService.deleteFile(oldPosterLink);
        }

        newsUpdateData.poster_link = newPosterLink;
      }

      console.log('📝 NewsUpdateData:', newsUpdateData);

      // Обновляем основную таблицу новостей, если есть данные для обновления
      if (Object.keys(newsUpdateData).length > 0) {
        await this.newsModel.update(newsUpdateData, {
          where: { news_id: dto.newsId },
          transaction: t,
        });
      }

      // Подготавливаем данные для обновления переводов
      const translationUpdateData: any = {};
      if (dto.title !== undefined) {
        translationUpdateData.title = dto.title;
      }
      if (dto.description !== undefined) {
        translationUpdateData.description = dto.description;
      }
      if (dto.content !== undefined) {
        translationUpdateData.content = dto.content;
      }

      console.log('🔍 Translation update data:', translationUpdateData);
      console.log('🔍 LanguageId:', dto.languageId);
      console.log(
        '🔍 Has translation data:',
        Object.keys(translationUpdateData).length > 0,
      );

      // Обновляем переводы, если есть данные для обновления
      if (Object.keys(translationUpdateData).length > 0) {
        // Требуем languageId для обновления переводов
        if (!dto.languageId) {
          throw new HttpException(
            'languageId is required to update translations',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Обновляем конкретный перевод
        await this.newsTranslationsModel.update(translationUpdateData, {
          where: { news_id: dto.newsId, language_id: dto.languageId },
          transaction: t,
        });
        console.log('🔍 Updated translation for languageId:', dto.languageId);
      }

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

  public async updateNewsTranslations(
    newsId: number,
    translations: UpdateNewsTranslationDto[],
  ) {
    console.log('🔍 Service: updateNewsTranslations called with:', {
      newsId,
      translations,
    });

    if (
      !translations ||
      !Array.isArray(translations) ||
      translations.length === 0
    ) {
      throw new HttpException(
        'Translations array is required and must not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isNewsExists = await this.newsModel.findOne({
      where: { news_id: newsId },
    });

    if (!isNewsExists) {
      throw new HttpException('News not found', HttpStatus.NOT_FOUND);
    }

    // Проверяем существование языков
    const languageIds = translations.map((t) => t.languageId);
    console.log('🔍 Service: languageIds to check:', languageIds);

    const isLanguageExists =
      await this.languageService.checkLanguageExists(languageIds);

    if (!isLanguageExists) {
      throw new HttpException(
        'One or more languages do not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const t = await this.sequelize.transaction();

    try {
      // Обновляем каждый перевод
      for (const translation of translations) {
        const existing = await this.newsTranslationsModel.findOne({
          where: { news_id: newsId, language_id: translation.languageId },
          transaction: t,
        });

        const translationUpdateData: any = {};

        if (translation.title !== undefined) {
          translationUpdateData.title = translation.title;
        }
        if (translation.description !== undefined) {
          translationUpdateData.description = translation.description;
        }
        if (translation.content !== undefined) {
          translationUpdateData.content = translation.content;
        }

        // Обновляем перевод, если есть данные для обновления
        if (Object.keys(translationUpdateData).length > 0) {
          if (existing) {
            await this.newsTranslationsModel.update(translationUpdateData, {
              where: { news_id: newsId, language_id: translation.languageId },
              transaction: t,
            });
            console.log(
              `🔍 Updated translation for languageId: ${translation.languageId}`,
            );
          } else {
            const title = translation.title;
            const description = translation.description;
            const content = translation.content;

            if (!title || !description || !content) {
              throw new HttpException(
                'title, description, and content are required to create a new translation',
                HttpStatus.BAD_REQUEST,
              );
            }

            const normalizedLink = this.normalizeTranslationLink(
              undefined,
              title,
              newsId,
            );

            await this.newsTranslationsModel.create(
              {
                news_id: newsId,
                language_id: translation.languageId,
                title,
                description,
                content: this.escapeJsonString(content),
                link: normalizedLink,
              },
              { transaction: t },
            );
            console.log(
              `🔍 Created translation for languageId: ${translation.languageId}`,
            );
          }
        }
      }

      await t.commit();
    } catch (err) {
      console.error(err);
      await t.rollback();
      throw new HttpException(
        'Failed to update news translations',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'News translations updated successfully',
    };
  }

  public async deleteNewsTranslation(newsId: number, languageId: number) {
    const existing = await this.newsTranslationsModel.findOne({
      where: { news_id: newsId, language_id: languageId },
    });

    if (!existing) {
      throw new HttpException(
        'News translation not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await existing.destroy();

    return {
      statusCode: HttpStatus.OK,
      message: 'News translation deleted successfully',
    };
  }

  private hashtagsJsonLiteral() {
    return literal(`(
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'hashtagId', h.hashtag_id,
            'hashtagName', h.hashtag_name,
            'hashtagLink', h.hashtag_name
          )
          ORDER BY h.hashtag_name
        ),
        '[]'::json
      )
      FROM news_hashtags AS nh
      INNER JOIN hashtags AS h ON h.hashtag_id = nh.hashtag_id
      WHERE nh.news_id = "News"."news_id"
    )`);
  }

  private async resolveHashtagIds(
    dto: Pick<
      CreateNewsDto | ReviewNewsDto,
      'hashtag_id' | 'hashtag_name' | 'hashtag_ids' | 'hashtag_names'
    >,
    required: boolean,
  ) {
    const ids = dto.hashtag_ids ? [...dto.hashtag_ids] : [];

    if (dto.hashtag_id) {
      ids.unshift(dto.hashtag_id);
    }

    const names = dto.hashtag_names ? [...dto.hashtag_names] : [];

    if (dto.hashtag_name) {
      names.unshift(dto.hashtag_name);
    }

    if (!ids.length && !names.length) {
      if (required) {
        throw new HttpException(
          'At least one hashtag must be provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      return [];
    }

    const resolvedIds: number[] = [];

    for (const hashtagId of ids) {
      const isHashtagIdExists =
        await this.hashtagService.checkHashtagIdExists(hashtagId);

      if (!isHashtagIdExists) {
        throw new HttpException(
          'Hashtag does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }

      resolvedIds.push(hashtagId);
    }

    for (const hashtagName of names) {
      resolvedIds.push(
        await this.hashtagService.findOrCreateHashtag(hashtagName),
      );
    }

    return [...new Set(resolvedIds)];
  }

  private async syncNewsHashtags(
    newsId: number,
    hashtagIds: number[],
    transaction: Transaction,
  ) {
    await this.newsHashtagModel.destroy({
      where: { news_id: newsId },
      transaction,
    });

    await this.newsHashtagModel.bulkCreate(
      hashtagIds.map((hashtagId) => ({
        news_id: newsId,
        hashtag_id: hashtagId,
      })),
      { transaction },
    );
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

  private normalizeTranslationLink(
    input: string | undefined,
    title: string,
    newsId: number,
  ) {
    const raw = input?.trim();
    if (!raw) {
      return linkFormatter(title, newsId);
    }

    let working = raw;
    const idPrefix = String(newsId);
    if (working.startsWith(idPrefix)) {
      working = working.slice(idPrefix.length);
      working = working.replace(/^[\s\-_]+/, '');
    }

    const cleaned = removeInvalidCharacters(working).replace(/ /g, '-');
    const slug = tr(cleaned);

    if (!slug) {
      return linkFormatter(title, newsId);
    }

    return `${newsId}-${slug}`;
  }
}
