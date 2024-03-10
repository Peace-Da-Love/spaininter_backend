import { IsNumber } from 'class-validator';

export class RegisterAdminDto {
  @IsNumber()
  declare tg_id: number;
}
