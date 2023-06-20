import type { TransformationOptions } from 'cloudinary';

export type TemplateTransform = {
  [type in UploadImageType]: TransformationOptions[];
};

/**
 * Common define
 */
export enum ViewPortAvatarEnum {
  s = '190',
  sm = '522',
  md = '767',
  lg = '1438',
  xl = '1534',
}

export enum ViewPortBannerEnum {
  s = '320',
  sm = '663',
  md = '910',
  lg = '1113',
  xl = '1313',
}

export enum ViewPortImageEnum {
  s = '150',
  sm = '300',
  md = '450',
  lg = '600',
  xl = '1000',
}

export enum UploadTypesEnum {
  ANY = 'jpg|jpeg|png|gif|pdf|docx|doc|xlsx|xls',
  IMAGES = 'jpg|jpeg|png|gif',
  DOCS = 'pdf|docx|doc|xlsx|xls',
}
