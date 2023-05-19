import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { UploadTypesEnum } from '../types/image-storage.types';

export const SingleFileValidator = (fileFilter?: UploadTypesEnum) =>
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
      new FileTypeValidator({
        fileType: new RegExp(`/${fileFilter ?? UploadTypesEnum.IMAGES}/g`),
      }),
    ],
  });
