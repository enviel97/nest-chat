import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { Event, Routes, Services } from 'src/common/define';
import ConversationAddMember from 'src/models/conversations/dto/ConversationAddMember';
import { AuthenticateGuard } from 'src/routes/auth/utils/Guards';
import { AuthUser } from 'src/utils/decorates';
import string from 'src/utils/string';

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
      inviter: string.getId(author),
      idParticipant: [...body.idParticipants, string.getId(author)],
    });

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_ADD_MEMBER, result);

    return res.json({
      code: HttpStatus.OK,
      message: 'Add new member to your conversation successfully',
      data: result,
    });
  }

  @Delete(':userId')
  async removeMembers(
    @Param('id') conversationId: string,
    @Param('userId') userId: string,
    @AuthUser() author: IUser,
    @Res() res: Response,
  ) {
    const result = await this.conversationsService.removeMoreMembers(
      conversationId,
      {
        inviter: string.getId(author),
        idParticipant: [userId],
      },
    );
    const typeConversation =
      (<Participant<User>>result.participant).members.length > 2
        ? 'group'
        : 'direct';
    this.eventEmitter.emit(Event.EVENT_CONVERSATION_BANNED_MEMBER, {
      conversationId,
      bannerId: userId,
      type: typeConversation,
    } as BannedMemberPayload);

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_REMOVE_MEMBER, result);
    return res.json({
      code: HttpStatus.OK,
      message: 'Remove member out off group chat successfully',
      data: result,
    });
  }
}
