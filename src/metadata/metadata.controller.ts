import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { GetNewsMetadataDto } from './dto/get-news-metadata.dto';

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
  public async getNewsMetadata(@Query() dto: GetNewsMetadataDto) {
    return this.metadataService.getNewsMetadataById(dto);
  }

  @Get('all-news')
  @HttpCode(HttpStatus.OK)
  public async getLatestNews() {
    return this.metadataService.getNewsMetadata();
  }
}
