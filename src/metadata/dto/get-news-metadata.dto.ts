import { IsNumber, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNewsMetadataDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  declare id: string;

  @IsString()
  @Length(2, 2)
  declare langCode: string;
}
