import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationService implements IConversationsService {
  createConversation(conversation: ConversationCreateParams) {}
}
