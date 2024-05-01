import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus, Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetNewsForAdminDto } from './dto/get-news-for-admin.dto';
import { DeleteNewsDto } from './dto/delete-news.dto';
import { GetNewsByFilterDto } from './dto/get-news-by-filter.dto';
import { GetNewsByIdDto } from './dto/get-news-by-id.dto';
import { GetRecommendedNewsDto } from './dto/get-recommended-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Headers } from '@nestjs/common';
import { GetNewsDto } from './dto/get-news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  public async getNews(@Param() dto: GetNewsDto, @Headers() headers: any) {
    console.log(headers['accept-language']);
    return this.newsService.getNews(dto, headers['accept-language']);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getNewsById(@Query() dto: GetNewsByIdDto) {
    return this.newsService.getNewsById(dto);
  }

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

  @Get('news-by-filter')
  @HttpCode(HttpStatus.OK)
  public async getNewsByFilter(@Query() dto: GetNewsByFilterDto) {
    return this.newsService.getNewsByFilter(dto);
  }

  @Get('recommended-news')
  @HttpCode(HttpStatus.OK)
  public async getRecommendedNews(@Query() dto: GetRecommendedNewsDto) {
    return this.newsService.getRecommendedNews(dto);
  }

  @Auth()
  @Put('update')
  @HttpCode(HttpStatus.OK)
  public async updateNews(@Body() dto: UpdateNewsDto) {
    return this.newsService.updateNews(dto);
  }
}
