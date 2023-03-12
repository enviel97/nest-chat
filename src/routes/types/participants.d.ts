interface IParticipantService {
  addMoreMembers(
    conversationId: string,
    params: ConversationCreateParams,
  ): Promise<Conversation>;
}
