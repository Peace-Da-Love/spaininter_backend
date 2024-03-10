import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { News } from './news.model';
import { NewsTranslations } from './news-translations.model';
import { NewsController } from './news.controller';
import { Category } from '../categories/categories.model';
import { LanguagesModule } from '../languages/languages.module';

@Module({
  imports: [
    SequelizeModule.forFeature([News, NewsTranslations, Category]),
    LanguagesModule,
  ],
  providers: [NewsService],
  controllers: [NewsController],
})
export class NewsModule {}
