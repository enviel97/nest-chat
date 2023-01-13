import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway as WsG,
  WebSocketServer,
} from '@nestjs/websockets';
import { CorsOption } from '../../cors';
import { Event, Services } from 'src/common/define';
import { Server } from 'socket.io';
import { AuthenticationSocket } from '../gateway.session';
import { Inject } from '@nestjs/common';
import string from 'src/utils/string';

@WsG({ cors: CorsOption })
export class ConversationGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
  ) {}

  @WebSocketServer()
  server: Server;

  @OnEvent(Event.EVENT_CONVERSATION_SENDING)
  handleNotificationConversationCreated(payload: Conversation) {
    const { participant } = payload;
    this.sessions.emitSocket<Conversation>(
      string.getId(participant),
      payload,
      Event.EVENT_CONVERSATION_CREATED,
      { isEmitWithCreator: true },
    );
  }

  @SubscribeMessage(Event.EVENT_CONNECT_ROOM_CONVERSATION)
  async handleUserConnectConversation(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    console.log(
      `>>> ${client.user.firstName} join in conversation-${data.conversationId}`,
    );
    const conversationId = data.conversationId;
    await client.join(`conversation-${conversationId}`);
    client
      .to(`conversation-${conversationId}`)
      .emit(Event.EVENT_CONNECTED_ROOM, {
        message: `${client.user.firstName} join`,
      });
  }

  @SubscribeMessage(Event.EVENT_LEAVE_ROOM_CONVERSATION)
  async handleUserDisconnectConversation(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    console.log(
      `>>> ${client.user.firstName} leaving conversation-${data.conversationId}`,
    );
    const conversationId = data.conversationId;
    await client.leave(`conversation-${conversationId}`);
    client.to(`conversation-${conversationId}`).emit(Event.EVENT_LEAVED_ROOM, {
      message: `${client.user.firstName} leaved`,
    });
  }
}
