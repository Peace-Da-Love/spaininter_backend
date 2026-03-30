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
import { User } from '../users/user.model';

interface NewsCreationAttrs {
  category_id: number;
  poster_link: string;
  province: string;
  city: string;
  admin_id?: number | null;
  user_id?: number | null;
  status?: NewsStatus;
  ad_link?: string | null;
}

export type NewsStatus = 'pending' | 'approved' | 'rejected';

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

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare province: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare city: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare views: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare ad_link: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: NewsStatus;

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // allowNull should be true for SET NULL// or 'NO ACTION'
  })
  declare admin_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number;

  @BelongsTo(() => Admin, {
    foreignKey: 'admin_id',
    targetKey: 'id',
    onDelete: 'SET NULL',
  })
  declare admin: Admin;

  @BelongsTo(() => User, {
    foreignKey: 'user_id',
    targetKey: 'id',
    onDelete: 'SET NULL',
  })
  declare user: User;

  @BelongsTo(() => Category, 'category_id')
  declare category: Category;

  @HasMany(() => NewsTranslations, 'news_id')
  declare newsTranslations: NewsTranslations[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
