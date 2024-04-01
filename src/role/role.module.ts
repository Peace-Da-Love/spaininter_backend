import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './role.model';
import { RoleController } from './role.controller';

@Module({
  imports: [SequelizeModule.forFeature([Role])],
  providers: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
