import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRecommendedNewsDto {
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

  @IsString()
  @Length(2, 2)
  declare languageCode: string;
}
