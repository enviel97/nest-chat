import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { CorsOption } from '../../cors';
import { Event, Services } from 'src/common/define';
import { Server } from 'socket.io';
import { AuthenticationSocket } from '../gateway.session';
import { Inject } from '@nestjs/common';
import string from 'src/utils/string';

@WebSocketGateway({ cors: CorsOption })
export class MessagingGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
  ) {}

  @WebSocketServer()
  server: Server;

  private emitSocket<T>(
    id: string,
    payload: T,
    event: string,
    option?: SocketEmitOptions,
  ) {
    const socket: AuthenticationSocket = this.sessions.getSocketId(id);
    if (!socket) return;
    return socket.emit(event, {
      ...payload,
      ...(!option?.isEmitWithCreator && socket.user),
    });
  }

  @OnEvent(Event.EVENT_MESSAGE_SENDING)
  handleNotificationMessageSending(payload: ResponseMessage) {
    const { message, members } = payload;
    members.forEach((member) => {
      if (member !== string.getId(message.author)) {
        this.emitSocket<IMessage>(member, message, Event.EVENT_MESSAGE_CREATED);
      }
    });
  }

  @OnEvent(Event.EVENT_MESSAGE_DELETE)
  handleNotificationMessageDelete(payload: ResponseDeleteMessage) {
    const { members, lastMessage, message } = payload;
    members.forEach((member) => {
      if (member !== string.getId(message.author)) {
        this.emitSocket(
          member,
          {
            lastMessage: lastMessage,
            messageId: string.getId(message),
            conversationId: message.conversationId,
          },
          Event.EVENT_MESSAGE_REMOVE,
        );
      }
    });
  }

  //  Subscribe
  @SubscribeMessage(Event.EVENT_USER_TYPING)
  handleUserTyping(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    console.log(
      `>>> ${client.user.firstName} typing in conversation-${data.conversationId}`,
    );
    client
      .to(`conversation-${data.conversationId}`)
      .emit(Event.EVENT_USER_TYPED, {
        userId: string.getId(client.user),
        message: `${client.user.firstName} typings`,
      });
  }
}
