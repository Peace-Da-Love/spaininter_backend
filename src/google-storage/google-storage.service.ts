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
    const filename = `${uniqueSuffix}.webp`;

    const imageBuffer = await sharp(file.buffer).webp().toBuffer();
    const webpFile = this.storage.bucket(this.bucketName).file(filename);
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
      url: `https://storage.googleapis.com/${this.bucketName}/${filename}`,
    };
  }

  private async clearFolder() {
    const folderPath = path.resolve(__dirname, '..', '..', 'uploads');
    const files = await fs.promises.readdir(folderPath);
    for (const file of files) {
      await fs.promises.unlink(path.join(folderPath, file));
    }
  }

  public async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) {
        console.warn('URL файла для удаления не указан');
        return;
      }

      // Удаляем query-параметры и хэш, если они есть
      const urlWithoutParams = fileUrl.split('?')[0].split('#')[0];

      // Извлекаем имя файла из URL
      // URL может быть вида: https://storage.googleapis.com/bucket-name/filename.webp
      const urlParts = urlWithoutParams.split('/');
      const filename = urlParts[urlParts.length - 1];

      if (!filename) {
        console.warn('Не удалось извлечь имя файла из URL:', fileUrl);
        return;
      }

      const file = this.storage.bucket(this.bucketName).file(filename);
      await file.delete();
      console.log(`Файл удален из Google Cloud Storage: ${filename}`);
    } catch (error) {
      // Если файл не существует (404), это нормально - возможно уже удален
      if (error.code === 404) {
        console.log(`Файл уже не существует в Google Cloud Storage`);
      } else {
        console.warn(
          'Не удалось удалить файл из Google Cloud Storage:',
          error.message,
        );
      }
    }
  }
}
