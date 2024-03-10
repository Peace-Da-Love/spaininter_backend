import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Token } from '../token/token.model';
import { News } from '../news/news.model';

interface AdminCreationAttrs {
  tg_id: string;
}

@Table({ tableName: 'admins' })
export class Admin extends Model<Admin, AdminCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare tg_id: string;

  @HasMany(() => Token, 'admin_id')
  declare tokens: Token[];

  @HasMany(() => News, 'admin_id')
  declare news: News[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
