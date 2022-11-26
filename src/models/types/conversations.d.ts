interface ConversationDetail {
  author: string | User;
  participant: string | User;
  lastMessage: string;
  lastMessageTime: string;
}

type IConversation = ConversationDetail & TimeStamps & Identity;

type Conversation = Partial<IConversation>;

interface ConversationCreateParams {
  authorId: string;
  message?: string;
  participantId: string;
}

interface ConversationCreateResult {
  isNew: boolean;
  conversation: Conversation;
}
