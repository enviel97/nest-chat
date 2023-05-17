import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

export const ValidateProfileImage = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
    new FileTypeValidator({ fileType: /(image\/)(jpg|png|jpeg|webp)/g }),
  ],
});
