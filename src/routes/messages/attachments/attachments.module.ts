import { Module } from '@nestjs/common';
import { ImageStorageModule } from 'src/adapter/image_storage/image-storage.module';
import { AttachmentsProvider } from './attachments.provider';

@Module({
  imports: [ImageStorageModule],
  providers: [AttachmentsProvider],
  exports: [AttachmentsProvider],
})
export class AttachmentsModule {}
