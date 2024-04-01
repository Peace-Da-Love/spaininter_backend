import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from '../role/role.model';
import { Token } from '../token/token.model';
import { News } from '../news/news.model';

interface AdminCreationAttrs {
  tg_id: string;
  role_id: number;
}

@Table({ tableName: 'admins' })
export class Admin extends Model<Admin, AdminCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare tg_id: string;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER })
  declare role_id: number;

  @BelongsTo(() => Role)
  declare role: Role;

  @HasMany(() => Token, 'admin_id')
  declare tokens: Token[];

  @HasMany(() => News, 'admin_id')
  declare news: News[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
