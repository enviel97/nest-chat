interface IGatewaySession<T = any> {
  getSocketId(id: string): T | undefined;
  setUserSocket(userId: string, socket: T);
  removeUserSocket(userId: string);
  getSockets(): Map<string, T>;
  emitSocket<T>(
    ids: string[],
    payload: T,
    event: string,
    option?: SocketEmitOptions,
  ): void;
}

interface UserTypeMessaged {
  conversationId: string;
  userId: string;
}

interface SocketEmitOptions {
  isEmitWithCreator?: boolean;
  ignoreIds?: string[];
}

interface BannedMemberPayload {
  conversation: Conversation;
  bannerId: string;
  type: 'group' | 'direct';
}

interface InviteMemberPayload {
  conversation: Conversation;
  newUsers: string[];
}

interface GetMemberStatusPayload {
  conversationId: string;
  userId: string;
}

interface GetMembersStatusPayload {
  conversationId: string;
}
