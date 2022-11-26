interface MessageCreateParams {
  conversationId: string;
  content: string;
  authorId: string;
}

interface MessageDetail {
  conversationId: string;
  content: string;
  author: string;
}

type Message = Partial<MessageDetail & TimeStamps, Identity>;
