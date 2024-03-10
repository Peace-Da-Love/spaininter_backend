import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { AddLangDto } from './dto/add-lang.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Auth()
  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  public addLanguage(@Body() dto: AddLangDto) {
    return this.languagesService.addLanguage(dto);
  }

  @Get()
  public getAllLanguages() {
    return this.languagesService.getAllLanguages();
  }
}
