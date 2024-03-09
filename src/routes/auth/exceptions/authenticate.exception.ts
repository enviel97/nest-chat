import { HttpException, HttpStatus } from '@nestjs/common';

export class LoginFailureException extends HttpException {
  constructor() {
    super('Login error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
export class LogoutFailureException extends HttpException {
  constructor() {
    super('Logout error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
