import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { News } from './news.model';
import { NewsTranslations } from './news-translations.model';
import { NewsController } from './news.controller';
import { LanguagesModule } from '../languages/languages.module';
import { CategoriesModule } from '../categories/categories.module';
import { TelegramNewsletterModule } from '../telegram-newsletter/telegram-newsletter.module';

@Module({
  imports: [
    SequelizeModule.forFeature([News, NewsTranslations]),
    LanguagesModule,
    CategoriesModule,
    TelegramNewsletterModule,
  ],
  providers: [NewsService],
  controllers: [NewsController],
})
export class NewsModule {}
