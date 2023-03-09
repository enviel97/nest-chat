import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { Event, Routes, Services } from 'src/common/define';
import { ParseObjectIdPipe } from 'src/middleware/parse/mongoDb';
import { CreateMessageDTO } from 'src/models/messages';
import EditContentMessageDTO from 'src/models/messages/dto/EditContentMessageDTO';

import { AuthUser } from 'src/utils/decorates';
import string from 'src/utils/string';
import { AuthenticateGuard } from '../auth/utils/Guards';

@Controller(Routes.MESSAGES)
@UseGuards(AuthenticateGuard)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessengerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createMessage(
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @AuthUser() user: IUser,
    @Body() createMessageDTO: CreateMessageDTO,
  ) {
    const newMessage = await this.messageService.createMessage({
      author: user.id ?? user._id,
      conversationId,
      ...createMessageDTO,
    });

    this.eventEmitter.emit(Event.EVENT_MESSAGE_SENDING, newMessage);

    return {
      code: 200,
      message: 'Create message success',
      data: newMessage.message,
    };
  }

  @Get()
  async getMessagesByConversationId(
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Query('limit') limit: number | undefined,
    @Query('bucket') bucket: number | undefined,
    @Res() res: Response,
  ) {
    const data = await this.messageService.getMessages(conversationId, {
      limit: limit ?? 20,
      bucket: bucket ?? 1,
    });
    return res.json({
      code: HttpStatus.OK,
      message: 'Get list conversation successfully',
      data: data,
    });
  }

  @Delete(':id')
  async deleteMessage(
    @AuthUser() user: User,
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Param('id', ParseObjectIdPipe) messageId: string,
    @Res() res: Response,
  ) {
    const result = await this.messageService.editContentMessage({
      userId: string.getId(user),
      content: 'This chat is removed',
      action: 'Removed',
      conversationId,
      messageId,
    });

    this.eventEmitter.emit(Event.EVENT_MESSAGE_DELETE, {
      members: result.members,
      message: result.message,
      lastMessage: result.lastMessage,
    });

    return res.json({
      code: HttpStatus.OK,
      message: 'Delete message successfully',
      data: {
        conversationId: result.message.conversationId,
        messageId: string.getId(result.message),
        lastMessage: result.lastMessage,
        content: result.message.content,
        action: 'Removed',
      },
    });
  }

  @Put(':id')
  async editMessage(
    @AuthUser() user: User,
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Param('id', ParseObjectIdPipe) messageId: string,
    @Body() editMessageDTO: EditContentMessageDTO,
    @Res() res: Response,
  ) {
    const result = await this.messageService.editContentMessage({
      userId: string.getId(user),
      content: editMessageDTO.content,
      conversationId,
      messageId,
      action: 'Edited',
    });

    this.eventEmitter.emit(Event.EVENT_MESSAGE_UPDATE, {
      members: result.members,
      message: result.message,
      lastMessage: result.lastMessage,
    });

    return res.json({
      code: HttpStatus.OK,
      message: 'Edit message successfully',
      data: {
        conversationId: result.message.conversationId,
        messageId: string.getId(result.message),
        lastMessage: result.lastMessage,
        content: result.message.content,
        action: 'Edited',
      },
    });
  }
}
