// https://cloudinary.com/documentation/node_image_manipulation
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  GetImageCacheHandler,
  DeleteImageCacheHandler,
} from '../decorate/image-storage.decorate';
import { LogDuration } from 'src/utils/decorates';
import { v2 as Cloudinary, TransformationOptions } from 'cloudinary';
import {
  TemplateTransform,
  ViewPortAvatarEnum,
  ViewPortBannerEnum,
  ViewPortImageEnum,
} from '../types/image-storage.types';
import { Readable } from 'stream';

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
      normal: {
        height: ViewPortImageEnum[_size],
        crop: 'scale',
      },
    });

    return (type: UploadImageType) => transform[type];
  }

  /**
   *
   * @param url {string} image url to download to cache redis
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
  async deleteImage(public_id: string): Promise<any> {
    this.imageStorageSdk.uploader.destroy(
      `${this.bucket}/${public_id}`,
      (error, result) => {
        if (error) {
          Logger.error('File delete failure', error, 'IMAGE_SERVICES');
          return;
        }
        Logger.log('File delete successfully', 'IMAGE_SERVICES');
      },
    );
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
          resolve({
            url: result.url,
            publicId: result.public_id,
            createdAt: result.created_at,
            type: result.type,
          });
        },
      );
      Readable.from(file.buffer).pipe(cloudinaryStream);
    });
  }

  @GetImageCacheHandler()
  @LogDuration()
  async getImage(
    fileName: string,
    type: UploadImageType,
    viewPort?: ViewPort,
  ): Promise<FetchImageResponse> {
    const transform = this.generateTransformTemplate(viewPort);

    const url = this.generatorUrl(fileName, transform(type));

    const image = await this.fetchImage(url);
    return image;
  }
}
