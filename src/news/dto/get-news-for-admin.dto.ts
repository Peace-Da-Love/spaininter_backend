import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNewsForAdminDto {
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

  @IsOptional()
  @IsIn(['createdAt'])
  declare sort?: 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  declare order?: 'asc' | 'desc';
}
