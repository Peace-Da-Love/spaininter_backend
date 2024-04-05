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
import { CategoriesService } from './categories.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { GetCategoryById } from './dto/get-category-by-id';
import { GetCategoriesByLangCodeDto } from './dto/get-categories-by-lang-code.dto';
import { GetCategoryByNameDto } from './dto/get-category-by-name.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  public async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Auth()
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  public async deleteCategory(@Query() dto: DeleteCategoryDto) {
    return this.categoriesService.deleteCategory(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get('category')
  @HttpCode(HttpStatus.OK)
  public async getCategoryById(@Query() dto: GetCategoryById) {
    return this.categoriesService.getCategoryById(dto);
  }

  @Get('category-translations')
  @HttpCode(HttpStatus.OK)
  public async getCategoryTranslations(
    @Query() dto: GetCategoriesByLangCodeDto,
  ) {
    return this.categoriesService.getCategoryTranslations(dto);
  }

  @Get('get-by-name')
  @HttpCode(HttpStatus.OK)
  public async getCategoryByName(@Query() dto: GetCategoryByNameDto) {
    return this.categoriesService.getCategoryByName(dto);
  }
}
