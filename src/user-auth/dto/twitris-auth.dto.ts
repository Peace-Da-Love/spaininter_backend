import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class TwitrisAuthDto {
  @IsString()
  @IsNotEmpty()
  telegram_id: string;

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

  @IsInt()
  @Min(1)
  timestamp: number;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
