import { Module } from '@nestjs/common';
import { GoogleStorageService } from './google-storage.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleStorageController } from './google-storage.controller';

@Module({
  imports: [ConfigModule],
  providers: [GoogleStorageService],
  controllers: [GoogleStorageController],
})
export class GoogleStorageModule {}
