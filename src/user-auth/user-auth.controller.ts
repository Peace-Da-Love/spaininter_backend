import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { UserAuthService } from './user-auth.service';
import { TwitrisAuthDto } from './dto/twitris-auth.dto';
import { HandoffDto } from './dto/handoff.dto';
import { AuthHandoffService } from './auth-handoff.service';
import { UserTokenService } from './user-token.service';
import { AuthStatusDto } from './dto/auth-status.dto';

@Controller('user/auth')
export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly authHandoffService: AuthHandoffService,
    private readonly userTokenService: UserTokenService,
  ) {}

  @Post('twitris')
  @HttpCode(HttpStatus.OK)
  authViaTwitris(@Body() dto: TwitrisAuthDto) {
    return this.userAuthService.authenticate(dto);
  }

  @Post('handoff')
  @HttpCode(HttpStatus.OK)
  public async handoff(
    @Body() dto: HandoffDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authHandoffService.consume(dto.authToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired authToken');
    }

    const tokens = await this.userTokenService.generateTokens({ user_id: userId });
    await this.userTokenService.saveToken(userId, tokens.refresh_token);

    res.cookie('user_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // true в prod
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return { accessToken: tokens.access_token };
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  public async authStatus(
    @Query() dto: AuthStatusDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.userAuthService.consumeAuthSession(dto.sessionId);

    if (!result.success) {
      return { success: false, status: 'pending' };
    }

    res.cookie('user_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: false, // true in prod
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return { success: true, accessToken: result.accessToken };
  }
}
