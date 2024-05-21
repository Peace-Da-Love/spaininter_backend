import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class SendApplicationDto {
  @IsOptional()
  @IsEmail()
  declare email: string;

  @IsOptional()
  @IsPhoneNumber()
  declare phone: string;

  @IsUrl()
  declare url: string;

  @IsString()
  declare token: string;
}
