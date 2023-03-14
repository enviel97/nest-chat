interface IParticipantService {
  addMoreMembers(
    conversationId: string,
    params: ConversationModifiedMembers,
  ): Promise<Conversation>;
  removeMoreMembers(
    conversationId: string,
    params: ConversationModifiedMembers,
  ): Promise<Conversation>;
}
