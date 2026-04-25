import { IsString, Length } from 'class-validator';

export class CreateHashtagDto {
  @IsString()
  @Length(2, 50)
  hashtag_name: string;
}
