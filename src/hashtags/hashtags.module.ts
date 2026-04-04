import { Module } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Hashtag } from './hashtags.model';
import { HashtagsController } from './hashtags.controller';
import { News } from '../news/news.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Hashtag, News]),
  ],
  providers: [HashtagsService],
  controllers: [HashtagsController],
  exports: [HashtagsService],
})
export class HashtagsModule {}
