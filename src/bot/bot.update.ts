import { Action, Ctx, Message, On, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Update()
export class BotUpdate {
  constructor(private readonly configService: ConfigService) {}

  @On('message')
  async onMessage(@Ctx() ctx: Context, @Message('text') msg: string) {
    const match = msg.match(/\/start (.+)/);
    const loginStart = match ? match[1] : undefined;
    if (loginStart === 'login') {
      const HOST = this.configService.get<string>('HOST');
      await ctx.reply(
        'Are you sure you want to log in?',
        Markup.inlineKeyboard([
          Markup.button.login('Yes', `https://${HOST}/auth`),
          Markup.button.callback('No', `cancel_login`),
        ]),
      );
      return;
    }
  }

  @Action('cancel_login')
  async onCancelLogin(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
  }
}
