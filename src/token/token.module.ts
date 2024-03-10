import { forwardRef, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Token } from './token.model';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    SequelizeModule.forFeature([Token]),
    JwtModule.register({}),
    ConfigModule,
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
