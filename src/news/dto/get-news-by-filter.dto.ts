import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNewsByFilterDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare page: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare limit: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  declare search: string;

  @IsString()
  @Length(2, 2)
  declare languageCode: string;
}
