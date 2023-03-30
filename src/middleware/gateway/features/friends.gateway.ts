import {
  MessageBody,
  WebSocketGateway as WsG,
  WebSocketServer,
} from '@nestjs/websockets';
import { CorsOption } from '../../cors';
import { Event, Services } from 'src/common/define';
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WsG({ cors: CorsOption })
export class FriendGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
  ) {}

  @WebSocketServer()
  server: Server;

  @OnEvent(Event.EVENT_FRIEND_SEND_REQUEST)
  handleSendFriendRequest(
    @MessageBody() payload: FriendRequest<Profile<User>>,
  ) {
    const { friendId } = payload;
    this.sessions.emitSocket(
      [friendId],
      payload,
      Event.EVENT_FRIEND_RECEIVE_FRIEND_REQUEST,
    );
  }
}
