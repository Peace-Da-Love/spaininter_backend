import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteAdminDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare id: number;
}
