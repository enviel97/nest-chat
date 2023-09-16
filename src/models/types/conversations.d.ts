type ConversationType = 'direct' | 'group';

interface ConversationDetail<T = any> {
  participant: Participant<T>;
  lastMessage: string | Message;
  name: string;
  type: ConversationType;
}

type IConversation<T extends any> = ConversationDetail<T> &
  TimeStamps &
  Identity & { messages: IMessages[] };

type Conversation<T = any> = Partial<IConversation<T>>;

interface ConversationCreateParams {
  creator: string;
  idParticipant: string[];
}

// Type v2

interface ConversationMembers extends Identity {
  participant: Participant<string>;
  lastMessage: Message;
  name: string;
  type: ConversationType;
}
