import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

export class UserProfileNotFoundException extends HttpException {
  constructor() {
    let message = 'Profile user not found';
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UserProfileCreateException extends BadRequestException {
  constructor() {
    let message = 'Create profile failure';
    super(message);
  }
}
