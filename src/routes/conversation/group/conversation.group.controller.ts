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
import { NotificationMessage } from './decorate/NotificationMessage';
@Controller(Routes.PARTICIPANT)
@UseGuards(AuthenticateGuard)
class ConversationGroupController {
  constructor(
    @Inject(Services.PARTICIPANT)
    private readonly conversationsService: IParticipantService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @NotificationMessage('invite')
  async addMembers(
    @Param('id') id: string,
    @Body() body: ConversationAddMember,
    @Res() res: Response,
  ) {
    const { conversation: result, newUsers } =
      await this.conversationsService.addMoreMembers(id, body.idParticipants);

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_ADD_MEMBER, {
      conversation: result,
      newUsers: body.idParticipants,
    });
    res.json({
      code: HttpStatus.OK,
      message: 'Add new member to your conversation successfully',
      data: result,
    });

    // cache in decorate
    return newUsers;
  }

  @Delete('leave')
  @NotificationMessage('leave')
  async leave(
    @Param('id') conversationId: string,
    @AuthUser() author: User,
    @Res() res: Response,
  ) {
    const conversation = await this.conversationsService.leave(
      conversationId,
      string.getId(author),
    );

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_LEAVE, conversation);

    res.json({
      code: HttpStatus.OK,
      message: 'Leaving group chat successfully',
      data: conversation,
    });

    // cache in decorate
    return [author];
  }

  @Delete(':userId')
  @NotificationMessage('banned')
  async removeMembers(
    @Param('id') conversationId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const { conversation: result, newUsers } =
      await this.conversationsService.removeMoreMembers(conversationId, [
        userId,
      ]);

    this.eventEmitter.emit(Event.EVENT_CONVERSATION_BANNED_MEMBER, {
      conversation: result,
      bannerId: userId,
      type: result.type,
    } as BannedMemberPayload);
    res.json({
      code: HttpStatus.OK,
      message: 'Remove member out off group chat successfully',
      data: result,
    });

    return newUsers;
  }
}

export default ConversationGroupController;
