import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Routes, Services } from 'src/common/define';
import { CreateConversationDTO } from 'src/models/conversations';
import { AuthUser } from 'src/utils/decorates';
import string from 'src/utils/string';
import { AuthenticateGuard } from '../auth/utils/Guards';

@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticateGuard)
export class ConversationController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messagesService: IMessengerService,
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
  ) {}

  @Post()
  async createConversation(
    @Body() conversation: CreateConversationDTO,
    @AuthUser() author: IUser,
    @Res() res: Response,
  ) {
    let result = await this.conversationsService.createConversation({
      authorId: author.id ?? author._id,
      ...conversation,
    });
    let lastMessage = undefined;
    if (conversation.message) {
      const newMessage = await this.messagesService.createMessage({
        conversationId: string.getId(result),
        author: string.getId(author),
        content: conversation.message,
      });
      lastMessage = newMessage.message;
    }

    return res.json({
      code: HttpStatus.OK,
      message: 'Create successfully',
      data: { ...result, lastMessage: lastMessage ?? result.lastMessage },
    });
  }

  @Get()
  async getAllConversation(@AuthUser() author: User, @Res() res: Response) {
    const data = await this.conversationsService.getConversations(
      author.id ?? author._id,
    );
    return res.json({
      code: HttpStatus.OK,
      message: 'Get list conversation successfully',
      data: data,
    });
  }
}
