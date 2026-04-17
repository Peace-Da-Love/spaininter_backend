import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/user.model';
import { UserTokenService } from './user-token.service';
import { TwitrisAuthDto } from './dto/twitris-auth.dto';
import { TwitrisAuthProvider } from './twitris-auth.provider';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthHandoffService } from './auth-handoff.service';

@Injectable()
export class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);

  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly userTokenService: UserTokenService,
    private readonly twitrisAuthProvider: TwitrisAuthProvider,
    private readonly authHandoffService: AuthHandoffService,
  ) {}

  public async authenticate(dto: TwitrisAuthDto) {
    this.logger.log('[AUTH] twitris login start');

    try {
      const user = await this.twitrisAuthProvider.verifyAndUpsert(dto);

      // Create one-time auth handoff token stored in Redis
      const authToken = await this.authHandoffService.create(user.id);

      this.logger.log(`[AUTH] twitris login success userId=${user.id}`);
      return { authToken };
    } catch (error) {
      const reason = this.resolveTwitrisFailureReason(error);
      this.logger.error(`[AUTH] twitris login failed reason=${reason}`);
      throw error;
    }
  }

  private resolveTwitrisFailureReason(error: unknown): string {
    if (error instanceof HttpException) {
      const message = error.message?.toLowerCase() ?? '';
      if (message.includes('invalid signature')) return 'invalid_signature';
      if (message.includes('initdata missing')) return 'init_data_missing';
      if (message.includes('telegram_id missing')) return 'telegram_id_missing';
      return 'http_exception';
    }
    return 'internal_error';
  }

  public async refresh(validatedToken: string) {
    if (!validatedToken) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }

    const payload = this.userTokenService.validateRefreshToken(validatedToken);
    const found = await this.userTokenService.findToken(validatedToken);
    if (!found) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.userTokenService.generateTokens({
      user_id: payload.data.user_id,
    });

    await this.userTokenService.saveToken(payload.data.user_id, tokens.refresh_token);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  }

  public async logOut(refreshToken: string) {
    if (!refreshToken) return { ok: true };
    const payload = this.userTokenService.validateRefreshToken(refreshToken);
    await this.userTokenService.deleteToken(payload.data.user_id, refreshToken);
    return { ok: true };
  }
}
