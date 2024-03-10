import {
  Column,
  DataType,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  HasMany,
} from 'sequelize-typescript';
import { CategoryTranslations } from '../categories/category-translations.model';
import { NewsTranslations } from '../news/news-translations.model';

interface LanguageCreationAttrs {
  language_code: string;
  language_name: string;
}

@Table({ tableName: 'languages' })
export class Language extends Model<Language, LanguageCreationAttrs> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare language_id: number;

  @Column({
    type: DataType.STRING(2),
    allowNull: false,
    unique: true,
  })
  declare language_code: string;

  @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
  declare language_name: string;

  @HasMany(() => CategoryTranslations, 'language_id')
  declare categoryTranslations: CategoryTranslations[];

  @HasMany(() => NewsTranslations, 'language_id')
  declare newsTranslation: NewsTranslations[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
