import { ConfigService } from '@nestjs/config';
import { TelegrafModuleOptions } from 'nestjs-telegraf';

export const telegrafConfig = async (
  configService: ConfigService,
): Promise<TelegrafModuleOptions> => ({
  token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
});
