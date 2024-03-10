import { IsString, Length } from 'class-validator';

export class AddLangDto {
  @IsString()
  @Length(2, 2)
  declare language_code: string;

  @IsString()
  @Length(3, 50)
  declare language_name: string;
}
