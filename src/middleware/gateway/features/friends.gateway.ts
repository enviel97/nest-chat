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
import string from 'src/utils/string';

@WsG({ cors: CorsOption })
export class WebsocketGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
  ) {}

  @WebSocketServer()
  server: Server;

  @OnEvent(Event.EVENT_FRIEND_SEND_REQUEST)
  handleSendFriendRequest(@MessageBody() payload: FriendRequest<User>) {
    const { friend, author, status } = payload;
    const event =
      status === 'Accept'
        ? Event.EVENT_FRIEND_RECEIVE_ALLOW_FRIEND
        : Event.EVENT_FRIEND_RECEIVE_FRIEND_REQUEST;
    this.sessions.emitSocket([string.getId(friend)], author, event);
  }
}
