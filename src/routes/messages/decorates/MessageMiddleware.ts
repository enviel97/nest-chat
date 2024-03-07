import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ConversationNotFoundException } from 'src/routes/conversation/exception/conversation.exception';

interface MessageRequest {
  conversation: Conversation;
}

export const ConversationOfMessage = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request = <MessageRequest>ctx.switchToHttp().getRequest();
    const conversation = request.conversation;
    if (!conversation) throw new ConversationNotFoundException();
    return conversation;
  },
);
