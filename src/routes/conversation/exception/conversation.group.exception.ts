import { BadRequestException } from "@nestjs/common";

/**
 * Participant exception
 */
export class ParticipantModifyException extends BadRequestException {
  constructor(protected readonly msg?: string) {
    const prefix = 'Cannot modify members in group chat';
    super(prefix.concat(msg ? `: ${msg}` : ''));
  }
}

export class ParticipantMemberNotFoundException extends BadRequestException {
  constructor(protected readonly msg?: string) {
    const prefix = 'Cannot modify members in group chat';
    super(prefix.concat(msg ? `: ${msg}` : ''));
  }
}
