import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ITelegramReq } from './types/ITelegramReq';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  public async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { query } = req;
    const {
      data: { refresh_token, access_token },
      ...rest
    } = await this.authService.login(query as unknown as ITelegramReq);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 15,
    });
    return { ...rest, data: { accessToken: access_token } };
  }

  @Auth()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public register(@Body() dto: RegisterAdminDto) {
    return this.authService.register(dto);
  }
}
