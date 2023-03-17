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
interface EmitForAllConversationOptions {
  isEmitWithCreator?: boolean;
  ignoreList?: string[];
}
@WsG({ cors: CorsOption })
export class ConversationGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
  ) {}

  @WebSocketServer()
  server: Server;

  private emitUpdateConversation(
    payload: Conversation,
    event: string,
    option?: EmitForAllConversationOptions,
  ) {
    const { isEmitWithCreator = true, ignoreList = [] } = option ?? {};
    const { participant } = payload;
    (<Participant<User>>participant).members
      .filter((user) => ignoreList.includes(string.getId(user)))
      .forEach((user) => {
        this.sessions.emitSocket<Conversation>(
          string.getId(user),
          payload,
          event,
          { isEmitWithCreator },
        );
      });
  }

  @OnEvent(Event.EVENT_CONVERSATION_SENDING)
  handleNotificationConversationCreated(payload: Conversation) {
    this.emitUpdateConversation(payload, Event.EVENT_CONVERSATION_CREATED);
  }

  @OnEvent(Event.EVENT_CONVERSATION_ADD_MEMBER)
  handleAddNewMemberToConversation(@MessageBody() payload: Conversation) {
    this.emitUpdateConversation(payload, Event.EVENT_CONVERSATION_CREATED);
  }

  @OnEvent(Event.EVENT_CONVERSATION_LEAVE)
  handleUserLeaveGroupChat(@MessageBody() payload: Conversation) {
    this.emitUpdateConversation(payload, Event.EVENT_CONVERSATION_LEAVE_GROUP);
  }

  @OnEvent(Event.EVENT_CONVERSATION_BANNED_MEMBER)
  handleBannedMember(@MessageBody() payload: BannedMemberPayload) {
    const { conversation, bannerId, type } = payload;

    this.emitUpdateConversation(conversation, Event.EVENT_REMOVE_NEW_MEMBERS);
    this.sessions.emitSocket(
      bannerId,
      {
        conversationId: string.getId(conversation),
        bannerId,
        type,
      },
      Event.EVENT_BANNED_USER,
    );
  }

  @SubscribeMessage(Event.EVENT_CONNECT_ROOM_CONVERSATION)
  async handleUserConnectConversation(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    console.log(
      `>>> ${string.getFullName(client.user)} join in conversation-${
        data.conversationId
      }`,
    );
    const conversationId = data.conversationId;
    await client.join(`conversation-${conversationId}`);
    client
      .to(`conversation-${conversationId}`)
      .emit(Event.EVENT_CONNECTED_ROOM, {
        id: string.getId(client.user),
        message: `${string.getFullName(client.user)} join`,
      });
  }

  @SubscribeMessage(Event.EVENT_LEAVE_ROOM_CONVERSATION)
  async handleUserDisconnectConversation(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    console.log(
      `>>> ${string.getFullName(client.user)} leaving conversation-${
        data.conversationId
      }`,
    );
    const conversationId = data.conversationId;
    await client.leave(`conversation-${conversationId}`);
    client.to(`conversation-${conversationId}`).emit(Event.EVENT_LEAVED_ROOM, {
      id: string.getId(client.user),
      message: `${string.getFullName(client.user)} leaved`,
    });
  }
}
