import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MetadataService } from './metadata.service';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  public async getCategoryMetadata() {
    return this.metadataService.getCategoryMetadata();
  }

  @Get('news')
  @HttpCode(HttpStatus.OK)
  public async getLatestNews() {
    return this.metadataService.getNewsMetadata();
  }
}
