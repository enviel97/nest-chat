import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
export class ConversationGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
  ) {}

  @WebSocketServer()
  server: Server;

  private conversationRoom(id: string) {
    return `conversation-${id}`;
  }

  private emitUpdateConversation(event: string, payload: Conversation<User>) {
    const ROOM_NAME = this.conversationRoom(string.getId(payload));
    this.server.to(ROOM_NAME).emit(event, payload);
  }

  @OnEvent(Event.EVENT_CONVERSATION_SENDING)
  handleNotificationConversationCreated(payload: Conversation<any>) {
    this.emitUpdateConversation(Event.EVENT_CONVERSATION_CREATED, payload);
  }

  @OnEvent(Event.EVENT_CONVERSATION_ADD_MEMBER)
  handleAddNewMemberToConversation(
    @MessageBody() payload: InviteMemberPayload,
  ) {
    const { conversation, newUsers } = payload;
    this.emitUpdateConversation(Event.EVENT_CONVERSATION_CREATED, conversation);
    this.sessions.emitSocket(
      newUsers,
      conversation,
      Event.EVENT_CONVERSATION_CREATED,
    );
  }

  @OnEvent(Event.EVENT_CONVERSATION_LEAVE)
  handleUserLeaveGroupChat(@MessageBody() payload: Conversation<any>) {
    this.emitUpdateConversation(Event.EVENT_CONVERSATION_LEAVE_GROUP, payload);
  }

  @OnEvent(Event.EVENT_CONVERSATION_BANNED_MEMBER)
  async handleBannedMember(@MessageBody() payload: BannedMemberPayload) {
    const { conversation, bannerId, type } = payload;
    const conversationId = string.getId(conversation);
    await this.sessions
      .getSocketId(bannerId)
      .leave(this.conversationRoom(conversationId));
    this.emitUpdateConversation(Event.EVENT_REMOVE_NEW_MEMBERS, conversation);

    const bannedPayload = {
      conversationId,
      bannerId,
      type,
    };
    this.sessions.emitSocket(
      [bannerId],
      bannedPayload,
      Event.EVENT_BANNED_USER,
    );
  }

  @SubscribeMessage(Event.EVENT_CONNECT_ROOM_CONVERSATION)
  async handleUserConnectConversation(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    const conversationId = data.conversationId;
    await client.join(this.conversationRoom(conversationId));
    console.log(
      `>>> [${string.getFullName(client.user)}] join in conversation-${
        data.conversationId
      }`,
    );
    // client
    //   .to(this.conversationRoom(conversationId))
    //   .emit(Event.EVENT_CONNECTED_ROOM, {
    //     message: `${string.getFullName(client.user)} join`,
    //   });
    client
      .to(this.conversationRoom(conversationId))
      .emit(Event.EVENT_NOTIFICATION_CHANGE_STATUS, {
        id: string.getId(client.user),
        message: `${string.getFullName(client.user)} join`,
        action: 'online',
      });
  }

  @SubscribeMessage(Event.EVENT_LEAVE_ROOM_CONVERSATION)
  async handleUserDisconnectConversation(
    @MessageBody() data: UserTypeMessaged,
    @ConnectedSocket() client: AuthenticationSocket,
  ) {
    const conversationId = data.conversationId;
    // client
    //   .to(this.conversationRoom(conversationId))
    //   .emit(Event.EVENT_LEAVED_ROOM, {
    //     message: `${string.getFullName(client.user)} leaved`,
    //   });

    client
      .to(this.conversationRoom(conversationId))
      .emit(Event.EVENT_NOTIFICATION_CHANGE_STATUS, {
        id: string.getId(client.user),
        message: `${string.getFullName(client.user)} leaved`,
        action: 'offline',
      });

    await client.leave(this.conversationRoom(conversationId));
    console.log(
      `>>> [${string.getFullName(client.user)}] leaving conversation-${
        data.conversationId
      }`,
    );
  }

  @SubscribeMessage(Event.Event_PARTICIPANT_STATUS_RESPONSE)
  async handleGetParticipantStatus(@MessageBody() data: string) {
    const sockets = this.sessions.getSockets();
    if (sockets.has(data)) return 'online';
    return 'offline';
  }

  handleConnection(client: AuthenticationSocket, ...args: any[]) {
    // Listen on disconnecting
    client.on('disconnecting', (reason) => {
      const rooms = [...this.server.sockets.adapter.rooms].filter(([room]) =>
        room.includes('conversation-'),
      );
      if (rooms.length === 0) return;
      rooms.forEach(([roomId]) => {
        this.server.to(roomId).emit(Event.EVENT_NOTIFICATION_CHANGE_STATUS, {
          id: string.getId(client.user),
          message: `${string.getFullName(client.user)} leaved`,
          action: 'offline',
        });
      });
      console.log(`>>> ${string.getFullName(client.user)} Suddenly shutdown`);
    });
  }
}
