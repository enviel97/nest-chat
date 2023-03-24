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
class ConversationGroupController {
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
    action: 'banned' | 'invite' | 'leave',
  ) {
    let content = `${participant
      .map((user) => user.firstName)
      .join(', ')} has been add by ${author.firstName}`;

    switch (action) {
      case 'banned':
        content = `${participant
          .map((user) => user.firstName)
          .join(', ')} has been banned by ${author.firstName}`;
        break;
      case 'leave':
        content = `${author.firstName} leave group`;
        break;
    }

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
    @AuthUser() author: User,
    @Res() res: Response,
  ) {
    const { conversation: result, newUsers } =
      await this.conversationsService.addMoreMembers(id, {
        author: string.getId(author),
        idParticipant: body.idParticipants,
      });
    await this._createNoticeMessage(id, author, newUsers, 'invite');
    this.eventEmitter.emit(Event.EVENT_CONVERSATION_ADD_MEMBER, {
      conversation: result,
      newUsers: body.idParticipants,
    });

    return res.json({
      code: HttpStatus.OK,
      message: 'Add new member to your conversation successfully',
      data: result,
    });
  }

  @Delete('leave')
  async leave(
    @Param('id') conversationId: string,
    @AuthUser() author: User,
    @Res() res: Response,
  ) {
    const conversation = await this.conversationsService.leave(
      conversationId,
      string.getId(author),
    );

    await this._createNoticeMessage(conversationId, author, [author], 'leave');

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_LEAVE, conversation);

    return res.json({
      code: HttpStatus.OK,
      message: 'Leaving group chat successfully',
      data: conversation,
    });
  }

  @Delete(':userId')
  async removeMembers(
    @Param('id') conversationId: string,
    @Param('userId') userId: string,
    @AuthUser() author: User,
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

    await this._createNoticeMessage(conversationId, author, newUsers, 'banned');
    this.eventEmitter.emit(Event.EVENT_CONVERSATION_BANNED_MEMBER, {
      conversation: result,
      bannerId: userId,
      type: typeConversation,
    } as BannedMemberPayload);

    return res.json({
      code: HttpStatus.OK,
      message: 'Remove member out off group chat successfully',
      data: result,
    });
  }
}

export default ConversationGroupController;
