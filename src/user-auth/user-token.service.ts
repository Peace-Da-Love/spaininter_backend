import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { UserToken } from '../users/user-token.model';

@Injectable()
export class UserTokenService {
  private readonly JWT_ACCESS_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;

  constructor(
    @InjectModel(UserToken) private userTokenModel: typeof UserToken,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.JWT_ACCESS_SECRET = this.configService.get<string>(
      'JWT_USER_ACCESS_SECRET',
    );
    this.JWT_REFRESH_SECRET = this.configService.get<string>(
      'JWT_USER_REFRESH_SECRET',
    );
  }

  public async generateTokens(payload: { user_id: number }) {
    const updatedPayload = {
      data: { user_id: payload.user_id, type: 'user' },
    };

    const refresh_token = await this.jwtService.signAsync(updatedPayload, {
      expiresIn: '30d',
      secret: this.JWT_REFRESH_SECRET,
    });

    const access_token = await this.jwtService.signAsync(updatedPayload, {
      expiresIn: '30m',
      secret: this.JWT_ACCESS_SECRET,
    });

    return { refresh_token, access_token };
  }

  public async saveToken(userId: number, refreshToken: string) {
    const existing = await this.userTokenModel.findOne({
      where: { user_id: userId },
    });
    if (existing) {
      existing.refresh_token = refreshToken;
      await existing.save();
      return existing;
    }
    return this.userTokenModel.create({ user_id: userId, refresh_token: refreshToken });
  }

  public async findToken(refreshToken: string) {
    return this.userTokenModel.findOne({ where: { refresh_token: refreshToken } });
  }

  public validateRefreshToken(refreshToken: string) {
    return this.jwtService.verify(refreshToken, { secret: this.JWT_REFRESH_SECRET });
  }

  public async deleteToken(userId: number, refreshToken: string) {
    const token = await this.userTokenModel.findOne({ where: { refresh_token: refreshToken, user_id: userId } });
    if (!token) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }
    await token.destroy();
  }

  public async deleteAllTokens(userId: number) {
    return this.userTokenModel.destroy({ where: { user_id: userId } });
  }
}
