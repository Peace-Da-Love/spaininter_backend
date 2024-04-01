import { Body, Controller, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AdminAuth } from '../auth/decorators/admin.decorator';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @AdminAuth()
  @Post()
  public async createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }
}
