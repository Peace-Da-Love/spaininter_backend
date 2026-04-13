import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class TwitrisAuthDto {
  /**
   * Telegram WebApp initData string (querystring) which includes `hash`.
   * If provided, server should verify auth using Telegram's data-check-string algorithm.
   */
  @IsString()
  @IsNotEmpty()
  initData: string;

  // Filled from Telegram initData.user (server-side)
  telegram_id?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  // Gift
  @IsOptional()
  @IsString()
  gift_background?: string;

  @IsOptional()
  @IsString()
  gift_pattern?: string;

  @IsOptional()
  @IsString()
  gift_model?: string;

  @IsOptional()
  @IsString()
  gift_rarity?: string;


}
