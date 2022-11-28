interface MessageCreateParams {
  author: string;
  conversationId: string;
  content: string;

  // // TODO: Base 64
  // attachment?: string;
}

interface MessageDetail {
  conversationId: string;
  content: string;
  author: string;
}

type IMessage = MessageDetail & TimeStamps & Identity;

type Message = Partial<IMessage>;
