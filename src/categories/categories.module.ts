import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { CategoryTranslations } from './category-translations.model';
import { CategoriesController } from './categories.controller';
import { LanguagesModule } from '../languages/languages.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Category, CategoryTranslations]),
    LanguagesModule,
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
