import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCategoryNewsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare page: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare limit: number;

  @IsString()
  @Length(2, 50)
  declare category: string;
}
