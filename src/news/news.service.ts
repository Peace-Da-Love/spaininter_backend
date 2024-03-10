import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { News } from './news.model';
import { InjectModel } from '@nestjs/sequelize';
import { NewsTranslations } from './news-translations.model';
import { Category } from '../categories/categories.model';
import { REQUEST } from '@nestjs/core';
import { LanguagesService } from '../languages/languages.service';

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

    console.log(this.request);
    const news = await this.newsModel.create({
      category_id: dto.category_id,
      admin_id: this.request['user'].admin_id,
      poster_link: dto.poster_link,
      province: dto.province,
      city: dto.city,
    });

    const translations = dto.translations.map((translation) => ({
      ...translation,
      news_id: news.news_id,
    }));

    await this.newsTranslationsModel.bulkCreate(translations);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'News created successfully',
    };
  }

  private async checkCategoryIdExists(categoryId: number): Promise<boolean> {
    const category = await this.categoryModel.findByPk(categoryId);
    return !!category;
  }
}
