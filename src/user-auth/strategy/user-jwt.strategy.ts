import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IUserJwtPayload } from '../types/IUserJwtPayload';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_USER_ACCESS_SECRET'),
    });
  }

  async validate(payload: IUserJwtPayload) {
    if (!payload || !payload.data || payload.data.type !== 'user') {
      return null;
    }
    return payload.data;
  }
}
