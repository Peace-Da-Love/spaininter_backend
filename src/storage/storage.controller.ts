import {
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnyAuth } from '../auth/decorators/any-auth.decorator';
import { memoryStorage } from 'multer';

@Controller('google-storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @AnyAuth()
  @Post('upload-file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /image\/jpeg|image\/png|image\/webp/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.storageService.uploadFile(file);
  }
}
