import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AddChannelDto } from './dto/add-channel.dto';
import { TgChannel } from './telegram-newsletter.model';
import { InjectModel } from '@nestjs/sequelize';
import { DeleteChannelDto } from './dto/delete-channel.dto';
import { ConfigService } from '@nestjs/config';
import { col } from 'sequelize';
import { Telegraf } from 'telegraf';
import { SendApplicationDto } from './dto/send-application.dto';
import { validateRecaptcha } from '../common/utils';

@Injectable()
export class TelegramNewsletterService {
  private readonly BOT_TOKEN: string;
  private readonly BOT: Telegraf;

  constructor(
    @InjectModel(TgChannel) private tgChannelModel: typeof TgChannel,
    private readonly configService: ConfigService,
  ) {
    this.BOT_TOKEN = this.configService.get('NEWSLETTER_BOT_TOKEN');
    this.BOT = new Telegraf(this.BOT_TOKEN);
  }

  public async sendApplication(dto: SendApplicationDto) {
    const { email, phone, url, token } = dto;

    if (!email && !phone)
      throw new HttpException(
        'Email or phone is required',
        HttpStatus.BAD_REQUEST,
      );
    const isCaptchaValid = await validateRecaptcha(token);

    if (!isCaptchaValid)
      throw new HttpException(
        'Your request looks like a bot',
        HttpStatus.FORBIDDEN,
      );

    const userData = `${email ? `Email: ${email}\n` : ''}${phone ? `Phone: ${phone}\n` : ''}`;
    const text = `${userData}URL: ${url}`;
    await this.BOT.telegram.sendMessage('-1002105166723', text, {
      parse_mode: 'Markdown',
      link_preview_options: {
        is_disabled: true,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Application sent successfully',
    };
  }

  // create channel
  public async addChannel(dto: AddChannelDto) {
    await this.tgChannelModel.create({
      channel_id: dto.channelId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Channel added successfully',
    };
  }

  // delete channel
  public async deleteChannel(dto: DeleteChannelDto) {
    const id = parseInt(dto.id);
    const channel = await this.tgChannelModel.findByPk(id);
    if (!channel) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Channel not found' };
    }
    await channel.destroy();
    return {
      statusCode: HttpStatus.OK,
      message: 'Channel deleted successfully',
    };
  }

  public async getChannels() {
    const channels = await this.tgChannelModel.findAll({
      attributes: ['id', [col('channel_id'), 'channelId']],
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Channels fetched successfully',
      data: {
        channels,
      },
    };
  }

  // send newsletter
  public async sendNewsletter(text: string) {
    const channels = await this.tgChannelModel.findAll({
      attributes: ['channel_id'],
    });

    // send newsletter to all channels
    for (const channel of channels) {
      try {
        await this.BOT.telegram.sendMessage(`-${channel.channel_id}`, text, {
          parse_mode: 'MarkdownV2',
        });
      } catch (err) {
        console.error(err);
      }
    }
  }
}
