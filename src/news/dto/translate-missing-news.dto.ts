import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TranslateMissingNewsSourceDto {
  @IsNumber()
  language_id: number;

  @IsString()
  @Length(2, 10)
  language_code: string;

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
}

export class TranslateMissingNewsTargetDto {
  @IsNumber()
  language_id: number;

  @IsString()
  @Length(2, 10)
  language_code: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['title', 'description', 'content'], { each: true })
  fields: Array<'title' | 'description' | 'content'>;
}

export class TranslateMissingNewsDto {
  @ValidateNested()
  @Type(() => TranslateMissingNewsSourceDto)
  source: TranslateMissingNewsSourceDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TranslateMissingNewsTargetDto)
  targets: TranslateMissingNewsTargetDto[];
}
