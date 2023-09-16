import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import { Event, Routes, Services } from 'src/common/define';
import { ParseObjectIdPipe } from 'src/middleware/parse/mongoDb';
import { CreateMessageDTO } from 'src/models/messages';
import EditContentMessageDTO from 'src/models/messages/dto/EditContentMessageDTO';
import { AuthUser, ResponseSuccess } from 'src/utils/decorates';
import string from 'src/utils/string';
import { AuthenticateGuard } from '../../auth/utils/Guards';
import { EmitModifiedMessage } from '../decorates/EmitModifiedMessage';
import { ConversationOfMessage } from '../decorates/MessageMiddleware';
@Controller(Routes.MESSAGES)
@UseGuards(AuthenticateGuard)
@SkipThrottle()
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessengerService,
    /**
     * Decorate will use this, not clean
     */
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments'))
  @ResponseSuccess({ message: 'Create message successfully' })
  @EmitModifiedMessage(Event.EVENT_MESSAGE_SENDING)
  async createMessage(
    @Param('conversationId') conversationId: string,
    @AuthUser() user: User,
    @UploadedFiles() attachments: Array<Express.Multer.File>,
    @Body() createMessageDTO: CreateMessageDTO,
  ) {
    const newMessage = await this.messageService.createMessage({
      conversationId: conversationId,
      author: user,
      content: createMessageDTO.content,
      attachments: attachments,
    });
    return newMessage;
  }

  @Get()
  @ResponseSuccess({ message: 'Get list conversation successfully' })
  async getMessagesByConversationId(
    @ConversationOfMessage() conversation: Conversation,
    @Query('limit') limit: number | undefined,
    @Query('bucket') bucket: number | undefined,
  ) {
    const payload = await this.messageService.getMessages(
      conversation.getId(),
      {
        limit: limit ?? 20,
        bucket: bucket ?? 1,
      },
    );
    return {
      ...payload,
      data: { conversation, messages: payload.data },
    };
  }

  @Delete(':id')
  @ResponseSuccess({ message: 'Delete message successfully' })
  @EmitModifiedMessage(Event.EVENT_MESSAGE_DELETE)
  async deleteMessage(@Param('id', ParseObjectIdPipe) messageId: string) {
    const result = await this.messageService.editContentMessage({
      content: 'This chat is removed',
      action: 'Removed',
      messageId,
    });

    return {
      conversationId: result.conversationId,
      id: string.getId(result),
      content: result.content,
      author: result.author,
      action: 'Removed',
    };
  }

  @Put(':id')
  @ResponseSuccess({ message: 'Edit message successfully' })
  @EmitModifiedMessage(Event.EVENT_MESSAGE_UPDATE)
  async editMessage(
    @Param('id', ParseObjectIdPipe) messageId: string,
    @Body() editMessageDTO: EditContentMessageDTO,
  ) {
    const result = await this.messageService.editContentMessage({
      content: editMessageDTO.content,
      messageId,
      action: 'Edited',
    });

    return {
      conversationId: result.conversationId,
      id: string.getId(result),
      content: result.content,
      author: result.author,
      action: 'Edited',
    };
  }
}
