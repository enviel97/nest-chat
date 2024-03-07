import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

export class UserNotfoundException extends HttpException {
  constructor() {
    let message = 'User not found';
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UserCreateException extends BadRequestException {
  constructor() {
    let message = 'Create user failure';
    super(message);
  }
}
