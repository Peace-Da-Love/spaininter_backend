import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { createHmac, timingSafeEqual } from 'crypto';
import { User } from '../users/user.model';
import { TwitrisAuthDto } from './dto/twitris-auth.dto';

@Injectable()
export class TwitrisAuthProvider {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  private calcTelegramInitDataHash(
    dataCheckString: string,
    botToken: string,
  ): string {
    // Telegram Mini App spec:
    // secret_key = HMAC_SHA256(<bot_token>, "WebAppData")
    // hash = hex(HMAC_SHA256(data_check_string, secret_key))
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    return createHmac('sha256', new Uint8Array(secretKey))
      .update(dataCheckString)
      .digest('hex');
  }

  private safeHexEqual(expectedHex: string, receivedHex?: string): boolean {
    if (!receivedHex) return false;
    if (
      !/^[0-9a-f]{64}$/i.test(expectedHex) ||
      !/^[0-9a-f]{64}$/i.test(receivedHex)
    ) {
      return false;
    }

    const expected = new Uint8Array(Buffer.from(expectedHex, 'hex'));
    const received = new Uint8Array(Buffer.from(receivedHex, 'hex'));
    return timingSafeEqual(expected, received);
  }

  private verifyTelegramInitData(initData: string): {
    ok: boolean;
    dataCheckString: string;
    expectedHash: string;
    receivedHash?: string;
    validationMode: 'no-signature' | 'with-signature';
    paramKeys: string[];
    warnings: string[];
    authDate?: number;
    telegramUser?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    };
  } {
    const params = new URLSearchParams(initData);
    const receivedHash = params.get('hash') ?? undefined;
    const hasSignature = params.has('signature');
    const paramKeys = Array.from(params.keys());
    const warnings: string[] = [];

    const botToken = this.configService.get<string>('TWITRIS_BOT_TOKEN');
    if (!botToken) {
      throw new HttpException(
        'TWITRIS_BOT_TOKEN is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const dataPairs: string[] = [];
    for (const [key, value] of params.entries()) {
      if (key === 'hash' || key === 'signature') continue;
      dataPairs.push(`${key}=${value}`);
    }
    dataPairs.sort();
    const dataCheckString = dataPairs.join('\n');

    const expectedHash = this.calcTelegramInitDataHash(dataCheckString, botToken);
    let validationMode: 'no-signature' | 'with-signature' = 'no-signature';
    let ok = this.safeHexEqual(expectedHash, receivedHash);

    // Compatibility fallback for clients/environments where `signature`
    // was included in Telegram hash data-check-string.
    if (!ok && hasSignature) {
      const dataPairsWithSignature: string[] = [];
      for (const [key, value] of params.entries()) {
        if (key === 'hash') continue;
        dataPairsWithSignature.push(`${key}=${value}`);
      }
      dataPairsWithSignature.sort();
      const dataCheckWithSignature = dataPairsWithSignature.join('\n');
      const expectedHashWithSignature = this.calcTelegramInitDataHash(
        dataCheckWithSignature,
        botToken,
      );

      if (this.safeHexEqual(expectedHashWithSignature, receivedHash)) {
        ok = true;
        validationMode = 'with-signature';
      }
    }

    const authDateRaw = params.get('auth_date');
    const authDate = authDateRaw ? Number(authDateRaw) : undefined;
    if (!authDateRaw) warnings.push('auth_date missing');
    if (authDateRaw && !/^\d+$/.test(authDateRaw)) {
      warnings.push('auth_date is not numeric');
    }

    const userRaw = params.get('user');
    let telegramUser:
      | {
          id: number;
          username?: string;
          first_name?: string;
          last_name?: string;
          photo_url?: string;
        }
      | undefined;
    if (userRaw) {
      try {
        telegramUser = JSON.parse(userRaw);
      } catch {
        warnings.push('user JSON parse failed');
      }
    } else {
      warnings.push('user missing');
    }

    if (!params.get('query_id')) warnings.push('query_id missing');
    if (!receivedHash) warnings.push('hash missing');
    if (params.getAll('auth_date').length > 1) {
      warnings.push('auth_date repeated');
    }

    return {
      ok,
      dataCheckString,
      expectedHash,
      receivedHash,
      validationMode,
      paramKeys,
      warnings,
      authDate: Number.isFinite(authDate) ? authDate : undefined,
      telegramUser,
    };
  }

  public async verifyAndUpsert(dto: TwitrisAuthDto) {
    if (!dto.initData) {
      throw new HttpException('initData missing', HttpStatus.UNAUTHORIZED);
    }

    const telegram = this.verifyTelegramInitData(dto.initData);

    if (!telegram.ok) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    const telegramUser = telegram.telegramUser;
    dto.username = dto.username ?? telegramUser?.username;
    dto.first_name = dto.first_name ?? telegramUser?.first_name;
    dto.last_name = dto.last_name ?? telegramUser?.last_name;
    dto.photo_url = dto.photo_url ?? telegramUser?.photo_url;

    const tgId = telegramUser?.id ? String(telegramUser.id) : undefined;
    if (!tgId) {
      throw new HttpException('telegram_id missing', HttpStatus.UNAUTHORIZED);
    }

    let user = await this.userModel.findOne({ where: { tg_id: tgId } });

    if (!user) {
      user = await this.userModel.create({
        tg_id: tgId,
        username: dto.username,
        first_name: dto.first_name,
        last_name: dto.last_name,
        photo_url: dto.photo_url,
        gift_background: dto.gift_background,
        gift_pattern: dto.gift_pattern,
        gift_model: dto.gift_model,
        gift_rarity: dto.gift_rarity,
        gift_updated_at: new Date(),
      });
    } else {
      await user.update({
        username: dto.username,
        first_name: dto.first_name,
        last_name: dto.last_name,
        photo_url: dto.photo_url,
        gift_background: dto.gift_background,
        gift_pattern: dto.gift_pattern,
        gift_model: dto.gift_model,
        gift_rarity: dto.gift_rarity,
        gift_updated_at: new Date(),
      });
    }

    return user;
  }
}
