import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNewsDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare id: string;
}
