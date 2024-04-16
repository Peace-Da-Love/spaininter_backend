import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface TgChannelCreationAttrs {
  channel_id: number;
}

@Table({ tableName: 'tg_channels' })
export class TgChannel extends Model<TgChannel, TgChannelCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.BIGINT, allowNull: false, unique: true })
  declare channel_id: number;

  declare createdAt: Date;
  declare updatedAt: Date;
}
