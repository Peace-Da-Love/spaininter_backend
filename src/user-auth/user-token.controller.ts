import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    HttpException,
    Post,
    Req,
    Res,
    } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserAuthService } from './user-auth.service';

@Controller('auth/user')
export class UserTokenController {
    constructor(private readonly userAuthService: UserAuthService) {}

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    ) {
    const refreshToken = req.cookies.user_refresh_token;

    if (!refreshToken) {
        throw new HttpException('No refresh token', HttpStatus.UNAUTHORIZED);
    }

    const { accessToken, refreshToken: newRefreshToken } =
        await this.userAuthService.refresh(refreshToken);

    res.cookie('user_refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    
    return { accessToken };
    }


    @Delete('logout')
    @HttpCode(HttpStatus.OK)
    public async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies.user_refresh_token;
        res.clearCookie('user_refresh_token');
        return this.userAuthService.logOut(refreshToken);
    }
}
