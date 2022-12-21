interface IConversationsService {
  createConversation(
    conversation: ConversationCreateParams,
  ): Promise<Conversation>;
  getConversations(authorId: string): Promise<Conversation[]>;
  findConversationById(id: string): Promise<Conversation>;
}
