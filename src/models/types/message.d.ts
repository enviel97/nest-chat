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
interface MessageEditParams {
  userId: string;
  conversationId: string;
  messageId: string;
  content: string;
  action: 'New' | 'Edited' | 'Removed';
}
interface MessageDetail {
  conversationId: string;
  content: string;
  author: User;
  action: 'New' | 'Edited' | 'Removed';
}

type IMessage = MessageDetail & TimeStamps & Identity;

type Message = Partial<IMessage>;
