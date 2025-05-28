import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetNewsForAdminDto } from './dto/get-news-for-admin.dto';
import { DeleteNewsDto } from './dto/delete-news.dto';
import { GetNewsByIdDto } from './dto/get-news-by-id.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Headers } from '@nestjs/common';
import { GetLatestNewsDto } from './dto/get-latest-news.dto';
import { GetCategoryNewsDto } from './dto/get-category-news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('site/:id')
  @HttpCode(HttpStatus.OK)
  public async getNewsById(
    @Param() dto: GetNewsByIdDto,
    @Headers() headers: any,
  ) {
    return this.newsService.getNewsByIdForSite(dto, headers['accept-language']);
  }

  // @Auth()
  @Get('admin/:id')
  @HttpCode(HttpStatus.OK)
  public async getNewsByIdForAdmin(
    @Param() dto: GetNewsByIdDto,
    @Headers() headers: any,
  ) {
    return this.newsService.getNewsByIdForAdmin(
      dto,
      headers['accept-language'],
    );
  }

  @Get('latest')
  @HttpCode(HttpStatus.OK)
  public async getLatestNews(
    @Query() dto: GetLatestNewsDto,
    @Headers() headers: any,
  ) {
    return this.newsService.getLatestNews(dto, headers['accept-language']);
  }

  @Get('filter')
  @HttpCode(HttpStatus.OK)
  public async filterNews(
    @Query() dto: GetCategoryNewsDto,
    @Headers() headers: any,
  ) {
    return this.newsService.getCategoryNews(dto, headers['accept-language']);
  }

  // @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  public async createNews(@Body() dto: CreateNewsDto) {
    return this.newsService.createNews(dto);
  }

  // @Auth()
  @Get('get-for-admin')
  @HttpCode(HttpStatus.OK)
  public async getNewsForAdmin(@Query() dto: GetNewsForAdminDto) {
    return this.newsService.getNewsForAdmin(dto);
  }

  // @Auth()
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  public async deleteNews(@Query() dto: DeleteNewsDto) {
    return this.newsService.deleteNews(dto);
  }

  // @Auth()
  @Put('update')
  @HttpCode(HttpStatus.OK)
  public async updateNews(@Body() dto: UpdateNewsDto) {
    return this.newsService.updateNews(dto);
  }
}
