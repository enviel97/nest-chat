import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Routes, Services } from 'src/common/named';
import CreateConversationDTO from 'src/models/conversations/dto/ConversationCreate';

@Controller(Routes.CONVERSATIONS)
export class ConversationController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
  ) {}

  @Post()
  createConversation(@Body() conversation: CreateConversationDTO) {
    this.conversationsService.createConversation(conversation);
  }
}
