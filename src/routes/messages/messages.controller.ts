import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IsMongoId } from 'class-validator';
import { Response } from 'express';
import { Event, Routes, Services } from 'src/common/define';
import { ParseObjectIdPipe } from 'src/middleware/parse/mongoDb';
import { CreateMessageDTO } from 'src/models/messages';

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
      message: 'Create mess success',
      data: newMessage.message,
    };
  }

  @Get()
  async getMessagesByConversationId(
    @Param('conversationId') conversationId: string,
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
    const result = await this.messageService.deleteMessage({
      userId: string.getId(user),
      conversationId,
      messageId,
    });

    return res.json({
      code: HttpStatus.OK,
      message: 'Delete message successfully',
      data: result.message,
    });
  }
}
