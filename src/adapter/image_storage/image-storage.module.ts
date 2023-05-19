import { Module } from '@nestjs/common';
import { Services } from 'src/common/define';
import environment from 'src/common/environment';
import { ImageStorageService } from './services/image-storage.services';
import { v2 as Cloudinary } from 'cloudinary';

const ImageStorageProvider = {
  provide: Services.IMAGE_STORAGE,
  useClass: ImageStorageService,
};
const CloudinarySdk = {
  provide: 'CloudinarySDK',
  useFactory: () => {
    Cloudinary.config({
      ...environment.image,
      secure: true,
      shorten: true,
      ssl_detected: true,
    });
    return Cloudinary;
  },
};

@Module({
  providers: [CloudinarySdk, ImageStorageProvider],
  exports: [ImageStorageProvider],
})
export class ImageStorageModule {}
