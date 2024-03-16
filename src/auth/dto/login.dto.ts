import { IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  hash: string;

  @IsString()
  id: string;

  @IsString()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  photo_url: string;
}
