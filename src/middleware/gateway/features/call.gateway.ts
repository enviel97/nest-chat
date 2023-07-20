import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway as WsG,
  WebSocketServer,
} from '@nestjs/websockets';
import { CorsOption } from '../../cors';
import type { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { Services } from 'src/common/define';
import { Event2 } from 'src/common/event/event';
import { AuthenticationSocket } from '../gateway.session';
import string from 'src/utils/string';

@WsG({ cors: CorsOption })
export class CallGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession<AuthenticationSocket>,

    @Inject(Services.CONVERSATIONS)
    private readonly conversationService: IConversationsService,
  ) {}

  @WebSocketServer()
  server: Server;

  //#region Utils
  private getUserInfo(user: User) {
    return {
      id: user.getId(),
      name: user.profile?.displayName ?? string.getFullName(user),
      avatar: user.profile?.avatar,
      createdAt: new Date().toISOString(),
    };
  }

  private genCallId(participants: string[]) {
    return participants.sort((a, b) => b.localeCompare(a)).join('');
  }

  private callEvent(type: CallSuccess | CallFailure) {
    switch (type) {
      case 'calling': {
        return Event2.emit.CALL_VIDEO_CALLING;
      }
      case 'accept': {
        return Event2.emit.CALL_VIDEO_CALL_ACCEPT;
      }
      case 'reject': {
        return Event2.emit.CALL_VIDEO_CALL_REJECT;
      }

      // Error
      case 'user-unavailable':
        return Event2.emit.CALL_VIDEO_CALL_ERROR;
    }
  }

  private emit<T>(
    socket: AuthenticationSocket,
    type: CallSuccess | CallFailure,
    data?: T,
  ) {
    const event = this.callEvent(type);
    console.log({ event, payload: { type, ...(data && { data }) } });
    socket.emit(event, { type, ...(data && { data }) });
  }
  //#endregion

  @SubscribeMessage(Event2.client.CALL_VIDEO_CALLING)
  async handleVideoCalling(
    @MessageBody() data: CallPayload,
    @ConnectedSocket() callerSocket: AuthenticationSocket,
  ) {
    const callerId = callerSocket.user.getId();
    const receiverSocket = this.sessions.getSocketId(data.receiver);
    if (!receiverSocket) return this.emit(callerSocket, 'user-unavailable');
    const callerInfo = this.getUserInfo(callerSocket.user);
    const receiverInfo = this.getUserInfo(receiverSocket.user);
    const listIds = [callerId, data.receiver];
    const callId = this.genCallId(listIds);
    this.emit(receiverSocket, 'calling', { callId, user: callerInfo });
    return { type: 'calling', data: { callId, user: receiverInfo } };
  }

  @SubscribeMessage(Event2.client.CALL_VIDEO_CALL_ACCEPT)
  async handleVideoCallingAccept(
    @MessageBody() data: AcceptCallPayload,
    @ConnectedSocket() receiverSocket: AuthenticationSocket,
  ) {
    const receiverId = receiverSocket.user.getId();
    const callerSocket = this.sessions.getSocketId(data.caller);
    if (!callerSocket) return this.emit(receiverSocket, 'user-unavailable');
    const callerInfo = this.getUserInfo(callerSocket.user);
    const listIds = [data.caller, receiverId];
    const callId = this.genCallId(listIds);
    this.emit(callerSocket, 'accept', {
      callId,
      from: callerInfo.id,
      to: receiverId,
    });

    return { type: 'accept', data: { callId, user: callerInfo } };
  }

  @SubscribeMessage(Event2.client.CALL_VIDEO_P2P_ERROR)
  async handleP2PError(
    @MessageBody() data: P2PErrorServicesPayload,
    @ConnectedSocket() socket: AuthenticationSocket,
  ) {
    const { callId, to } = data;
    const participantSocket = this.sessions.getSocketId(to);
    if (participantSocket) {
      participantSocket.emit(Event2.emit.CALL_VIDEO_CALL_ERROR, {
        callId,
        from: socket.user.getId(),
      });
    }
    return;
  }
}
