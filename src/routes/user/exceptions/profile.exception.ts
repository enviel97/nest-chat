import { HttpException, HttpStatus } from '@nestjs/common';

export class UserProfileNotFoundException extends HttpException {
  constructor() {
    let message = 'Profile user not found';
    super(message, HttpStatus.BAD_REQUEST);
  }
}
