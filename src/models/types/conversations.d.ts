type ConversationType = 'users' | 'participants';

interface ConversationDetail {
  author: string | User;
  participant: string | Participant<string | User>;
  lastMessage: string | Message;
}

type IConversation = ConversationDetail &
  TimeStamps &
  Identity & { messages: IMessages[] };

type Conversation = Partial<IConversation>;

interface ConversationCreateParams {
  authorId: string;
  emailParticipant: string[];
}
