import { Module } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from '../categories/categories.model';
import { CategoryTranslations } from '../categories/category-translations.model';
import { LanguagesModule } from '../languages/languages.module';
import { MetadataController } from './metadata.controller';
import { NewsTranslations } from '../news/news-translations.model';
import { News } from '../news/news.model';

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
  providers: [MetadataService],
  controllers: [MetadataController],
})
export class MetadataModule {}
