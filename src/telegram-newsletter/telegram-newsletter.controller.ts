import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { TelegramNewsletterService } from './telegram-newsletter.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { AddChannelDto } from './dto/add-channel.dto';
import { DeleteChannelDto } from './dto/delete-channel.dto';
import { SendApplicationDto } from './dto/send-application.dto';

@Controller('channels')
export class TelegramNewsletterController {
  constructor(
    private readonly telegramNewsletterService: TelegramNewsletterService,
  ) {}

  @Post('send-application')
  @HttpCode(HttpStatus.OK)
  public async sendApplication(@Body() dto: SendApplicationDto) {
    return await this.telegramNewsletterService.sendApplication(dto);
  }

  // @Auth()
  @Get()
  @HttpCode(HttpStatus.OK)
  public async getChannels(@Query('city_id') city_id: string) {
    return await this.telegramNewsletterService.getChannels({
      city_id: city_id ? +city_id : undefined,
    });
  }

  // @Auth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async addChannel(@Body() dto: AddChannelDto) {
    return await this.telegramNewsletterService.addChannel(dto);
  }

  // @Auth()
  @Delete()
  @HttpCode(HttpStatus.OK)
  public async deleteChannel(@Query() dto: DeleteChannelDto) {
    return await this.telegramNewsletterService.deleteChannel(dto);
  }
}
