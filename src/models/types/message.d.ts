interface MessageCreateParams {
  author: string;
  conversationId: string;
  content: string;

  // // TODO: Base 64
  // attachment?: string;
}
interface MessageDeleteParams {
  userId: string;
  conversationId: string;
  messageId: string;
}

interface MessageDetail {
  conversationId: string;
  content: string;
  author: User;
}

type IMessage = MessageDetail & TimeStamps & Identity;

type Message = Partial<IMessage>;
