import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { CategoryTranslations } from './category-translations.model';
import { CategoriesController } from './categories.controller';
import { LanguagesModule } from '../languages/languages.module';
import { News } from '../news/news.model';
import { NewsTranslations } from '../news/news-translations.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Category,
      CategoryTranslations,
      News,
      NewsTranslations,
    ]),
    LanguagesModule,
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
