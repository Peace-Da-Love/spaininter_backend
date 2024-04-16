import { IsNumber } from 'class-validator';

export class AddChannelDto {
  @IsNumber()
  declare channelId: number;
}
