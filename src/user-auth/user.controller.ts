import { Controller, Get, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/user.model';
import { UserJwtGuard } from './guards/user-jwt.guard';
import { AuthenticatedUser } from './types/IUserJwtPayload';

@Controller('user')
export class UserController {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  @Get('gift')
  @UseGuards(UserJwtGuard)
  public async getUserGift(@Req() req: Request & { user: AuthenticatedUser }) {
    const userData = req.user;
    if (!userData || !userData.user_id) return { gift: null };
    const user = await this.userModel.findByPk(userData.user_id);
    if (!user) return { gift: null };
    return {
      gift: {
        background: user.gift_background,
        pattern: user.gift_pattern,
        model: user.gift_model,
        rarity: user.gift_rarity,
      },
    };
  }

  @Get('me')
  @UseGuards(UserJwtGuard)
  public async me(@Req() req: Request & { user: AuthenticatedUser }) {
    const userData = req.user;
    if (!userData || !userData.user_id) throw new NotFoundException();

    const user = await this.userModel.findByPk(userData.user_id);
    if (!user) throw new NotFoundException();

    return {
      user: {
        id: user.id,
        telegram_id: user.tg_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url,
        gift: {
          background: user.gift_background,
          pattern: user.gift_pattern,
          model: user.gift_model,
          rarity: user.gift_rarity,
        },
      },
    };
  }
}
