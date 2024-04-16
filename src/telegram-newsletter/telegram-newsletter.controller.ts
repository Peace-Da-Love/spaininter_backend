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

@Controller('channels')
export class TelegramNewsletterController {
  constructor(
    private readonly telegramNewsletterService: TelegramNewsletterService,
  ) {}

  @Auth()
  @Get()
  @HttpCode(HttpStatus.OK)
  public async getChannels() {
    return await this.telegramNewsletterService.getChannels();
  }

  @Auth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async addChannel(@Body() dto: AddChannelDto) {
    return await this.telegramNewsletterService.addChannel(dto);
  }

  @Auth()
  @Delete()
  @HttpCode(HttpStatus.OK)
  public async deleteChannel(@Query() dto: DeleteChannelDto) {
    return await this.telegramNewsletterService.deleteChannel(dto);
  }
}
