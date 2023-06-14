import { Module } from '@nestjs/common';
import { ImageStorageModule } from 'src/adapter/image_storage/image-storage.module';
import { MediaController } from './media.controller';

@Module({
  imports: [ImageStorageModule],
  controllers: [MediaController],
  exports: [],
})
export class MediaModule {}
