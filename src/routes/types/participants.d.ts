interface ResponseModified {
  conversation: Conversation;
  newUsers: User[];
}
interface IParticipantService {
  addMoreMembers(
    conversationId: string,
    params: ConversationModifiedMembers,
  ): Promise<ResponseModified>;
  removeMoreMembers(
    conversationId: string,
    params: ConversationModifiedMembers,
  ): Promise<ResponseModified>;
  leave(conversationId: string, authorId: string): Promise<Conversation>;
}
