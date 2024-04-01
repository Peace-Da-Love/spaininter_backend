import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteCategoryDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare id: string;
}
