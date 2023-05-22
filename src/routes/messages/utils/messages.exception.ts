import { HttpException, HttpStatus } from '@nestjs/common';

export class MessagesCreateException extends HttpException {
  constructor() {
    super('Message need one of content or attachments', HttpStatus.BAD_REQUEST);
  }
}
