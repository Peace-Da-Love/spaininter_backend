import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { News } from './news.model';
import { NewsTranslations } from './news-translations.model';
import { NewsHashtag } from './news-hashtag.model';
import { NewsController } from './news.controller';
import { LanguagesModule } from '../languages/languages.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { TelegramNewsletterModule } from '../telegram-newsletter/telegram-newsletter.module';
import { GoogleStorageModule } from '../google-storage/google-storage.module';

@Module({
  imports: [
    SequelizeModule.forFeature([News, NewsTranslations, NewsHashtag]),
    LanguagesModule,
    HashtagsModule,
    TelegramNewsletterModule,
    GoogleStorageModule,
  ],
  providers: [NewsService],
  controllers: [NewsController],
})
export class NewsModule {}
