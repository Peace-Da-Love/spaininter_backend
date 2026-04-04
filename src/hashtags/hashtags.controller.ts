import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { DeleteHashtagDto } from './dto/delete-hashtag.dto';
import { GetHashtagByIdDto } from './dto/get-hashtag-by-id.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';

@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  public async createHashtag(@Body() dto: CreateHashtagDto) {
    return this.hashtagsService.createHashtag(dto);
  }

  @Auth()
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  public async deleteHashtag(@Query() dto: DeleteHashtagDto) {
    return this.hashtagsService.deleteHashtag(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getHashtags() {
    return this.hashtagsService.getHashtags();
  }

  @Get('hashtag')
  @HttpCode(HttpStatus.OK)
  public async getHashtagById(@Query() dto: GetHashtagByIdDto) {
    return this.hashtagsService.getHashtagById(dto);
  }

  @Auth()
  @Put('update')
  @HttpCode(HttpStatus.OK)
  public async updateHashtag(@Body() dto: UpdateHashtagDto) {
    return this.hashtagsService.updateHashtag(dto);
  }
}
