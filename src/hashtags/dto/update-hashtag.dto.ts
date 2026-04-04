import { IsNumber, IsString, Length, Min } from 'class-validator';

export class UpdateHashtagDto {
  @IsNumber()
  @Min(1)
  declare hashtagId: number;

  @IsString()
  @Length(2, 50)
  declare hashtagName: string;
}
