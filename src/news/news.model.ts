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
  ad_link: string;
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

  @Column({ type: DataType.STRING, allowNull: false })
  declare poster_link: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare province: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare city: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare views: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare ad_link: string;

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // allowNull should be true for SET NULL// or 'NO ACTION'
  })
  declare admin_id: number;

  @BelongsTo(() => Admin, {
    foreignKey: 'admin_id',
    targetKey: 'id',
    onDelete: 'SET NULL',
  })
  declare admin: Admin;

  @BelongsTo(() => Category, 'category_id')
  declare category: Category;

  @HasMany(() => NewsTranslations, 'news_id')
  declare newsTranslations: NewsTranslations[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
