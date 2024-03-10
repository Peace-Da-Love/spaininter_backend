import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ITelegramReq } from './types/ITelegramReq';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';
import { Admin } from './admin.model';
import { InjectModel } from '@nestjs/sequelize';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    @InjectModel(Admin) private adminModel: typeof Admin,
  ) {}

  public async login(telegramReq: ITelegramReq) {
    const isTelegramSignatureValid = this.checkTelegramSignature(telegramReq);
    if (!isTelegramSignatureValid) {
      throw new HttpException(
        'Telegram signature is not valid',
        HttpStatus.FORBIDDEN,
      );
    }
    const admin = await this.adminModel.findOne({
      where: { tg_id: telegramReq.id },
    });
    if (!admin) {
      throw new HttpException('User is not an admin', HttpStatus.FORBIDDEN);
    }
    const tokens = await this.tokenService.generateTokens({
      admin_id: admin.id,
    });
    await this.tokenService.saveToken(admin.id, tokens.refresh_token);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: tokens,
    };
  }

  public async register(dto: RegisterAdminDto) {
    const tg_id = dto.tg_id.toString();
    const isAdminExists = await this.checkAdminExists(tg_id);
    if (isAdminExists) {
      throw new HttpException('Admin already exists', HttpStatus.BAD_REQUEST);
    }
    await this.adminModel.create({
      tg_id,
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
    };
  }

  private async checkAdminExists(tg_id: string): Promise<boolean> {
    const admin = await this.adminModel.findOne({
      where: { tg_id },
    });
    return !!admin;
  }

  private checkTelegramSignature(telegramReq: ITelegramReq): boolean {
    const { hash, ...userData } = telegramReq;
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
