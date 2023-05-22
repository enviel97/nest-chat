type MessageAction = 'New' | 'Edited' | 'Removed' | 'Seen' | 'Notice';
type MessageType = 'banned' | 'invite' | 'leave';

interface IMessageAttachment {
  downloadLink: string;
  publicId: string;
  type: string;
}

interface MessageCreateParams {
  author: User;
  conversationId: string;
  content?: string;
  action?: MessageAction;
  attachments?: MediaData[];
}

interface MessageDeleteParams {
  userId: string;
  conversationId: string;
  messageId: string;
}
interface MessageEditParams {
  messageId: string;
  content: string;
  action: MessageAction;
}
interface MessageDetail {
  conversationId: string;
  author: User;
  action: MessageAction;
  attachments?: MessageAttachment[];
  content?: string;
}

type MessageAttachment = TimeStamps & Identity & IMessageAttachment;

type IMessage = MessageDetail & TimeStamps & Identity;

type Message = Partial<IMessage>;
