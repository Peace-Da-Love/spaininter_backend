import { Module } from '@nestjs/common';
import { TelegramNewsletterService } from './telegram-newsletter.service';
import { TgChannel } from './telegram-newsletter.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { TelegramNewsletterController } from './telegram-newsletter.controller';

@Module({
  imports: [SequelizeModule.forFeature([TgChannel]), ConfigModule],
  providers: [TelegramNewsletterService],
  controllers: [TelegramNewsletterController],
  exports: [TelegramNewsletterService],
})
export class TelegramNewsletterModule {}
