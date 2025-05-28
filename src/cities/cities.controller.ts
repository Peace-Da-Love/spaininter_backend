import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Delete,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CitiesService } from './cities.service';
import { AddCityLinkDto } from './dto/add-city-link.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const city = await this.citiesService.findOne(+id);
    if (!city) {
      throw new HttpException('City not found', HttpStatus.NOT_FOUND);
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'City fetched successfully',
      data: city,
    };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/cities',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      //   fileFilter: (req, file, cb) => {
      //     console.log('File MIME type:', file.mimetype);
      //     if (!file.mimetype.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      //       return cb(new Error('Only JPG, JPEG, PNG, GIF, WEBP files are allowed!'), false);
      //     }
      //     cb(null, true);
      //   },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createCity(
    @Body('name') name: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoUrl = file ? `/uploads/cities/${file.filename}` : null;
    return this.citiesService.create({ name, photo_url: photoUrl });
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/cities',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('File MIME type:', file.mimetype);
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new Error('Only JPG, JPEG, PNG, GIF, WEBP files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateCity(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoUrl = file ? `/Uploads/cities/${file.filename}` : null;
    return this.citiesService.update(+id, { photo_url: photoUrl });
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('hasPhoto') hasPhoto?: string,
    @Query('search') search?: string, // Новый параметр
  ) {
    const cities = await this.citiesService.findAll({
      page: +page,
      limit: +limit,
      hasPhoto: hasPhoto === 'true',
      search,
    });
    return cities;
  }

  @Post('links')
  @HttpCode(HttpStatus.OK)
  async addLink(@Body() dto: AddCityLinkDto) {
    return await this.citiesService.addLink(dto);
  }

  @Delete(':cityId/links')
  @HttpCode(HttpStatus.OK)
  async deleteLink(
    @Param('cityId') cityId: string,
    @Query('linkId') linkId: string,
  ) {
    return await this.citiesService.deleteLink({ cityId, linkId });
  }
}
