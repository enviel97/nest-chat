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
import { callEmit } from '../utils/call.utils';
import string from 'src/utils/string';

@WsG({ cors: CorsOption })
export class CallGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession<AuthenticationSocket>,

    @Inject(Services.PROFILE)
    private readonly profileServices: IProfileService,
  ) {}

  @WebSocketServer()
  server: Server;

  async getUserInfo(user: User) {
    const profile = await this.profileServices.getProfile(user.getId());
    return {
      id: user.getId(),
      name: profile?.displayName ?? user.getFullName(),
      avatar: profile?.avatar,
      createdAt: new Date().toISOString(),
    };
  }

  @SubscribeMessage(Event2.client.CALL_VIDEO_CALLING)
  async handleVideoCalling(
    @MessageBody() data: CallPayload,
    @ConnectedSocket() callerSocket: AuthenticationSocket,
  ) {
    const { callId, receiver } = data;
    const receiverSocket = this.sessions.getSocketId(receiver);
    if (!receiverSocket)
      return callEmit(callerSocket, 'user-unavailable', callId);
    const [callerInfo, receiverInfo] = await Promise.all([
      this.getUserInfo(callerSocket.user),
      this.getUserInfo(receiverSocket.user),
    ]);
    callEmit(receiverSocket, 'calling', { callId, user: callerInfo });
    return { type: 'calling', data: { callId, user: receiverInfo } };
  }

  @SubscribeMessage(Event2.client.CALL_VIDEO_CALL_ACCEPT)
  async handleVideoCallingAccept(
    @MessageBody() data: AcceptCallPayload,
    @ConnectedSocket() receiverSocket: AuthenticationSocket,
  ) {
    const { callId, caller } = data;
    const receiverId = receiverSocket.user.getId();
    const callerSocket = this.sessions.getSocketId(caller);
    if (!callerSocket)
      return callEmit(receiverSocket, 'user-unavailable', callId);
    callEmit(callerSocket, 'accept', {
      callId,
      connecterId: receiverId,
    });

    return { type: 'accept' };
  }

  @SubscribeMessage(Event2.client.CALL_VIDEO_CALL_REJECT)
  async handleVideoCallReject(
    @MessageBody() data: RejectCallPayload,
    @ConnectedSocket() socket: AuthenticationSocket,
  ) {
    const destSocket = this.sessions.getSocketId(data.connecterId);
    if (!destSocket) return;

    const payload = {
      callId: data.callId,
      from: socket.user.getId(),
      to: data.connecterId,
    };
    callEmit(destSocket, 'reject', payload);
  }

  @SubscribeMessage(Event2.client.CALL_VIDEO_MODIFY_DEVICES)
  async handleCameraVideo(
    @MessageBody() data: ControllerCallPayload,
    @ConnectedSocket() socket: AuthenticationSocket,
  ) {
    const { callId, connecterId, enable, type } = data;
    const destSocket = this.sessions.getSocketId(connecterId);
    if (!destSocket) return;
    destSocket.emit(Event2.emit.CALL_VIDEO_MODIFY_DEVICES, {
      callId: callId,
      from: socket.user.getId(),
      to: connecterId,
      type: type,
      enable: enable,
    });
  }
}
