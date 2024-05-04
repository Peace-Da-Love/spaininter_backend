import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateNewsDto {
  @IsNumber()
  declare newsId: number;

  @IsNumber()
  declare languageId: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  declare title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  declare description: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50000)
  declare content: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  declare adLink: string;
}
