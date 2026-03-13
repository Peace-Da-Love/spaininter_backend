import {
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare tg_id: string;

  @Column(DataType.STRING)
  declare username?: string;

  @Column(DataType.STRING)
  declare first_name?: string;

  @Column(DataType.STRING)
  declare last_name?: string;

  @Column(DataType.STRING)
  declare photo_url?: string;

  @Column(DataType.STRING)
  declare gift_background?: string;

  @Column(DataType.STRING)
  declare gift_pattern?: string;

  @Column(DataType.STRING)
  declare gift_model?: string;

  @Column(DataType.STRING)
  declare gift_rarity?: string;

  @Column(DataType.DATE)
  declare gift_updated_at?: Date; 

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  declare createdAt: Date;
  declare updatedAt: Date;
}
