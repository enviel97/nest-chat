interface ResponseModified {
  conversation: Conversation<any>;
  newUsers: User[];
}

interface ConversationModifiedMembers {
  author: string;
  idParticipant: string[];
}

type ConversationGroupAction = 'Add' | 'Remove';

interface IGroupConversationServices {
  addMoreMembers(
    conversationId: string,
    inviterIds: string[],
  ): Promise<ResponseModified>;
  removeMoreMembers(
    conversationId: string,
    bannedIds: string[],
  ): Promise<ResponseModified>;
  leave(conversationId: string, authorId: string): Promise<Conversation>;
}
