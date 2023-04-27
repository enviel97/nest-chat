import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import ImageKitSDK from 'imagekit';
import { ImageStorageException } from './image-storage.exception';
import {
  GetImageCacheHandler,
  DeleteImageCacheHandler,
} from './image-storage.decorate';
import { LogDuration } from 'src/utils/decorates';

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
  default = 'auto-910',
  s = '320',
  sm = '663',
  md = '910	',
  lg = '1113',
  xl = '1313',
}
@Injectable()
export class ImageStorageService implements IImageStorageService {
  private bucket: string = 'ChatAppAssets';
  private responseField: string[] = [
    'fileId',
    'name',
    'url',
    'thumbnailUrl',
    'versionInfo',
  ];

  constructor(
    @Inject('ImageKitSDK')
    private readonly imagekit: ImageKitSDK,
  ) {}

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
    });

    return `${result}?updatedAt=${new Date().getTime()}`;
  }

  async deleteImage(fileId: string): Promise<any> {
    try {
      const result = this.imagekit.deleteFile(fileId);
      return result;
    } catch (error) {
      Logger.error('Image storage delete error', error);
      throw new ImageStorageException();
    }
  }

  @DeleteImageCacheHandler()
  @LogDuration()
  async uploadImage(key: string, file: Express.Multer.File): Promise<any> {
    try {
      const base64 = Buffer.from(file.buffer);
      const result = this.imagekit.upload({
        file: base64.toString('base64'),
        fileName: key,
        folder: this.bucket,
        useUniqueFileName: false,
        responseFields: this.responseField,
      });
      return result;
    } catch (error) {
      Logger.error('Image storage upload error', error);
      throw new ImageStorageException();
    }
  }

  @GetImageCacheHandler()
  async getImage(
    fileName: string,
    type: 'avatar' | 'banner',
    viewPort?: ViewPort,
  ): Promise<FetchImageResponse> {
    const size = viewPort ?? 'default';
    const url = this.generatorUrl(fileName, {
      size:
        type == 'avatar'
          ? { width: ViewPortAvatarEnum[size] }
          : { height: ViewPortBannerEnum[size] },
      aspectRatio: type == 'avatar' ? '1-1' : '16-9',
    });
    const image = await this.fetchImage(url);
    return image;
  }
}
