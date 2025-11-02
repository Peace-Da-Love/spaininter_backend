import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateNewsTranslationDto } from './update-news-translations.dto';

export class UpdateNewsTranslationsArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateNewsTranslationDto)
  declare translations: UpdateNewsTranslationDto[];
}
