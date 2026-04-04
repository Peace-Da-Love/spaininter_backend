import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Admin } from '../../auth/admin.model';
import { Token } from '../../token/token.model';
import { Language } from '../../languages/languages.model';
import { Hashtag } from '../../hashtags/hashtags.model';
import { NewsTranslations } from '../../news/news-translations.model';
import { News } from '../../news/news.model';
import { Role } from '../../role/role.model';
import { TgChannel } from '../../telegram-newsletter/telegram-newsletter.model';
import { City } from 'src/cities/cities.entity';
import { User } from '../../users/user.model';

export const postgresConfig = async (
  configService: ConfigService,
): Promise<SequelizeModuleOptions> => ({
  dialect: 'postgres',
  host: configService.get<string>('POSTGRES_HOST'),
  port: configService.get<number>('POSTGRES_PORT'),
  username: configService.get<string>('POSTGRES_USER'),
  password: configService.get<string>('POSTGRES_PASSWORD'),
  database: configService.get<string>('POSTGRES_DB'),
  autoLoadModels: true,
  models: [
    Admin,
    Token,
    Language,
    Hashtag,
    City,
    NewsTranslations,
    News,
    User,
    Role,
    TgChannel,
  ],
});
