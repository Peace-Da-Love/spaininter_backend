import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from './admin.model';
import { TokenModule } from '../token/token.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { Role } from '../role/role.model';

@Module({
  imports: [
    forwardRef(() => TokenModule),
    ConfigModule,
    SequelizeModule.forFeature([Admin, Role]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
