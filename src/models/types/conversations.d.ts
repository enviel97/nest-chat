interface ConversationDetail {
  author: string | User;
  participant: string | User;
  lastMessage: string | Message;
}

type IConversation = ConversationDetail &
  TimeStamps &
  Identity & { messages: IMessages[] };

type Conversation = Partial<IConversation>;

interface ConversationCreateParams {
  authorId: string;
  message?: string;
  participantId: string;
}
