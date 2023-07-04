import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
import { OnEvent } from '@nestjs/event-emitter';
import { Event2 } from 'src/common/event/event';

@WsG({ cors: CorsOption })
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
    @Inject(Services.PROFILE)
    private readonly profileService: IProfileService,
  ) {}

  @WebSocketServer()
  server: Server;

  private readonly mapFriendList = new Map<string, string[]>();

  @OnEvent(Event2.subscribe.PROFILE_UPDATE_INFO)
  async handleUpdateProfileInfo(payload: Profile<User>) {
    const { friends } = await this.profileService.listFriends(
      payload.user.getId(),
    );
    const ids = friends.map((friend) => friend.user.getId());
    this.sessions.emitSocket(
      ids,
      {
        id: payload.getId(),
        bio: payload.bio,
        displayName: payload.displayName,
      },
      Event2.emit.PROFILE_UPDATE,
    );
  }

  @OnEvent(Event2.subscribe.PROFILE_CHANGE_STATUS)
  async handleUpdateProfileStatus(payload: Profile<User>) {
    const { friends } = await this.profileService.listFriends(
      payload.user.getId(),
    );
    const ids = friends.map((friend) => friend.user.getId());
    this.sessions.emitSocket(
      ids,
      { id: payload.getId(), status: payload.status },
      Event2.emit.PROFILE_UPDATE,
    );
  }

  @SubscribeMessage(Event.EVENT_FRIEND_LIST_STATUS)
  async handleGetFriendListRetrieve(
    @ConnectedSocket() client: AuthenticationSocket,
    @MessageBody() payload: string[],
  ) {
    const sockets = this.sessions.getSockets();
    const prevFriend = this.mapFriendList.get(client.user.getId());
    const onlineIds = payload.filter((id) => sockets.has(id));
    if (onlineIds.isEqual(prevFriend)) return;
    // memory friend list
    this.mapFriendList.set(client.user.getId(), onlineIds);
    return onlineIds;
  }

  handleConnection(client: AuthenticationSocket, ...args: any[]) {
    console.log(`>>> Memory online friend: ${client.user.getId()}`);
    this.sessions.setUserSocket(client.user.getId(), client);
    this.mapFriendList.set(client.user.getId(), []);
  }

  handleDisconnect(client: AuthenticationSocket) {
    console.log(`>>> New Out coming Connection from: ${client.id}.`);
    this.sessions.removeUserSocket(client.user.id);
    console.log(
      `>>> User >>> name: ${client.user.firstName} ${client.user.lastName}`,
    );
  }
}
