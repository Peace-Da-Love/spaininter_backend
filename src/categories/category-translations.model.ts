import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Language } from '../languages/languages.model';
import { Category } from './categories.model';

interface CategoryTranslationsCreationAttrs {
  category_id: number;
  language_id: number;
  category_name: string;
}

@Table({ tableName: 'category_translations' })
export class CategoryTranslations extends Model<
  CategoryTranslations,
  CategoryTranslationsCreationAttrs
> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare translation_id: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare category_id: number;

  @ForeignKey(() => Language)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare language_id: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare category_name: string;

  @BelongsTo(() => Language, 'language_id')
  declare language: Language;

  @BelongsTo(() => Category, 'category_id')
  declare category: Category;

  declare createdAt: Date;
  declare updatedAt: Date;
}
