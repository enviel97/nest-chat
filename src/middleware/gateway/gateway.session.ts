import { Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';

export interface AuthenticationSocket extends Socket {
  user?: User;
}

@Injectable()
export class GatewaySessionManager implements IGatewaySession {
  private readonly sessions: Map<string, AuthenticationSocket> = new Map();

  emitSocket<T>(
    ids: string[],
    payload: T,
    event: string,
    option?: SocketEmitOptions,
  ) {
    const { isEmitWithCreator = false, ignoreIds = [] } = option ?? {};
    // mapping (On)
    const _ignoreIds = new Map<string, number>(
      ignoreIds.map((id, index) => [id, index]),
    );

    ids.forEach((id) => {
      if (_ignoreIds.has(id)) return;
      const socket: AuthenticationSocket = this.getSocketId(id);
      if (!socket) return;
      socket.emit(event, {
        ...payload,
        ...(isEmitWithCreator && { sender: socket.user }),
      });
    });
  }

  getSocketId(id: string): AuthenticationSocket | undefined {
    return this.sessions.get(id);
  }

  setUserSocket(userId: string, socket: AuthenticationSocket) {
    this.sessions.set(userId, socket);
  }

  removeUserSocket(userId: string) {
    this.sessions.delete(userId);
  }

  getSockets(): Map<string, AuthenticationSocket> {
    return this.sessions;
  }
}
