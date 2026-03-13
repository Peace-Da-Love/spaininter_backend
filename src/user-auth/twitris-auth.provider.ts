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

  private isReplay(timestamp: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return Math.abs(now - timestamp) > 300; // 5 minutes
  }

  private buildCanonical(dto: TwitrisAuthDto): string {
    return Object.entries(dto)
      .filter(([key, value]) => key !== 'signature' && value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
  }

  public async verifyAndUpsert(dto: TwitrisAuthDto) {
    if (this.isReplay(dto.timestamp)) {
      throw new HttpException('Replay detected', HttpStatus.UNAUTHORIZED);
    }

    const secret = this.configService.get<string>('TWITRIS_BOT_SECRET');
    if (!secret) {
      throw new HttpException(
        'TWITRIS_BOT_SECRET is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const canonical = this.buildCanonical(dto);

    const expectedSignature = createHmac('sha256', secret)
      .update(canonical)
      .digest('hex');

    if (!dto.signature) {
    throw new HttpException('Signature missing', HttpStatus.UNAUTHORIZED);
    }

    const expected = Buffer.from(expectedSignature, 'utf8');
    const received = Buffer.from(dto.signature, 'utf8');
    if (expected.length !== received.length) {
    throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    const isValid = timingSafeEqual(
    new Uint8Array(expected),
    new Uint8Array(received),
    );

    if (!isValid) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    const tgId = dto.telegram_id;

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
