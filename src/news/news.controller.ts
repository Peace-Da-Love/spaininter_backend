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
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetNewsForAdminDto } from './dto/get-news-for-admin.dto';
import { DeleteNewsDto } from './dto/delete-news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  public async createNews(@Body() dto: CreateNewsDto) {
    return this.newsService.createNews(dto);
  }

  @Auth()
  @Get('get-for-admin')
  @HttpCode(HttpStatus.OK)
  public async getNewsForAdmin(@Query() dto: GetNewsForAdminDto) {
    return this.newsService.getNewsForAdmin(dto);
  }

  @Auth()
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  public async deleteNews(@Query() dto: DeleteNewsDto) {
    return this.newsService.deleteNews(dto);
  }

  @Post('get')
  @HttpCode(HttpStatus.OK)
  public async getNews(@Body() dto: any) {
    console.log(dto);
    return 'ok';
  }
}
