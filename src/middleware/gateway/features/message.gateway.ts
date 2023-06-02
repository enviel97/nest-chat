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
import { Event2 } from 'src/common/event/event';

@WebSocketGateway({ cors: CorsOption })
export class MessagingGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
  ) {}

  @WebSocketServer()
  server: Server;

  private getMembersInConversation(payload: MessageModifiedPayload) {
    const { conversation, message } = payload;
    return new Set([
      ...(conversation.participant?.members.map((member) =>
        string.getId(member),
      ) ?? []),
      message.author.getId(),
    ]);
  }

  @OnEvent(Event.EVENT_MESSAGE_SENDING)
  handleNotificationMessageSend(payload: MessageModifiedPayload) {
    const { message } = payload;
    this.sessions.emitSocket(
      [...this.getMembersInConversation(payload)],
      payload.message,
      Event.EVENT_MESSAGE_CREATED,
      { ignoreIds: [message.author.getId()] },
    );
  }

  @OnEvent(Event.EVENT_MESSAGE_DELETE)
  handleNotificationMessageDelete(payload: MessageModifiedPayload) {
    const { message } = payload;
    this.sessions.emitSocket(
      [...this.getMembersInConversation(payload)],
      {
        messageId: string.getId(message),
        conversationId: message.conversationId,
      },
      Event.EVENT_MESSAGE_REMOVE,
      { ignoreIds: [message.author.getId()] },
    );
  }

  @OnEvent(Event.EVENT_MESSAGE_UPDATE)
  handleNotificationMessageEdited(payload: MessageModifiedPayload) {
    const { message } = payload;
    console.log(payload);
    this.sessions.emitSocket(
      [...this.getMembersInConversation(payload)],
      {
        messageId: message.getId(),
        content: message.content,
        conversationId: message.conversationId,
      },
      Event.EVENT_MESSAGE_EDITED,
      { ignoreIds: [message.author.getId()] },
    );
  }

  @OnEvent(Event2.subscribe.EVENT_MESSAGE_UPDATE_LAST_MESSAGE)
  handleUpdateLastMessage(payload: MessageUploadLastMessagePayload) {
    const { message } = payload;
    this.sessions.emitSocket(
      [...this.getMembersInConversation(payload)],
      message,
      Event2.emit.EVENT_MESSAGE_UPDATE_LAST_MESSAGE,
      { ignoreIds: [message.author.getId()] },
    );
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
