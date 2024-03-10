import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Admin } from '../auth/admin.model';
import { NewsTranslations } from './news-translations.model';
import { Category } from '../categories/categories.model';

interface NewsCreationAttrs {
  category_id: number;
  poster_link: string;
  province: string;
  city: string;
  admin_id: number;
}

@Table({ tableName: 'news' })
export class News extends Model<News, NewsCreationAttrs> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare news_id: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: false,
  })
  declare category_id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare poster_link: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare province: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare city: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare views: number;

  @ForeignKey(() => Admin)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare admin_id: number;

  @BelongsTo(() => Admin, 'admin_id')
  declare admin: Admin;

  @BelongsTo(() => Category, 'category_id')
  declare category: Category;

  @HasMany(() => NewsTranslations, 'news_id')
  declare newsTranslations: NewsTranslations[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
