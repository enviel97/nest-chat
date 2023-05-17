// https://cloudinary.com/documentation/node_image_manipulation
import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  GetImageCacheHandler,
  DeleteImageCacheHandler,
} from './image-storage.decorate';
import { LogDuration } from 'src/utils/decorates';
import { v2 as Cloudinary, TransformationOptions } from 'cloudinary';
import {
  CloudinaryResponse,
  IImageStorageService,
  ViewPortAvatarEnum,
  ViewPortBannerEnum,
} from './types/image-storage.types';
import { Readable } from 'stream';

interface TemplateTransform {
  avatar: TransformationOptions;
  banner: TransformationOptions;
}
@Injectable()
export class ImageStorageService implements IImageStorageService {
  constructor(
    @Inject('CloudinarySDK')
    private readonly imageStorageSdk: typeof Cloudinary,
  ) {}

  private readonly bucket: string = 'ChatAppAsset';

  private generateTransformTemplate(size?: ViewPort) {
    const _size = size ?? 'md';
    const transform = Object.freeze<TemplateTransform>({
      avatar: {
        width: ViewPortAvatarEnum[_size],
        aspectRatio: '1:1',
        crop: 'fill',
        gravity: 'face',
      },
      banner: {
        height: ViewPortBannerEnum[_size],
        aspectRatio: '16:9',
        crop: 'scale',
        gravity: 'center',
      },
    });

    return (type: 'avatar' | 'banner') => transform[type];
  }

  /**
   *
   * @param url image url to download to cache redis
   * @returns binary content and content type
   * @errors InternalServerErrorException()
   *
   */
  private async fetchImage(url: string): Promise<FetchImageResponse> {
    return await fetch(url)
      .then(async (res) => {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          buffer,
          contentType: res.headers.get('content-type') ?? 'image/jpeg',
        };
      })
      .catch(async (error) => {
        Logger.error(error, 'Image fetch error');
        throw new InternalServerErrorException();
      });
  }

  /**
   *
   * @param public_id public key of image in cloudinary
   * @param customTransform transform image by ai (cloudinary)
   * @returns url as string
   */
  private generatorUrl(
    public_id: string,
    customTransform: TransformationOptions,
  ) {
    // return `${result}?updatedAt=${new Date().getTime()}`;
    return this.imageStorageSdk.url(`${this.bucket}/${public_id}`, {
      transformation: [
        customTransform,
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });
  }

  @LogDuration()
  async deleteImage(fileId: string): Promise<any> {
    throw new BadGatewayException('Method not implement');
  }

  @DeleteImageCacheHandler()
  @LogDuration()
  async uploadImage(public_id: string, file: Express.Multer.File) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const cloudinaryStream = this.imageStorageSdk.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: this.bucket,
          public_id: public_id,
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(cloudinaryStream);
    });
  }

  @GetImageCacheHandler()
  @LogDuration()
  async getImage(
    fileName: string,
    type: 'avatar' | 'banner',
    viewPort?: ViewPort,
  ): Promise<FetchImageResponse> {
    const transform = this.generateTransformTemplate(viewPort);

    const url = this.generatorUrl(fileName, transform(type));

    const image = await this.fetchImage(url);
    return image;
  }
}
