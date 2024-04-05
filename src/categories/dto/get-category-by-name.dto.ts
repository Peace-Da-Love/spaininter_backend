import { IsString, Length } from 'class-validator';

export class GetCategoryByNameDto {
  @IsString()
  @Length(2, 2)
  declare langCode: string;

  @IsString()
  @Length(2, 50)
  declare name: string;
}
