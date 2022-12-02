import { OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { CorsOption } from '../cors';
import { Event } from 'src/common/define';
import { Socket } from 'socket.io';

enum CONNECTED_STATUS {
  GOOD = 'good',
  BAD = 'bad',
}

@WebSocketGateway({
  cors: CorsOption,
})
export class MessagingGateway implements OnGatewayConnection {
  constructor() {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage(Event.EVENT_CREATE_MESSAGE)
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create Message');
  }

  handleConnection(client: Socket, ...args: any[]) {
    try {
      client.emit(Event.EVENT_SOCKET_CONNECTED, {
        status: CONNECTED_STATUS.GOOD,
        client: client.id,
      });
      console.log(client.id);
    } catch (error) {
      client.emit(Event.EVENT_SOCKET_CONNECTED, {
        status: CONNECTED_STATUS.BAD,
      });
    }
  }

  @OnEvent(Event.EMIT_MESSAGE_SENDING)
  handleNotificationMessageSending(payload: any) {
    const message = payload as Message;
    this.server.emit(Event.EMIT_NOTIFICATION_MESSAGE, payload);
  }
}
