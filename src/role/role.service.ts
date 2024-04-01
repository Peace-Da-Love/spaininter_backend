import { Injectable } from '@nestjs/common';
import { Role } from './role.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role) private roleModel: typeof Role) {}

  public async createRole(role: CreateRoleDto) {
    return await this.roleModel.create(role);
  }
}
