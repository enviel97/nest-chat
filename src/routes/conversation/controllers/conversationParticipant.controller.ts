import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
  Param,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { Event, Routes, Services } from 'src/common/define';
import ConversationAddMember from 'src/models/conversations/dto/ConversationAddMember';
import { AuthenticateGuard } from 'src/routes/auth/utils/Guards';
import { AuthUser } from 'src/utils/decorates';
import string from 'src/utils/string';

enum ConversationType {
  GROUP = 'group',
  DIRECT = 'direct',
}

@Controller(Routes.PARTICIPANT)
@UseGuards(AuthenticateGuard)
export class ConversationParticipantController {
  constructor(
    @Inject(Services.PARTICIPANT)
    private readonly conversationsService: IParticipantService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async addMembers(
    @Param('id') id: string,
    @Body() body: ConversationAddMember,
    @AuthUser() author: IUser,
    @Res() res: Response,
  ) {
    const result = await this.conversationsService.addMoreMembers(id, {
      idParticipant: [...body.idParticipants, string.getId(author)],
    });

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_SENDING, result);

    return res.json({
      code: HttpStatus.OK,
      message: 'Add new member to your conversation successfully',
      data: result,
    });
  }
}
