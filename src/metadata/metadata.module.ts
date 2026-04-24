import { Module } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Hashtag } from '../hashtags/hashtags.model';
import { LanguagesModule } from '../languages/languages.module';
import { MetadataController } from './metadata.controller';
import { NewsTranslations } from '../news/news-translations.model';
import { News } from '../news/news.model';
import { NewsHashtag } from '../news/news-hashtag.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Hashtag, News, NewsHashtag, NewsTranslations]),
    LanguagesModule,
  ],
  providers: [MetadataService],
  controllers: [MetadataController],
})
export class MetadataModule {}
