import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryTranslationDto)
  translations?: CreateCategoryTranslationDto[];

  @IsOptional()
  @IsString()
  @Length(2, 50)
  category_name?: string;
}

class CreateCategoryTranslationDto {
  @IsNumber()
  @IsNotEmpty()
  declare language_id: number;

  @IsString()
  @Length(2, 50)
  @IsNotEmpty()
  declare category_name: string;
}
