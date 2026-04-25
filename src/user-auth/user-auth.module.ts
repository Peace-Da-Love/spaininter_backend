import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';

import { UserAuthController } from './user-auth.controller';
import { UserTokenController } from './user-token.controller';
import { UserController } from './user.controller';
import { UserAuthService } from './user-auth.service';
import { UserTokenService } from './user-token.service';
import { TwitrisAuthProvider } from './twitris-auth.provider';
import { UserJwtStrategy } from './strategy/user-jwt.strategy';
import { UserJwtGuard } from './guards/user-jwt.guard';
import { AuthHandoffService } from './auth-handoff.service';

import { User } from '../users/user.model';
import { UserToken } from '../users/user-token.model';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    SequelizeModule.forFeature([User, UserToken]),
    JwtModule.register({}),
  ],
  controllers: [UserAuthController, UserTokenController, UserController],
  providers: [
    UserAuthService,
    UserTokenService,
    TwitrisAuthProvider,
    AuthHandoffService,
    UserJwtStrategy,
    UserJwtGuard,
  ],
})
export class UserAuthModule {}
