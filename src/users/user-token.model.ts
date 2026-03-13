import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'users_tokens' })
export class UserToken extends Model<UserToken> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare user_id: number;

  @Column(DataType.TEXT)
  declare refresh_token: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}
