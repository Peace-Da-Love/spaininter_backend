import { IsString } from 'class-validator';

export class HandoffDto {
  @IsString()
  authToken: string;
}
