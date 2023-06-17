import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateConversationException extends HttpException {
  constructor(protected readonly msg?: string) {
    const prefix: string = 'Cannot create conversation';
    super(prefix.concat(msg ? `: ${msg}` : ''), HttpStatus.BAD_REQUEST);
  }
}
