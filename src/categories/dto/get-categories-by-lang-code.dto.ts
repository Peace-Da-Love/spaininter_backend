import { IsString, Length } from 'class-validator';

export class GetCategoriesByLangCodeDto {
  @IsString()
  @Length(2, 2)
  declare langCode: string;
}
