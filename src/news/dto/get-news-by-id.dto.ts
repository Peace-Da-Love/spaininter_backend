import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNewsByIdDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare id: string;
}
