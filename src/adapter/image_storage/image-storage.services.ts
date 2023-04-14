import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import ImageKitSDK from 'imagekit';
import { ImageStorageException } from './image-storage.exception';

interface GenerationImageTransformation {
  size?: any;
  aspectRatio: string;
}

export enum ViewPortEnum {
  default = 'default',
  s = 's',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
}

enum ViewPortAvatarEnum {
  default = 'auto-200',
  s = '190',
  sm = '1032',
  md = '1438',
  lg = '1493',
  xl = '1534',
}

enum ViewPortBannerEnum {
  default = 'auto-900',
  s = '320',
  sm = '874',
  md = '1295',
  lg = '1549',
  xl = '1600',
}
@Injectable()
export class ImageStorageService implements IImageStorageService {
  private bucket: string = 'ChatAppAssets';
  private responseField: string[] = ['fileId', 'name', 'url', 'thumbnailUrl'];

  constructor(@Inject('ImageKitSDK') private readonly imagekit: ImageKitSDK) {}

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
      .catch((error) => {
        Logger.error(error, 'Image fetch error');
        throw new InternalServerErrorException();
      });
  }

  private generatorUrl(
    fileName: string,
    { size, aspectRatio }: GenerationImageTransformation,
  ) {
    const result = this.imagekit.url({
      path: `${this.bucket}/${fileName}`,
      transformation: [
        {
          aspectRatio: aspectRatio,
          focus: 'auto',
          effectSharpen: '-',
          effectContrast: '1',
          dpr: 'auto',
        },
        size,
      ],
      signed: true,
      expireSeconds: 300,
    });

    return result;
  }

  async uploadImage(key: string, file: Express.Multer.File): Promise<any> {
    try {
      const result = await this.imagekit.upload({
        file: file.buffer,
        fileName: key,
        folder: this.bucket,
        useUniqueFileName: false,
        responseFields: this.responseField,
      });
      return result;
    } catch (error) {
      Logger.error('Image storage error', error);
      throw new ImageStorageException();
    }
  }

  async getImageAvatar(
    fileName: string,
    viewPort?: ViewPort,
  ): Promise<FetchImageResponse> {
    const url = this.generatorUrl(fileName, {
      size: { width: ViewPortAvatarEnum[viewPort ?? 'default'] },
      aspectRatio: '1-1',
    });
    const image = await this.fetchImage(url);
    return image;
  }

  async getImageBanner(
    fileName: string,
    viewPort?: ViewPort,
  ): Promise<FetchImageResponse> {
    const url = this.generatorUrl(fileName, {
      size: { height: ViewPortBannerEnum[viewPort ?? 'default'] },
      aspectRatio: '16-9',
    });
    const image = await this.fetchImage(url);
    return image;
  }
}
