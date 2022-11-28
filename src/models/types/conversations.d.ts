interface ConversationDetail {
  author: string | User;
  participant: string | User;
  lastMessage: string | Message;
}

type Conversation = ConversationDetail &
  TimeStamps &
  Identity & { messages: IMessages[] };

type IConversation = Partial<Conversation>;

interface ConversationCreateParams {
  authorId: string;
  message?: string;
  participantId: string;
}
