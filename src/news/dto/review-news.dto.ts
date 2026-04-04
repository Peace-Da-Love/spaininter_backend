import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewNewsTranslationDto {
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

  @IsOptional()
  @IsString()
  @Length(1, 100)
  link?: string;
}

export class ReviewNewsDto {
  @IsOptional()
  @IsNumber()
  hashtag_id?: number;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'hashtag_name must contain only lowercase letters, numbers, and underscores',
  })
  hashtag_name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  poster_link?: string;

  @IsOptional()
  @ValidateIf((o) => o.province !== null)
  @IsString()
  @Length(0, 50)
  province?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.city !== null)
  @IsString()
  @Length(0, 50)
  city?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.ad_link !== null)
  @IsString()
  @Length(1, 100)
  ad_link?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReviewNewsTranslationDto)
  translations?: ReviewNewsTranslationDto[];
}
