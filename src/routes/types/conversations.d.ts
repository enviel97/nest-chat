interface GetConversationsOption extends PaginationOption {
  type: 'group' | 'direct';
}

interface IConversationsService {
  createConversation(
    conversation: ConversationCreateParams,
  ): Promise<Conversation<any>>;
  getConversations(
    authorId: string,
    options: GetConversationsOption,
  ): Promise<Conversation<any>[]>;
}
