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
import { StorageModule } from '../storage/storage.module';
import { User } from '../users/user.model';
import { Admin } from '../auth/admin.model';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forFeature([News, NewsTranslations, NewsHashtag, User, Admin]),
    LanguagesModule,
    HashtagsModule,
    TelegramNewsletterModule,
    StorageModule,
    ConfigModule,
  ],
  providers: [NewsService],
  controllers: [NewsController],
})
export class NewsModule {}
