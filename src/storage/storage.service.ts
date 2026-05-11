import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly storage: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly publicUrl: string;
  private readonly storagePrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.getRequiredConfig('HETZNER_STORAGE_BUCKET_NAME');
    this.endpoint = this.getRequiredConfig('HETZNER_STORAGE_ENDPOINT');
    this.publicUrl =
      this.configService.get<string>('HETZNER_STORAGE_PUBLIC_URL') ??
      this.buildPublicUrl(this.bucketName, this.endpoint);
    this.storagePrefix = this.normalizePrefix(
      this.configService.get<string>('HETZNER_STORAGE_PREFIX') ?? 'news_posters',
    );

    this.storage = new S3Client({
      endpoint: this.endpoint,
      region: this.configService.get<string>('HETZNER_STORAGE_REGION') ?? 'us-east-1',
      credentials: {
        accessKeyId: this.getRequiredConfig('HETZNER_STORAGE_ACCESS_KEY'),
        secretAccessKey: this.getRequiredConfig('HETZNER_STORAGE_SECRET_KEY'),
      },
    });
  }

  public async uploadFile(file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new HttpException('File buffer is empty', HttpStatus.BAD_REQUEST);
    }

    if (file.size > 5000000) {
      throw new HttpException('File size is too large', HttpStatus.BAD_REQUEST);
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}.webp`;
    const objectKey = this.buildObjectKey(filename);
    const imageBuffer = await sharp(file.buffer).webp().toBuffer();

    await this.storage.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Body: imageBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read',
      }),
    );

    return {
      url: `${this.publicUrl}/${objectKey}`,
    };
  }

  public async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) {
        console.warn('File URL for deletion is not provided');
        return;
      }

      const key = this.getHetznerObjectKey(fileUrl);
      if (!key) {
        console.warn('Skipping deletion for non-Hetzner storage URL:', fileUrl);
        return;
      }

      await this.storage.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      console.log(`File deleted from Hetzner Object Storage: ${key}`);
    } catch (error) {
      if (error?.$metadata?.httpStatusCode === 404) {
        console.log('File already does not exist in Hetzner Object Storage');
        return;
      }

      console.warn(
        'Failed to delete file from Hetzner Object Storage:',
        error.message,
      );
    }
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} is not configured`);
    }

    return value;
  }

  private buildPublicUrl(bucketName: string, endpoint: string) {
    const parsedEndpoint = new URL(endpoint);
    return `${parsedEndpoint.protocol}//${bucketName}.${parsedEndpoint.host}`;
  }

  private buildObjectKey(filename: string) {
    return this.storagePrefix ? `${this.storagePrefix}/${filename}` : filename;
  }

  private normalizePrefix(prefix: string) {
    return prefix.replace(/^\/+|\/+$/g, '');
  }

  private getHetznerObjectKey(fileUrl: string) {
    if (!this.publicUrl) return null;

    const parsedUrl = new URL(fileUrl.split('?')[0].split('#')[0]);
    const parsedPublicUrl = new URL(this.publicUrl);

    if (parsedUrl.host !== parsedPublicUrl.host) return null;

    const key = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));
    return key || null;
  }
}
