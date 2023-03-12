interface GetConversationsOption extends PaginationOption {
  type: 'group' | 'direct';
}

interface IConversationsService {
  createConversation(
    conversation: ConversationCreateParams,
  ): Promise<Conversation>;
  getConversations(
    authorId: string,
    options: GetConversationsOption,
  ): Promise<Conversation[]>;
  findConversationById(id: string): Promise<Conversation>;
  addMoreMembers(
    conversationId: string,
    params: ConversationCreateParams,
  ): Promise<Conversation>;
}
