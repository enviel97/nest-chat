import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { CorsOption } from '../cors';
import { Event, Services } from 'src/common/define';
import { Server } from 'socket.io';
import { AuthenticationSocket } from './gateway.session';
import { Inject } from '@nestjs/common';
import string from 'src/utils/string';

enum CONNECTED_STATUS {
  GOOD = 'good',
  BAD = 'bad',
}

@WebSocketGateway({ cors: CorsOption })
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
    @Inject(Services.CONVERSATIONS)
    private readonly conversationServices: IConversationsService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: AuthenticationSocket, ...args: any[]) {
    console.log(`>>>>>>>>> New Incoming Connection >>> id: ${client.id}`);
    this.sessions.setUserSocket(string.getId(client.user as any), client);
    console.log(
      `>>>>>>>>> User >>> name: ${client.user.firstName} ${client.user.lastName}`,
    );

    client.emit(Event.EVENT_SOCKET_CONNECTED, {
      status: CONNECTED_STATUS.GOOD,
      client: client.id,
    });
  }

  private emitSocket<T>(
    id: string,
    payload: T,
    event: string,
    option?: SocketEmitOptions,
  ) {
    const socket: AuthenticationSocket = this.sessions.getSocketId(id);
    if (!socket) return;
    if (!option?.isEmitWithCreator) {
      socket.emit(event, payload);
    } else {
      const data = { ...payload, sender: socket.user };
      socket.emit(event, data);
    }
  }

  @OnEvent(Event.EVENT_MESSAGE_SENDING)
  handleNotificationMessageSending(payload: ResponseMessage) {
    const { message, members } = payload;
    members.forEach((member) => {
      this.emitSocket<IMessage>(member, message, Event.EVENT_MESSAGE_CREATED);
    });
  }

  @OnEvent(Event.EVENT_CONVERSATION_SENDING)
  handleNotificationConversationCreated(payload: Conversation) {
    const { participant } = payload;
    this.emitSocket<Conversation>(
      string.getId(participant),
      payload,
      Event.EVENT_CONVERSATION_CREATED,
      { isEmitWithCreator: true },
    );
  }

  // //  event
  @SubscribeMessage(Event.EVENT_USER_TYPING)
  handleUserTyping(@MessageBody() data: UserTypeMessaged) {
    console.log('Someone typing');
  }

  @SubscribeMessage(Event.EVENT_CONNECT_ROOM_CONVERSATION)
  handleUserConnectConversation(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    console.log('Someone typing');
  }
}
