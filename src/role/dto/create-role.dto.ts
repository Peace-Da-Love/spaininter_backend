import { IsString, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(3, 30)
  declare name: string;
}
