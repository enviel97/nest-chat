import { HttpException, HttpStatus } from '@nestjs/common';

export class ImageStorageException extends HttpException {
  constructor() {
    let message = 'Image storage service has error';
    super(message, HttpStatus.BAD_REQUEST);
  }
}
