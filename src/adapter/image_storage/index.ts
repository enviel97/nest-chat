import { Module } from '@nestjs/common';
import { Services } from 'src/common/define';
import environment from 'src/common/environment';
import { ImageStorageService } from './image-storage.services';
const ImageKit = require('imagekit');

const ImageStorageProvider = {
  provide: Services.IMAGE_STORAGE,
  useClass: ImageStorageService,
};
const ImageKitSDK = {
  provide: 'ImageKitSDK',
  useValue: new ImageKit(environment.image),
};

@Module({
  providers: [ImageKitSDK, ImageStorageProvider],
  exports: [ImageStorageProvider],
})
export class ImageStorageModule {}
