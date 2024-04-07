import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { Auth } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';
import { DeleteAdminDto } from './dto/delete-admin.dto';
import { GetAdminsDto } from './dto/get-admins.dto';
import { AdminAuth } from './decorators/admin.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      data: { refresh_token, access_token },
      ...rest
    } = await this.authService.login(dto);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 15,
    });
    return { ...rest, data: { accessToken: access_token } };
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const validatedToken = req.cookies.refresh_token;
    const {
      data: { refresh_token, access_token },
      ...rest
    } = await this.authService.refresh(validatedToken);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 15,
    });
    return { ...rest, data: { accessToken: access_token } };
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refresh_token;
    res.clearCookie('refresh_token');
    return this.authService.logOut(refreshToken);
  }

  @AdminAuth()
  @Post('register-creator')
  @HttpCode(HttpStatus.CREATED)
  public registerCreator(@Body() dto: RegisterAdminDto) {
    return this.authService.registerCreator(dto);
  }

  @AdminAuth()
  @Post('register-admin')
  @HttpCode(HttpStatus.CREATED)
  public registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @AdminAuth()
  @Get('/admins')
  @HttpCode(HttpStatus.OK)
  public getAdmins(@Query() dto: GetAdminsDto) {
    return this.authService.getAdmins(dto);
  }

  @AdminAuth()
  @Get('/creators')
  @HttpCode(HttpStatus.OK)
  public getCreators(@Query() dto: GetAdminsDto) {
    return this.authService.getCreators(dto);
  }

  @AdminAuth()
  @Delete('/admins')
  @HttpCode(HttpStatus.OK)
  public deleteAdmin(@Query() dto: DeleteAdminDto) {
    return this.authService.deleteAdmin(dto);
  }
}
