import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export enum ViewPortAvatarEnum {
  s = '190',
  sm = '1032',
  md = '1438',
  lg = '1493',
  xl = '1534',
}

export enum ViewPortBannerEnum {
  s = '320',
  sm = '663',
  md = '910	',
  lg = '1113',
  xl = '1313',
}

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

export interface IImageStorageService {
  uploadImage(
    public_id: string,
    file: Express.Multer.File,
  ): Promise<CloudinaryResponse>;
  getImage(
    public_id: string,
    type: UploadImageType,
    viewPort?: ViewPort,
  ): Promise<FetchImageResponse>;
}

export enum UploadTypesEnum {
  ANY = 'jpg|jpeg|png|gif|pdf|docx|doc|xlsx|xls',
  IMAGES = 'jpg|jpeg|png|gif',
  DOCS = 'pdf|docx|doc|xlsx|xls',
}
