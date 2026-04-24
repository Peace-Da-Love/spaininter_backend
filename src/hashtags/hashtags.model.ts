import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { News } from '../news/news.model';
import { NewsHashtag } from '../news/news-hashtag.model';

interface HashtagCreationAttrs {
  hashtag_name?: string;
}

@Table({ tableName: 'hashtags' })
export class Hashtag extends Model<Hashtag, HashtagCreationAttrs> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare hashtag_id: number;

  @Unique
  @Column({ type: DataType.STRING(50), allowNull: true })
  declare hashtag_name: string;

  @HasMany(() => News, 'hashtag_id')
  declare blogs: News[];

  @BelongsToMany(() => News, () => NewsHashtag)
  declare news: News[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
