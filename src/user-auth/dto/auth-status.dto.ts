import { IsUUID } from 'class-validator';

export class AuthStatusDto {
  @IsUUID()
  sessionId: string;
}

