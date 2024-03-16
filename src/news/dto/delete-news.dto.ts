import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteNewsDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare news_id: number;
}
