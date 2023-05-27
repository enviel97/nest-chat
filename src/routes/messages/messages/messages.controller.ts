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
import { MultipleFileValidator } from 'src/adapter/image_storage/validator/MultipleFileValidator';
import { Event, Routes, Services } from 'src/common/define';
import { Event2 } from 'src/common/event/event';
import { ParseObjectIdPipe } from 'src/middleware/parse/mongoDb';
import { CreateMessageDTO } from 'src/models/messages';
import EditContentMessageDTO from 'src/models/messages/dto/EditContentMessageDTO';
import { AuthUser, ResponseSuccess } from 'src/utils/decorates';
import string from 'src/utils/string';
import { AuthenticateGuard } from '../../auth/utils/Guards';
import { MessageConversation } from '../utils/messages.decorate';

@Controller(Routes.MESSAGES)
@UseGuards(AuthenticateGuard)
@SkipThrottle()
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessengerService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  private updateLastMessage(
    conversation: ConversationMembers,
    message: Message,
  ) {
    const { lastMessage } = conversation;
    if (
      // message edit is not last message
      (lastMessage.getId() === message.getId() &&
        ['Edited', 'Removed'].includes(message.action)) ||
      // message is new
      message.action === 'New'
    ) {
      this.eventEmitter.emit(
        Event2.subscribe.EVENT_MESSAGE_UPDATE_LAST_MESSAGE,
        { conversation, message },
      );
    }
  }

  @Post()
  @UseInterceptors(FilesInterceptor('attachments'))
  @ResponseSuccess({ message: 'Create message successfully' })
  async createMessage(
    @MessageConversation() conversation: ConversationMembers,
    @AuthUser() user: User,
    @UploadedFiles(MultipleFileValidator()) attachments: Express.Multer.File[],
    @Body() createMessageDTO: CreateMessageDTO,
  ) {
    const newMessage = await this.messageService.createMessage({
      conversationId: conversation.getId(),
      author: user,
      content: createMessageDTO.content,
      attachments: attachments,
    });
    this.eventEmitter.emit(Event.EVENT_MESSAGE_SENDING, {
      message: newMessage,
      conversation: conversation,
    });
    this.updateLastMessage(conversation, newMessage);
    return newMessage;
  }

  @Get()
  @ResponseSuccess({ message: 'Get list conversation successfully' })
  async getMessagesByConversationId(
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Query('limit') limit: number | undefined,
    @Query('bucket') bucket: number | undefined,
  ) {
    const data = await this.messageService.getMessages(conversationId, {
      limit: limit ?? 20,
      bucket: bucket ?? 1,
    });
    return data;
  }

  @Delete(':id')
  @ResponseSuccess({ message: 'Delete message successfully' })
  async deleteMessage(
    @MessageConversation() conversation: ConversationMembers,
    @Param('id', ParseObjectIdPipe) messageId: string,
  ) {
    const result = await this.messageService.editContentMessage({
      content: 'This chat is removed',
      action: 'Removed',
      messageId,
    });

    this.eventEmitter.emit(Event.EVENT_MESSAGE_DELETE, {
      message: result,
      conversation: conversation,
    });
    this.updateLastMessage(conversation, result);

    return {
      conversationId: result.conversationId,
      messageId: string.getId(result),
      content: result.content,
      action: 'Removed',
    };
  }

  @Put(':id')
  @ResponseSuccess({ message: 'Edit message successfully' })
  async editMessage(
    @MessageConversation() conversation: ConversationMembers,
    @Param('id', ParseObjectIdPipe) messageId: string,
    @Body() editMessageDTO: EditContentMessageDTO,
  ) {
    const result = await this.messageService.editContentMessage({
      content: editMessageDTO.content,
      messageId,
      action: 'Edited',
    });

    this.eventEmitter.emit(Event.EVENT_MESSAGE_UPDATE, {
      message: result,
      conversation: conversation,
    });
    this.updateLastMessage(conversation, result);

    return {
      conversationId: result.conversationId,
      messageId: string.getId(result),
      content: result.content,
      action: 'Edited',
    };
  }
}
