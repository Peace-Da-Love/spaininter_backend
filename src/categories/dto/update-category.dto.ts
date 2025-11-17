import { IsNumber, IsString, Length, Min, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsNumber()
  @Min(1)
  declare categoryId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  declare languageId?: number;

  @IsString()
  @Length(2, 50)
  declare categoryName: string;
}
