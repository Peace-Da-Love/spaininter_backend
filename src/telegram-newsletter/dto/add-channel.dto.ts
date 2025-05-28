import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class AddChannelDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsNumber()
  declare channelId: number;

  @IsNumber()
  @IsOptional()
  declare city_id: number;
}