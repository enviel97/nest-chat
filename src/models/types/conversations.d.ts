type ConversationType = 'users' | 'participants';

interface ConversationDetail {
  participant: string | Participant<string | User>;
  lastMessage: string | Message;
}

type IConversation = ConversationDetail &
  TimeStamps &
  Identity & { messages: IMessages[] };

type Conversation = Partial<IConversation>;

interface ConversationCreateParams {
  emailParticipant: string[];
}
