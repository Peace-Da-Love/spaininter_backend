import { IsNumber, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNewsDto {
  @IsString()
  @Length(2, 2)
  declare languageCode: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare id: string;
}
