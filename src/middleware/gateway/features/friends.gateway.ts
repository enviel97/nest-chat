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

  private handleRequest(payload: FriendRequest<Profile<User>>) {
    const { friendId } = payload;
    this.sessions.emitSocket(
      [friendId],
      payload,
      Event.EVENT_FRIEND_RECEIVE_FRIEND_REQUEST,
    );
  }

  private handleAcceptResponse(payload: FriendRequest<Profile<User>>) {
    const { authorId, friendProfile, authorProfile } = payload;
    this.sessions.emitSocket(
      [authorId],
      { friendProfile, authorProfile, _id: payload.getId() },
      Event.EVENT_FRIEND_RECEIVE_ALLOW_FRIEND,
    );
  }

  private handleRejectResponse(payload: FriendRequest<Profile<User>>) {
    const { authorId, authorProfile } = payload;
    this.sessions.emitSocket(
      [authorId],
      { authorProfile, _id: payload.getId() },
      Event.EVENT_FRIEND_RECEIVE_REJECT_FRIEND,
    );
  }

  @OnEvent(Event.EVENT_FRIEND_SEND_REQUEST)
  handleSendFriendRequest(
    @MessageBody() payload: FriendRequest<Profile<User>>,
  ) {
    switch (payload.status) {
      case 'Request':
        this.handleRequest(payload);
        break;
      case 'Accept':
        this.handleAcceptResponse(payload);
        break;
      case 'Reject':
        this.handleRejectResponse(payload);
        break;
    }
  }

  @OnEvent(Event.EVENT_FRIEND_REQUEST_CANCEL)
  handleFriendRequestCancel(
    @MessageBody() payload: FriendRequest<Profile<User>>,
  ) {
    const { friendId } = payload;
    this.sessions.emitSocket(
      [friendId],
      { _id: payload.getId() },
      Event.EVENT_FRIEND_RECEIVE_CANCEL_FRIEND_REQUEST,
    );
  }
}
