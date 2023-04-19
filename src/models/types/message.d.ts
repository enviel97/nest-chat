type MessageAction = 'New' | 'Edited' | 'Removed' | 'Seen' | 'Notice';
type MessageType = 'banned' | 'invite' | 'leave';

interface MessageCreateParams {
  author: User;
  conversationId: string;
  content: string;
  action?: MessageAction;
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
