import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface AuthenticationSocket extends Socket {
  user?: User;
}

@Injectable()
export class GatewaySessionManager implements IGatewaySession {
  private readonly sessions: Map<string, AuthenticationSocket> = new Map();

  getSocketId(id: string): AuthenticationSocket | undefined {
    return this.sessions.get(id);
  }

  setUserSocket(userId: string, socket: AuthenticationSocket) {
    const authSocket = this.sessions.get(userId);
    if (!authSocket) {
      this.sessions.set(userId, socket);
      return;
    }
    throw new Error('Conflict listener');
  }

  removeUserSocket(userId: string) {
    this.sessions.delete(userId);
  }

  getSockets(): Map<string, AuthenticationSocket> {
    return this.sessions;
  }
}
