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
  handleNotificationConversationCreated(payload: ConversationCreatePayload) {
    // TODO: Create conversation emit services
    const { author, ...conversation } = payload;
    const members = payload.participant.members.map(string.getId);
    this.sessions.emitSocket(
      members,
      conversation,
      Event.EVENT_CONVERSATION_CREATED,
      { ignoreIds: [author.getId()] },
    );
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

    const bannerSocket = this.sessions.getSocketId(bannerId);
    if (bannerSocket) bannerSocket.leave(this.conversationRoom(conversationId));
    this.emitUpdateConversation(Event.EVENT_REMOVE_NEW_MEMBERS, conversation);
    const bannedPayload = { conversationId, bannerId, type };

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
    const roomCode = this.conversationRoom(data.conversationId);
    await client.join(roomCode);
    console.log(
      `>>> [${string.getFullName(client.user)}] join in conversation-${
        data.conversationId
      }`,
    );
    client.to(roomCode).emit(Event.EVENT_NOTIFICATION_CHANGE_STATUS, {
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
    const roomCode = this.conversationRoom(data.conversationId);
    await client.leave(roomCode);

    this.server.to(roomCode).emit(Event.EVENT_NOTIFICATION_CHANGE_STATUS, {
      id: string.getId(client.user),
      message: `${string.getFullName(client.user)} leaved`,
      action: 'offline',
    });
  }

  @SubscribeMessage(Event.EVENT_PARTICIPANT_GET_STATUS)
  async handleGetParticipantStatus(
    @MessageBody() payload: GetMemberStatusPayload,
  ) {
    const { userId, conversationId } = payload;
    const sockets = this.sessions.getSockets();
    if (!sockets.has(userId)) return 'offline';
    const socket: AuthenticationSocket = this.sessions.getSocketId(userId);

    const isInRoom =
      socket && socket.rooms.has(this.conversationRoom(conversationId));
    return isInRoom ? 'online' : 'offline';
  }

  handleConnection(client: AuthenticationSocket, ...args: any[]) {
    // Listen on disconnecting
    client.on('disconnecting', (reason) => {
      const rooms = client.rooms;
      if (rooms.size === 0) return;
      rooms.forEach((roomId) => {
        if (roomId.includes('conversation-')) {
          this.server.to(roomId).emit(Event.EVENT_NOTIFICATION_CHANGE_STATUS, {
            id: string.getId(client.user),
            message: `${string.getFullName(client.user)} leaved`,
            action: 'offline',
          });
        }
      });

      console.log(`>>> ${string.getFullName(client.user)} Suddenly shutdown`);
    });
  }
}
