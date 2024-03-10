import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Language } from './languages.model';
import { LanguagesController } from './languages.controller';

@Module({
  imports: [SequelizeModule.forFeature([Language])],
  providers: [LanguagesService],
  controllers: [LanguagesController],
  exports: [LanguagesService],
})
export class LanguagesModule {}
