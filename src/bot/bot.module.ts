import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { telegrafConfig } from '../common/configs';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: telegrafConfig,
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [BotUpdate],
})
export class BotModule {}
