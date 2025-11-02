import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateNewsTranslationDto {
  @IsNumber()
  declare languageId: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  declare title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  declare description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50000)
  declare content?: string;
}

export class UpdateNewsTranslationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateNewsTranslationDto)
  declare translations: UpdateNewsTranslationDto[];
}
