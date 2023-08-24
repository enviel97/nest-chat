import { ParseFilePipe, FileValidator } from '@nestjs/common';
import string from 'src/utils/string';
import { UploadTypesEnum } from '../types/image-storage.types';

interface ValidateOptions {
  required: boolean;
  maxEach: number;
  maxQuantity: number;
  mimeType: 'ANY' | 'IMAGES' | 'DOCS';
}

const MAX_SIZE_FILE = 1024 * 1024 * 2; // 2MB
const MAX_QUANTITY_FILE = 15; // 15 files on once request
const DEFAULT_FILE_TYPE = 'IMAGES';

class _MultipleFileValidator extends FileValidator<ValidateOptions> {
  async isValid(files?: MediaData[]): Promise<boolean> {
    const {
      maxQuantity = 15,
      maxEach = 1024 * 1024 * 2,
      required = false,
      mimeType,
    } = this.validationOptions;
    if (!required && !files) return true;
    if (required && !files) return false;
    if (files.length > maxQuantity) return false;
    const regexp = new RegExp(`/${UploadTypesEnum[mimeType]}/g`);
    const rejectedFile = files.find(
      (file) => file.size > maxEach || !file.mimetype.match(regexp),
    );
    if (rejectedFile) return false;
    return true;
  }
  buildErrorMessage(files: MediaData[]): string {
    const {
      maxQuantity = 15,
      maxEach = 1024 * 1024 * 2,
      required = false,
      mimeType,
    } = this.validationOptions;

    if (required && !files) {
      return 'File is required';
    }

    if (files.length > maxQuantity) {
      return `File quantity exceed: ${maxQuantity}`;
    }

    const regexp = new RegExp(`/${UploadTypesEnum[mimeType]}/g`);
    const rejectedFile = files.find(
      (file) => file.size > maxEach || !file.mimetype.match(regexp),
    );
    if (!rejectedFile.mimetype.match(regexp)) {
      return `File ${rejectedFile.filename} is not allowed: ${UploadTypesEnum[mimeType]}`;
    }
    if (rejectedFile.size > maxEach) {
      return `File ${
        rejectedFile.filename
      } is over size: ${string.cvtToNormalSize(rejectedFile.size)}`;
    }
    return 'Not known error';
  }
}

export const MultipleFileValidator = (options?: Partial<ValidateOptions>) => {
  const {
    required = false,
    maxEach = MAX_SIZE_FILE,
    maxQuantity = MAX_QUANTITY_FILE,
    mimeType = DEFAULT_FILE_TYPE,
  } = options ?? {};
  return new ParseFilePipe({
    validators: [
      new _MultipleFileValidator({
        required,
        maxEach,
        maxQuantity,
        mimeType,
      }),
    ],
  });
};
