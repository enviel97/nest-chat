type MessageAction = 'New' | 'Edited' | 'Removed' | 'Seen' | 'Notice';
type MessageType = 'banned' | 'invite' | 'leave';

interface MessageAttachment extends TimeStamps, Identity {
  downloadLink: string;
  previewLink: string;
  type: string;
}

interface MessageCreateParams {
  author: User;
  conversationId: string;
  content: string;
  action?: MessageAction;
  attachments?: Express.Multer.File[];
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
  attachments: MessageAttachment[];
}

type IMessage = MessageDetail & TimeStamps & Identity;

type Message = Partial<IMessage>;
