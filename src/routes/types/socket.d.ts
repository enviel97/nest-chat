interface IGatewaySession {
  getSocketId(id: string): AuthenticationSocket | undefined;
  setUserSocket(userId: string, socket: AuthenticationSocket);
  removeUserSocket(userId: string);
  getSockets(): Map<string, AuthenticationSocket>;
}

interface UserTypeMessaged {
  conversationId: string;
  userId: string;
}
