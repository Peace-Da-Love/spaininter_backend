import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { City } from '../cities/cities.entity';

interface TgChannelCreationAttrs {
  name: string;
  url: string;
  channel_id: number;
  city_id?: number;
}

@Table({ tableName: 'tg_channels' })
export class TgChannel extends Model<TgChannel, TgChannelCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  url: string;

  @Column({ type: DataType.BIGINT, allowNull: false, unique: true })
  declare channel_id: number;

  @ForeignKey(() => City)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare city_id: number;

  @BelongsTo(() => City)
  declare city: City;

  declare createdAt: Date;
  declare updatedAt: Date;
}