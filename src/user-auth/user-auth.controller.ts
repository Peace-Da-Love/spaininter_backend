import { Body, 
  Controller, Post, HttpCode, HttpStatus, UnauthorizedException, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserAuthService } from './user-auth.service';
import { TwitrisAuthDto } from './dto/twitris-auth.dto';
import { HandoffDto } from './dto/handoff.dto';
import { AuthHandoffService } from './auth-handoff.service';
import { UserTokenService } from './user-token.service';

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

}
