interface IConversationsService {
  createConversation(
    conversation: ConversationCreateParams,
  ): Promise<ConversationCreateResult>;
  getConversations(authorId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation>;
}
