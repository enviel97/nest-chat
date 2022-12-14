interface IConversationsService {
  createConversation(
    conversation: ConversationCreateParams,
  ): Promise<Conversation>;
  getConversations(authorId: string): Promise<Conversation[]>;
}
