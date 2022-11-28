interface IConversationsService {
  createConversation(
    conversation: ConversationCreateParams,
  ): Promise<IConversation>;
  getConversations(authorId: string): Promise<IConversation[]>;
  getConversation(id: string): Promise<IConversation>;
}
