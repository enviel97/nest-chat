import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Throttle } from '@nestjs/throttler';
import { Event, Routes, Services } from 'src/common/define';
import { CreateConversationDTO } from 'src/models/conversations';
import { AuthUser, ResponseSuccess } from 'src/utils/decorates';
import { AuthenticateGuard } from '../../auth/utils/Guards';

enum ConversationType {
  GROUP = 'group',
  DIRECT = 'direct',
}

@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticateGuard)
class ConversationController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messagesService: IMessengerService,
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async newConversation(params: NewConversationProps) {
    const { authorId, idParticipants } = params;
    const newConversation = await this.conversationsService.createConversation({
      creator: authorId,
      idParticipant: [...idParticipants, authorId],
    });
    return newConversation;
  }

  private async newMessage(params: NewMessageProps) {
    const { content, conversationId, author } = params;
    if (!content) return;
    const newMessage = await this.messagesService.createMessage({
      conversationId: conversationId,
      author: author,
      content: content,
    });
    return newMessage;
  }

  @Post()
  @ResponseSuccess({
    code: HttpStatus.CREATED,
    message: 'Create conversation successfully',
  })
  async createConversation(
    @Body() conversation: CreateConversationDTO,
    @AuthUser() author: IUser,
  ) {
    const newConversation = await this.newConversation({
      authorId: author.getId(),
      idParticipants: conversation.idParticipant,
    });
    const newMessage = await this.newMessage({
      content: conversation.message,
      author: author,
      conversationId: newConversation.getId(),
    });

    const response = {
      ...newConversation,
      author: author,
      lastMessage: newMessage ?? newConversation.lastMessage,
    };
    this.eventEmitter.emit(Event.EVENT_CONVERSATION_SENDING, response);

    return response;
  }

  @Get()
  @Throttle(100, 5)
  @ResponseSuccess({
    message: 'Get list conversation successfully',
  })
  async getAllConversation(
    @Query('type') type: ConversationType,
    @AuthUser() author: User,
  ) {
    const response = await this.conversationsService.getConversations(
      author.id ?? author._id,
      {
        limit: 20,
        bucket: 0,
        type: type ?? 'direct',
      },
    );
    return response;
  }
}

export default ConversationController;
