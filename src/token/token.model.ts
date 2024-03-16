import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Admin } from '../auth/admin.model';

interface TokenCreationAttrs {
  admin_id: number;
  refresh_token: string;
}

@Table({ tableName: 'admins_tokens' })
export class Token extends Model<Token, TokenCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => Admin)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: false })
  declare admin_id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: false })
  declare refresh_token: string;

  @BelongsTo(() => Admin, 'admin_id')
  declare admin: Admin;

  declare createdAt: Date;
  declare updatedAt: Date;
}
