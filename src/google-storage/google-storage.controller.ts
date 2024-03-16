import {
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GoogleStorageService } from './google-storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('google-storage')
export class GoogleStorageController {
  constructor(private readonly googleStorageService: GoogleStorageService) {}

  @Auth()
  @Post('upload-file')
  @UseInterceptors(
    FileInterceptor('file', {
      // storage: diskStorage({
      //   destination: './uploads',
      //   filename: (req, file, cb) => {
      //     const uniqueSuffix =
      //       Date.now() + '-' + Math.round(Math.random() * 1e9);
      //     cb(null, `${uniqueSuffix}-${file.originalname}`);
      //   },
      // }),
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
    return this.googleStorageService.uploadFile(file);
  }
}
