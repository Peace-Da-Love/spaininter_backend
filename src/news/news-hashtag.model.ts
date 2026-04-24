import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Hashtag } from '../hashtags/hashtags.model';
import { News } from './news.model';

interface NewsHashtagCreationAttrs {
  news_id: number;
  hashtag_id: number;
}

@Table({ tableName: 'news_hashtags' })
export class NewsHashtag extends Model<NewsHashtag, NewsHashtagCreationAttrs> {
  @ForeignKey(() => News)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare news_id: number;

  @ForeignKey(() => Hashtag)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare hashtag_id: number;
}
