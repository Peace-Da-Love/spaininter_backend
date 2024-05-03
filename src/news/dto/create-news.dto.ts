import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsOptional,
  ArrayMinSize,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNewsDto {
  @IsString()
  @Length(5, 300)
  declare telegramShortText: string;

  @IsNumber()
  category_id: number;

  @IsString()
  @Length(1, 100)
  poster_link: string;

  @IsString()
  @Length(1, 50)
  province: string;

  @IsString()
  @Length(1, 50)
  city: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  ad_link: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateNewsTranslationDto)
  translations: CreateNewsTranslationDto[];
}

export class CreateNewsTranslationDto {
  @IsNumber()
  language_id: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  description: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50000)
  content: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  link: string;
}
