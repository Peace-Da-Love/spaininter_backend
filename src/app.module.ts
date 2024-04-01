import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { postgresConfig } from './common/configs';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { BotModule } from './bot/bot.module';
import { GoogleStorageModule } from './google-storage/google-storage.module';
import { MulterModule } from '@nestjs/platform-express';
import { CategoriesModule } from './categories/categories.module';
import { LanguagesModule } from './languages/languages.module';
import { NewsModule } from './news/news.module';
import { MetadataModule } from './metadata/metadata.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: postgresConfig,
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    TokenModule,
    BotModule,
    GoogleStorageModule,
    CategoriesModule,
    LanguagesModule,
    NewsModule,
    MetadataModule,
    RoleModule,
  ],
})
export class AppModule {}
