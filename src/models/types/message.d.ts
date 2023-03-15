type MessageAction = 'New' | 'Edited' | 'Removed' | 'Seen' | 'Notice';

interface MessageCreateParams {
  author: string;
  conversationId: string;
  content: string;
  action?: MessageAction;

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
  action: MessageAction;
}
interface MessageDetail {
  conversationId: string;
  content: string;
  author: User;
  action: MessageAction;
}

type IMessage = MessageDetail & TimeStamps & Identity;

type Message = Partial<IMessage>;
