import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { AdminAuth } from '../auth/decorators/admin.decorator';
import { AnyAuth } from '../auth/decorators/any-auth.decorator';
import { GetNewsForAdminDto } from './dto/get-news-for-admin.dto';
import { DeleteNewsDto } from './dto/delete-news.dto';
import { GetNewsByIdDto } from './dto/get-news-by-id.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { UpdateNewsTranslationDto } from './dto/update-news-translations.dto';
import { GetLatestNewsDto } from './dto/get-latest-news.dto';
import { GetHashtagNewsDto } from './dto/get-hashtag-news.dto';
import { UpdateNewsStatusDto } from './dto/update-news-status.dto';
import { ReviewNewsDto } from './dto/review-news.dto';
import { TranslateMissingNewsDto } from './dto/translate-missing-news.dto';
import { Headers } from '@nestjs/common';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';

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

  @Auth()
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
    @Query() dto: GetHashtagNewsDto,
    @Headers() headers: any,
  ) {
    return this.newsService.getHashtagNews(dto, headers['accept-language']);
  }

  @UseGuards(UserJwtGuard)
  @Get('my')
  @HttpCode(HttpStatus.OK)
  public async getMyNews(@Query() dto: GetNewsForAdminDto) {
    return this.newsService.getMyNewsForUser(dto);
  }

  @AnyAuth()
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

  @AdminAuth()
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  public async deleteNews(@Query() dto: DeleteNewsDto) {
    return this.newsService.deleteNews(dto);
  }

  @Auth()
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  public async updateNewsStatus(
    @Param('id') id: string,
    @Body() dto: UpdateNewsStatusDto,
  ) {
    return this.newsService.updateNewsStatus(+id, dto.status);
  }

  @Auth()
  @Patch('admin/:id')
  @HttpCode(HttpStatus.OK)
  public async reviewNews(@Param('id') id: string, @Body() dto: ReviewNewsDto) {
    return this.newsService.reviewNews(+id, dto);
  }

  @Auth()
  @Post('admin/translate-missing')
  @HttpCode(HttpStatus.OK)
  public async translateMissingDraftNews(@Body() dto: TranslateMissingNewsDto) {
    return this.newsService.translateMissingDraftNews(dto);
  }

  @Auth()
  @Post('admin/:id/translate-missing')
  @HttpCode(HttpStatus.OK)
  public async translateMissingNews(
    @Param('id') id: string,
    @Body() dto: TranslateMissingNewsDto,
  ) {
    return this.newsService.translateMissingNews(+id, dto);
  }

  @Auth()
  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
    }),
  )
  @HttpCode(HttpStatus.OK)
  public async updateNewsPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('🔍 Updating photo for newsId:', id);
    console.log(
      '🔍 Uploaded file:',
      file ? { filename: file.filename, size: file.size } : 'No file',
    );

    if (!file) {
      throw new HttpException('No photo file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const uploadResult = await this.newsService.uploadPosterFile(file);
      const posterLink = uploadResult.url;
      console.log('🔍 File uploaded, new posterLink:', posterLink);

      const updateDto: UpdateNewsDto = {
        newsId: +id,
        posterLink: posterLink,
      };

      return this.newsService.updateNews(updateDto);
    } catch (error) {
      console.error('🔍 Error uploading file:', error);
      throw new HttpException('Failed to upload photo', HttpStatus.BAD_REQUEST);
    }
  }

  @Auth()
  @Patch(':id/translations')
  @HttpCode(HttpStatus.OK)
  public async updateNewsTranslations(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    console.log('🔍 Updating translations for newsId:', id);
    console.log('🔍 Raw request body:', body);
    console.log('🔍 Body type:', typeof body);
    console.log('🔍 Body is array:', Array.isArray(body));

    // Фронтенд отправляет массив напрямую
    let translations: UpdateNewsTranslationDto[];
    if (Array.isArray(body)) {
      translations = body;
    } else {
      throw new HttpException(
        'Request body must be an array of translations',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Ручная валидация
    if (translations.length === 0) {
      throw new HttpException(
        'Translations array cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const translation of translations) {
      if (
        !translation.languageId ||
        typeof translation.languageId !== 'number'
      ) {
        throw new HttpException(
          'Each translation must have a valid languageId',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    console.log('🔍 Validated translations:', translations);

    return this.newsService.updateNewsTranslations(+id, translations);
  }

  @Auth()
  @Delete(':id/translations/:languageId')
  @HttpCode(HttpStatus.OK)
  public async deleteNewsTranslation(
    @Param('id') id: string,
    @Param('languageId') languageId: string,
  ) {
    const newsId = Number(id);
    const langId = Number(languageId);
    if (Number.isNaN(newsId) || Number.isNaN(langId)) {
      throw new HttpException(
        'Invalid id or languageId',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.newsService.deleteNewsTranslation(newsId, langId);
  }
}
