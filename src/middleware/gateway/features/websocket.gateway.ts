import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway as WsG,
  WebSocketServer,
} from '@nestjs/websockets';
import { CorsOption } from '../../cors';
import { Event, Services } from 'src/common/define';
import { Server } from 'socket.io';
import { AuthenticationSocket } from '../gateway.session';
import { Inject } from '@nestjs/common';
import string from 'src/utils/string';
import { OnEvent } from '@nestjs/event-emitter';

enum CONNECTED_STATUS {
  GOOD = 'good',
  BAD = 'bad',
}

@WsG({ cors: CorsOption })
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: AuthenticationSocket, ...args: any[]) {
    console.log(`>>> New Incoming Connection from: ${client.id}`);
    this.sessions.setUserSocket(string.getId(client.user as any), client);

    client.emit(Event.EVENT_SOCKET_CONNECTED, {
      status: CONNECTED_STATUS.GOOD,
      client: client.id,
    });
  }

  @OnEvent(Event.EVENT_FRIEND_LIST_RETRIEVE)
  handleFriendListRetrieve(
    @ConnectedSocket() socket: AuthenticationSocket,
    @MessageBody() data: string,
  ) {}

  handleDisconnect(client: AuthenticationSocket) {
    console.log(`>>> New Out coming Connection from: ${client.id}.`);
    this.sessions.removeUserSocket(client.user.id);
    console.log(
      `>>> User >>> name: ${client.user.firstName} ${client.user.lastName}`,
    );
  }
}
