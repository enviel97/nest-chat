import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotfoundException extends HttpException {
  constructor() {
    let message = 'User not found';
    super(message, HttpStatus.BAD_REQUEST);
  }
}
