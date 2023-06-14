import {
  Get,
  Inject,
  Param,
  ParseEnumPipe,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { Routes, Services } from 'src/common/define';
import { ParseUUIDPipe } from 'src/middleware/parse/uuid';
import { ProtectController } from 'src/utils/decorates';

enum UploadImageType {
  avatar = 'avatar',
  banner = 'banner',
  normal = 'normal',
}

@ProtectController(Routes.MEDIA)
export class MediaController {
  constructor(
    @Inject(Services.IMAGE_STORAGE)
    private imageStorageService: IImageStorageService,
  ) {}

  @SkipThrottle()
  @Get(':type/:id')
  async getImage(
    @Param('type', new ParseEnumPipe(UploadImageType))
    type: UploadImageType,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('size') viewPort: ViewPort,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, contentType } = await this.imageStorageService.getImage(
      id,
      type,
      viewPort,
    );
    res.contentType(contentType ?? 'image/jpeg');
    return new StreamableFile(buffer);
  }
}
