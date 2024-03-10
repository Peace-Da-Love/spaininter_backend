import { Injectable } from '@nestjs/common';
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
      projectId: this.configService.get('GOOGLE_PROJECT_ID'),
      keyFilename: './google-storage-key.json',
    });
    this.bucketName = this.configService.get('GOOGLE_STORAGE_BUCKET_NAME');
  }

  async uploadFile(filename: string) {
    const filePath = path.resolve(__dirname, '..', '..', 'uploads', filename);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const imageBuffer = await sharp(filePath).webp().toBuffer();
    const file = this.storage
      .bucket(this.bucketName)
      .file(`${uniqueSuffix}.webp`);
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'image/webp',
      },
    });
    stream.end(imageBuffer);
    fs.unlinkSync(filePath);
    return `https://console.cloud.google.com/storage/browser/${this.bucketName}/${uniqueSuffix}.webp`;
  }
}
