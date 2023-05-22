import {
  BadGatewayException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const MessageConversation = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request = <MessageRequest>ctx.switchToHttp().getRequest();
    const conversation = request.conversation;
    if (!conversation) throw new BadGatewayException('Conversation not found');
    return conversation;
  },
);
