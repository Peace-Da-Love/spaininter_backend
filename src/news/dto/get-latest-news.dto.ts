import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLatestNewsDto {
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
}
