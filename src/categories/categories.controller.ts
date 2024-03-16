import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  public async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getCategories() {
    return this.categoriesService.getCategories();
  }
}
