type ConversationType = 'direct' | 'group';

interface ConversationDetail<T = any> {
  participant: string | Participant<T>;
  lastMessage: string | Message;
  name: string;
  type: ConversationType;
}

type IConversation<T extends any> = ConversationDetail<T> &
  TimeStamps &
  Identity & { messages: IMessages[] };

type Conversation<T extends any> = Partial<IConversation<T>>;

interface ConversationCreateParams {
  creator: string;
  idParticipant: string[];
}

interface ConversationModifiedMembers {
  author: string;
  idParticipant: string[];
}
