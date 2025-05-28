import { IsString, IsUrl } from 'class-validator';

export class AddCityLinkDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsString()
  cityId: string;
}
