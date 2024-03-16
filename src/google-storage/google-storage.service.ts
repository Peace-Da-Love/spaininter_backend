import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as sharp from 'sharp';
import * as fs from 'fs';

@Injectable()
export class GoogleStorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.get('GOOGLE_STORAGE_PROJECT_ID'),
      keyFilename: './google-storage-key.json',
    });
    this.bucketName = this.configService.get('GOOGLE_STORAGE_BUCKET_NAME');
  }

  public async uploadFile(file: Express.Multer.File) {
    if (file.size > 5000000)
      throw new HttpException('File size is too large', HttpStatus.BAD_REQUEST);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const imageBuffer = await sharp(file.buffer).webp().toBuffer();
    const webpFile = this.storage
      .bucket(this.bucketName)
      .file(`${uniqueSuffix}.webp`);
    const stream = webpFile.createWriteStream({
      metadata: {
        contentType: 'image/webp',
      },
    });

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
      stream.end(imageBuffer);
    });

    return {
      url: `https://storage.googleapis.com/${this.bucketName}/${uniqueSuffix}.webp`,
    };
  }

  private async clearFolder() {
    const folderPath = path.resolve(__dirname, '..', '..', 'uploads');
    const files = await fs.promises.readdir(folderPath);
    for (const file of files) {
      await fs.promises.unlink(path.join(folderPath, file));
    }
  }
}
