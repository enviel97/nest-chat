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
    @Inject(Services.MESSAGES)
    private readonly messagesService: IMessengerService,
    @Inject(Services.PARTICIPANT)
    private readonly conversationsService: IParticipantService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async _createNoticeMessage(
    conversationId: string,
    author: User,
    participant: User[],
    action: 'banned' | 'invite',
  ) {
    const content =
      action === 'banned'
        ? `${participant
            .map((user) => user.firstName)
            .join(', ')} has been add by ${author.firstName}`
        : `${participant
            .map((user) => user.firstName)
            .join(' ,')} has been banned by ${author.firstName}`;
    const message = await this.messagesService.createMessage({
      content: content,
      conversationId: conversationId,
      author: string.getId(author),
      action: 'Notice',
    });
    this.eventEmitter.emit(Event.EVENT_MESSAGE_SENDING, message);
  }

  @Post()
  async addMembers(
    @Param('id') id: string,
    @Body() body: ConversationAddMember,
    @AuthUser() author: IUser,
    @Res() res: Response,
  ) {
    const { conversation: result, newUsers } =
      await this.conversationsService.addMoreMembers(id, {
        author: string.getId(author),
        idParticipant: [...body.idParticipants, string.getId(author)],
      });
    await this._createNoticeMessage(id, author, newUsers, 'invite');
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
    const { conversation: result, newUsers } =
      await this.conversationsService.removeMoreMembers(conversationId, {
        author: string.getId(author),
        idParticipant: [userId],
      });
    const typeConversation =
      (<Participant<User>>result.participant).members.length > 2
        ? 'group'
        : 'direct';

    await this._createNoticeMessage(conversationId, author, newUsers, 'invite');
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
