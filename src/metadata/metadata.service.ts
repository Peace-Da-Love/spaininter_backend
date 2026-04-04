import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Hashtag } from '../hashtags/hashtags.model';
import { LanguagesService } from '../languages/languages.service';
import { NewsTranslations } from '../news/news-translations.model';
import { News } from '../news/news.model';
import { col, Sequelize } from 'sequelize';
import { Language } from '../languages/languages.model';
import { GetNewsMetadataDto } from './dto/get-news-metadata.dto';

@Injectable()
export class MetadataService {
  constructor(
    @InjectModel(Hashtag) private hashtagModel: typeof Hashtag,
    @InjectModel(News) private newsModel: typeof News,
    @InjectModel(NewsTranslations)
    private newsTranslationsModel: typeof NewsTranslations,
    private readonly languagesService: LanguagesService,
  ) {}

  public async getNewsMetadataById(dto: GetNewsMetadataDto) {
    const langId = await this.languagesService.findLanguageByName(dto.langCode);

    const news = await this.newsModel.findOne({
      attributes: [
        [col('newsTranslations.title'), 'title'],
        [col('newsTranslations.description'), 'description'],
        [col('poster_link'), 'posterLink'],
        'createdAt',
        'updatedAt',
      ],
      where: {
        news_id: Number(dto.id),
      },
      include: [
        {
          attributes: [],
          model: NewsTranslations,
          where: {
            language_id: langId,
          },
        },
      ],
    });

    const links = await this.newsTranslationsModel.findAll({
      attributes: ['link'],
      where: { news_id: Number(dto.id) },
      include: [{ model: Language, attributes: ['language_code'] }],
    });

    if (!news) throw new HttpException('News not found', HttpStatus.NOT_FOUND);

    return {
      statusCode: HttpStatus.OK,
      message: 'News fetch success',
      data: {
        news,
        links,
      },
    };
  }

  public async getHashtagMetadata() {
    const newsHashtags = await this.hashtagModel.findAll({
      attributes: [
        ['hashtag_name', 'hashtag_name'],
        [
          Sequelize.cast(
            Sequelize.literal('CEIL(COUNT(news_id)::numeric / 8::numeric)'),
            'integer',
          ),
          'pages_count',
        ],
        [
          Sequelize.literal(
            '(SELECT MAX(news.\"updatedAt\") FROM news WHERE news.hashtag_id = \"Hashtag\".\"hashtag_id\")',
          ),
          'last_modified',
        ],
      ],
      include: [
        {
          model: News,
          attributes: [],
        },
      ],
      group: ['Hashtag.hashtag_id', 'Hashtag.hashtag_name'],
    });

    const countNews = await this.newsModel.count();
    const latestNews = {
      hashtag_name: 'latest',
      pages_count: Math.ceil(countNews / 8),
      last_modified: await this.newsModel.max('updatedAt'),
    };

    return {
      statusCode: 200,
      message: 'Hashtags have been found',
      data: [...newsHashtags, latestNews],
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
