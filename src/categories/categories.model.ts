import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { CategoryTranslations } from './category-translations.model';
import { News } from '../news/news.model';

interface CategoryCreationAttrs {
  category_name?: string;
}

@Table({ tableName: 'categories' })
export class Category extends Model<Category, CategoryCreationAttrs> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare category_id: number;

  @Unique
  @Column({ type: DataType.STRING(50), allowNull: true })
  declare category_name: string;

  @HasMany(() => CategoryTranslations, 'category_id')
  declare categoryTranslations: CategoryTranslations[];

  @HasMany(() => News, 'category_id')
  declare blogs: News[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
