import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { News } from './news.model';
import { InjectModel } from '@nestjs/sequelize';
import { NewsTranslations } from './news-translations.model';
import { Category } from '../categories/categories.model';
import { REQUEST } from '@nestjs/core';
import { LanguagesService } from '../languages/languages.service';
import { GetNewsForAdminDto } from './dto/get-news-for-admin.dto';
import { linkFormater } from '../common/utils/link-formater';
import { DeleteNewsDto } from './dto/delete-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News) private newsModel: typeof News,
    @InjectModel(NewsTranslations)
    private newsTranslationsModel: typeof NewsTranslations,
    @InjectModel(Category) private categoryModel: typeof Category,
    @Inject(REQUEST) private readonly request: Request,
    private readonly languageService: LanguagesService,
  ) {}

  public async createNews(dto: CreateNewsDto) {
    const isCategoryIdExists = await this.checkCategoryIdExists(
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

    const news = await this.newsModel.create({
      category_id: dto.category_id,
      admin_id: this.request['user'].admin_id,
      poster_link: dto.poster_link,
      province: dto.province,
      city: dto.city,
    });

    const translations = dto.translations.map((translation) => {
      console.log(this.escapeJsonString(translation.content));
      return {
        ...translation,
        link: translation.link || linkFormater(translation.title),
        news_id: news.news_id,
        content: this.escapeJsonString(translation.content),
      };
    });

    await this.newsTranslationsModel.bulkCreate(translations);

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
      include: {
        model: NewsTranslations,
        attributes: ['title'],
        where: { language_id: enLangId },
      },
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

  private async checkCategoryIdExists(categoryId: number): Promise<boolean> {
    const category = await this.categoryModel.findByPk(categoryId);
    return !!category;
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
