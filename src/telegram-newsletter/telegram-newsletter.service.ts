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
import { City } from '../cities/cities.entity';

@Injectable()
export class TelegramNewsletterService {
  private readonly BOT_TOKEN: string;
  private readonly BOT: Telegraf;

  constructor(
    @InjectModel(TgChannel) private tgChannelModel: typeof TgChannel,
    private readonly configService: ConfigService,
  ) {
    this.BOT_TOKEN = this.configService.get('NEWS_BOT_TOKEN');
    this.BOT = new Telegraf(this.BOT_TOKEN);
  }

  async sendApplication(dto: SendApplicationDto) {
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

  async addChannel(dto: AddChannelDto) {
    const channel = await this.tgChannelModel.create({
      name: dto.name,
      url: dto.url,
      channel_id: dto.channelId,
      city_id: dto.city_id,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Channel added successfully',
      data: channel,
    };
  }

  async deleteChannel(dto: DeleteChannelDto) {
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

  async getChannels({ city_id }: { city_id?: number } = {}) {
    const where = city_id ? { city_id } : {};
    const channels = await this.tgChannelModel.findAll({
      where,
      attributes: [
        'id',
        'name',
        'url',
        [col('channel_id'), 'channelId'],
        'city_id',
      ],
      include: [{ model: City }],
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Channels fetched successfully',
      data: {
        channels,
      },
    };
  }

  async sendNewsletter(text: string) {
    const channels = await this.tgChannelModel.findAll({
      attributes: ['channel_id'],
    });

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
