import { ForbiddenException } from '@nestjs/common';

export class GatewayException extends ForbiddenException {
  constructor(readonly msg?: string) {
    const pre = 'Invalid authenticate gateway';
    super(pre.concat(msg ? `: ${msg}` : ''));
  }
}
