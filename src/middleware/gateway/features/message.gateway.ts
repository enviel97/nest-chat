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

  @OnEvent(Event.EVENT_MESSAGE_SENDING)
  handleNotificationMessageSend(payload: ResponseMessage) {
    const { message, members } = payload;
    members.forEach((member) => {
      if (member !== string.getId(message.author)) {
        this.sessions.emitSocket<IMessage>(
          member,
          message,
          Event.EVENT_MESSAGE_CREATED,
        );
      }
    });
  }

  @OnEvent(Event.EVENT_MESSAGE_DELETE)
  handleNotificationMessageDelete(payload: ResponseMessageWithLastMessage) {
    const { members, lastMessage, message } = payload;
    members.forEach((member) => {
      if (member !== string.getId(message.author)) {
        this.sessions.emitSocket(
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

  @OnEvent(Event.EVENT_MESSAGE_UPDATE)
  handleNotificationMessageEdited(payload: ResponseMessageWithLastMessage) {
    const { members, lastMessage, message } = payload;
    members.forEach((member) => {
      if (member !== string.getId(message.author)) {
        this.sessions.emitSocket(
          member,
          {
            lastMessage: lastMessage,
            messageId: string.getId(message),
            content: message.content,
            conversationId: message.conversationId,
          },
          Event.EVENT_MESSAGE_EDITED,
        );
      }
    });
  }

  //  Subscribe
  @SubscribeMessage(Event.EVENT_USER_TYPING_START)
  handleUserTyping(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    console.log(
      `>>> ${string.getFullName(client.user)} typing in conversation-${
        data.conversationId
      }`,
    );
    client
      .to(`conversation-${data.conversationId}`)
      .emit(Event.EVENT_USER_TYPED, {
        userId: string.getId(client.user),
        message: `${string.getFullName(client.user)} typings`,
      });
  }

  //  Subscribe
  @SubscribeMessage(Event.EVENT_USER_TYPING_STOP)
  handleUserStopTyping(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    console.log(
      `>>> ${string.getFullName(client.user)} stop typing in conversation-${
        data.conversationId
      }`,
    );
    client
      .to(`conversation-${data.conversationId}`)
      .emit(Event.EVENT_USER_TYPED, {
        userId: string.getId(client.user),
        message: '',
      });
  }
}
