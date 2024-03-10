import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { News } from './news.model';
import { Language } from '../languages/languages.model';

interface NewsTranslationsCreationAttrs {}

@Table({ tableName: 'news_translations' })
export class NewsTranslations extends Model<
  NewsTranslations,
  NewsTranslationsCreationAttrs
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare news_translation_id: number;

  @ForeignKey(() => News)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: false,
  })
  declare news_id: number;

  @ForeignKey(() => Language)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare language_id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare link: string;

  @BelongsTo(() => News, 'news_id')
  declare admin: News;

  @BelongsTo(() => Language, 'language_id')
  declare language: Language;

  declare createdAt: Date;
  declare updatedAt: Date;
}
