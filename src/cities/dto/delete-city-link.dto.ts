import { IsString } from 'class-validator';

export class DeleteCityLinkDto {
  @IsString()
  cityId: string;

  @IsString()
  linkId: string;
}