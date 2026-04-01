import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
  IsDefined,
} from 'class-validator';

export class UpdateNewsDto {
  @IsNumber()
  declare newsId: number;

  @ValidateIf((o) => o.title !== undefined || o.description !== undefined || o.content !== undefined)
  @IsDefined({ message: 'languageId is required when updating translations (title, description, or content)' })
  @IsNumber()
  declare languageId?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  declare posterLink?: string;

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

  @IsOptional()
  @IsString()
  @Length(0, 100)
  declare adLink?: string;
}
