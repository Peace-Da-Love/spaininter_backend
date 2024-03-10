import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CategoryTranslations } from './category-translations.model';
import { News } from '../news/news.model';

interface CategoryCreationAttrs {}

@Table({ tableName: 'categories' })
export class Category extends Model<Category, CategoryCreationAttrs> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare category_id: number;

  @HasMany(() => CategoryTranslations, 'category_id')
  declare categoryTranslations: CategoryTranslations[];

  @HasMany(() => News, 'category_id')
  declare blogs: News[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
