import {
  Body,
  Controller,
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
import { Response } from 'express';
import { Event, Routes, Services } from 'src/common/define';
import { CreateMessageDTO } from 'src/models/messages';

import { AuthUser } from 'src/utils/decorates';
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
    @AuthUser() user: IUser,
    @Body() createMessageDTO: CreateMessageDTO,
  ) {
    const newMessage = await this.messageService.createMessage({
      author: user.id ?? user._id,
      ...createMessageDTO,
    });

    this.eventEmitter.emit(Event.EVENT_MESSAGE_SENDING, newMessage);

    return {
      code: 200,
      message: 'Create mess success',
      data: newMessage.message,
    };
  }

  @Get(':id')
  async getConversation(
    @Param('id') params: string,
    @Query('limit') limit: number | undefined,
    @Query('bucket') bucket: number | undefined,
    @Res() res: Response,
  ) {
    const data = await this.messageService.getMessages(params, {
      limit: limit ?? 20,
      bucket: bucket ?? 1,
    });
    return res.json({
      code: HttpStatus.OK,
      message: 'Get list conversation successfully',
      data: data,
    });
  }
}
