interface IGatewaySession {
  getSocketId(id: string): AuthenticationSocket | undefined;
  setUserSocket(userId: string, socket: AuthenticationSocket);
  removeUserSocket(userId: string);
  getSockets(): Map<string, AuthenticationSocket>;
  emitSocket<T>(
    id: string,
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
}

interface BannedMemberPayload {
  conversation: Conversation;
  bannerId: string;
  type: 'group' | 'direct';
}
