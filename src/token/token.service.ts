import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Token } from './token.model';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { ITokens } from './types/ITokens';
import { IPayload } from './types/IPayload';

@Injectable()
export class TokenService {
  private readonly JWT_ACCESS_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;

  constructor(
    @InjectModel(Token) private tokenModel: typeof Token,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.JWT_ACCESS_SECRET =
      this.configService.get<string>('JWT_ACCESS_SECRET');
    this.JWT_REFRESH_SECRET =
      this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  public generateTokens = async (payload: IPayload): Promise<ITokens> => {
    const updatedPayload = {
      data: {
        admin_id: payload.admin_id,
      },
    };

    const refresh_token = await this.jwtService.signAsync(updatedPayload, {
      expiresIn: '15d',
      secret: this.JWT_REFRESH_SECRET,
    });

    const access_token = await this.jwtService.signAsync(updatedPayload, {
      expiresIn: '30m',
      secret: this.JWT_ACCESS_SECRET,
    });

    return {
      refresh_token,
      access_token,
    };
  };

  public saveToken = async (adminId: number, refreshToken: string) => {
    return this.tokenModel.create({
      admin_id: adminId,
      refresh_token: refreshToken,
    });
  };

  public updateToken = async (
    adminId: number,
    newRefreshToken: string,
    oldRefreshToken: string,
  ) => {
    const token = await this.tokenModel.findOne({
      where: { admin_id: adminId, refresh_token: oldRefreshToken },
    });
    token.refresh_token = newRefreshToken;
    await token.save();
  };

  public validateRefreshToken = (refreshToken: string) => {
    return this.jwtService.verify(refreshToken, {
      secret: this.JWT_REFRESH_SECRET,
    });
  };

  public findToken = async (refreshToken: string) => {
    return this.tokenModel.findOne({
      where: { refresh_token: refreshToken },
    });
  };

  public deleteToken = async (adminId: number, refreshToken: string) => {
    const token = await this.tokenModel.findOne({
      where: { refresh_token: refreshToken, admin_id: adminId },
    });

    if (!token) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }

    await token.destroy();
  };
}
