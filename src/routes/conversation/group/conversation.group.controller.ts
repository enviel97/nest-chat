import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event, Routes, Services } from 'src/common/define';
import ConversationAddMember from 'src/models/conversations/dto/ConversationAddMember';

import { AuthenticateGuard } from 'src/routes/auth/utils/Guards';
import { AuthUser, ResponseSuccess } from 'src/utils/decorates';
import string from 'src/utils/string';
import { NotificationMessage } from './decorate/NotificationMessage';
@Controller(Routes.PARTICIPANT)
@UseGuards(AuthenticateGuard)
class ConversationGroupController {
  constructor(
    @Inject(Services.PARTICIPANT)
    private readonly conversationsService: IGroupConversationServices,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @ResponseSuccess({ message: 'Add new members successfully' })
  @NotificationMessage('invite')
  async addMembers(
    @Param('id') conversationId: string,
    @Body() body: ConversationAddMember,
  ) {
    const { conversation, newUsers } =
      await this.conversationsService.addMoreMembers(
        conversationId,
        body.idParticipants,
      );

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_ADD_MEMBER, {
      conversation: conversation,
      newUsers: body.idParticipants,
    });

    return { ...conversation, modify: newUsers };
  }

  @Delete('leave')
  @ResponseSuccess({ message: 'Leaving group chat successfully' })
  @NotificationMessage('leave')
  async leave(@Param('id') conversationId: string, @AuthUser() author: User) {
    const conversation = await this.conversationsService.leave(
      conversationId,
      string.getId(author),
    );

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_LEAVE, conversation);
    return { ...conversation, modify: [author] };
  }

  @Delete(':userId')
  @ResponseSuccess({ message: 'Remove member out off group chat successfully' })
  @NotificationMessage('banned')
  async removeMembers(
    @Param('id') conversationId: string,
    @Param('userId') userId: string,
  ) {
    const { conversation, newUsers } =
      await this.conversationsService.removeMoreMembers(conversationId, [
        userId,
      ]);

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_BANNED_MEMBER, {
      conversation,
      bannerId: userId,
      type: conversation.type,
    } as BannedMemberPayload);

    return { ...conversation, modify: newUsers };
  }
}

export default ConversationGroupController;
