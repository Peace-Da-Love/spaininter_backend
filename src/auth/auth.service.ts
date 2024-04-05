import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';
import { Admin } from './admin.model';
import { InjectModel } from '@nestjs/sequelize';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { TokenService } from '../token/token.service';
import { LoginDto } from './dto/login.dto';
import { REQUEST } from '@nestjs/core';
import { DeleteAdminDto } from './dto/delete-admin.dto';
import { GetAdminsDto } from './dto/get-admins.dto';
import { Role } from '../role/role.model';
import { IRole } from '../token/types/IPayload';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    @InjectModel(Admin) private adminModel: typeof Admin,
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(Role) private roleModel: typeof Role,
  ) {}

  public async login(dto: LoginDto) {
    const isTelegramSignatureValid = this.checkTelegramSignature(dto);
    if (!isTelegramSignatureValid) {
      throw new HttpException(
        'Telegram signature is not valid',
        HttpStatus.FORBIDDEN,
      );
    }
    const admin = await this.adminModel.findOne({
      where: { tg_id: dto.id },
    });
    if (!admin) {
      throw new HttpException('User is not an admin', HttpStatus.FORBIDDEN);
    }
    const role = await this.roleModel.findOne({
      where: { id: admin.role_id },
    });
    console.log(role.name);
    const tokens = await this.tokenService.generateTokens({
      admin_id: admin.id,
      role: role.name as IRole,
    });
    await this.tokenService.saveToken(admin.id, tokens.refresh_token);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: tokens,
    };
  }

  public async registerCreator(dto: RegisterAdminDto) {
    const tg_id = dto.tg_id.toString();
    const isAdminExists = await this.checkAdminExists(tg_id);
    if (isAdminExists) {
      throw new HttpException('Admin already exists', HttpStatus.BAD_REQUEST);
    }
    const findRole = await this.roleModel.findOne({
      where: { name: 'creator' },
    });
    await this.adminModel.create({
      tg_id,
      role_id: findRole.id,
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
    };
  }

  public async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const admin = await this.tokenService.findToken(refreshToken);
    const isTokenValid = this.tokenService.validateRefreshToken(refreshToken);
    if (!admin || !isTokenValid) {
      throw new HttpException('Invalid refresh token', HttpStatus.FORBIDDEN);
    }
    const tokens = await this.tokenService.generateTokens({
      admin_id: isTokenValid.data.admin_id,
      role: isTokenValid.data.role,
    });
    await this.tokenService.updateToken(
      isTokenValid.data.admin_id,
      tokens.refresh_token,
      refreshToken,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: tokens,
    };
  }

  public async logOut(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const admin = await this.tokenService.findToken(refreshToken);
    if (!admin) {
      throw new HttpException('Invalid refresh token', HttpStatus.FORBIDDEN);
    }
    const isTokenValid = this.tokenService.validateRefreshToken(refreshToken);
    await this.tokenService.deleteToken(
      isTokenValid.data.admin_id,
      refreshToken,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
    };
  }

  public async getAdmins(dto: GetAdminsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const offset = (page - 1) * limit;

    const admins = await this.adminModel.findAll({
      limit,
      offset,
      attributes: ['id', 'tg_id', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    const adminsCount = await this.adminModel.count();
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        count: adminsCount,
        admins,
      },
    };
  }

  public async deleteAdmin(dto: DeleteAdminDto) {
    const admin = await this.adminModel.findOne({
      where: { id: dto.id },
    });
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    await this.tokenService.deleteAllTokens(admin.id);
    await admin.destroy();
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
    };
  }

  private async checkAdminExists(tg_id: string): Promise<boolean> {
    const admin = await this.adminModel.findOne({
      where: { tg_id },
    });
    return !!admin;
  }

  private checkTelegramSignature(dto: LoginDto): boolean {
    const { hash, ...userData } = dto;
    const BOT_TOKEN = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    // create a hash of a secret that both you and Telegram know. In this case, it is your bot token
    const secretKey = createHash('sha256').update(BOT_TOKEN).digest();

    // this is the data to be authenticated i.e. telegram user id, first_name, last_name etc.
    const dataCheckString = Object.keys(userData)
      .sort()
      .map((key) => `${key}=${userData[key]}`)
      .join('\n');

    // run a cryptographic hash function over the data to be authenticated and the secret
    const hmac = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // compare the hash that you calculate on your side (hmac) with what Telegram sends you (hash) and return the result
    return hmac === hash;
  }
}
