interface ConversationCreatePayload extends TimeStamps, Identity {
  participant: Participant<User>;
  lastMessage: Message;
  name: string;
  type: ConversationType;
  author: User;
}
