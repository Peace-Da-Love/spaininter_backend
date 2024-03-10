import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryTranslationDto)
  translations: CreateCategoryTranslationDto[];
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
