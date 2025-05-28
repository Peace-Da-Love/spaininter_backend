import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { TgChannel } from '../telegram-newsletter/telegram-newsletter.model';

@Table({ tableName: 'cities', timestamps: false }) // Отключаем автоматические timestamps
export class City extends Model<City> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  photo_url: string;

  @Column({ type: DataType.JSON, allowNull: true, defaultValue: [] })
  links: { id: string; name: string; url: string }[];
  
  @HasMany(() => TgChannel)
  channels: TgChannel[];

  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;

  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt: Date;
}
