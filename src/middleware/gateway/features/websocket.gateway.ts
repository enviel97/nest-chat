import {
  ConnectedSocket,
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

enum CONNECTED_STATUS {
  GOOD = 'good',
  BAD = 'bad',
}

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

  private async handleNotificationRetrieve(
    client: AuthenticationSocket,
    status: 'online' | 'offline',
  ) {
    try {
      const { friends, profileId } = await this.profileService.listFriends(
        client.user.getId(),
      );
      const friendIds = friends.map((friend) => friend.user.getId());

      this.sessions.emitSocket(
        friendIds,
        {
          userId: profileId,
          status: status,
        },
        Event.EVENT_FRIEND_LIST_RETRIEVE,
      );
    } catch (error) {
      console.log(`Error:::${error}`);
    }
  }
  async handleConnection(client: AuthenticationSocket, ...args: any[]) {
    console.log(`>>> New Incoming Connection from: ${client.id}`);
    this.sessions.setUserSocket(string.getId(client.user as any), client);

    client.emit(Event.EVENT_SOCKET_CONNECTED, {
      status: CONNECTED_STATUS.GOOD,
      client: client.id,
    });
    /**
     * Notification for all friend i online
     */
    await this.handleNotificationRetrieve(client, 'online').then(() => {
      console.log(`>>> ${client.user.getFullName()} online successfully`);
    });

    /**
     * Notification for all friend i disconnect
     */
    client.on('disconnecting', async (reason) => {
      console.log(`>>> ${client.user.getFullName()} suddenly offline`);
      await this.handleNotificationRetrieve(client, 'offline');
    });
    // Listen on disconnecting
  }

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
  ) {
    const sockets = this.sessions.getSockets();
    const { friends } = await this.profileService.listFriends(
      client.user.getId(),
    );

    const { online, offline } = friends.reduce(
      (reduceObject, currentValue) => {
        if (sockets.has(currentValue.user.getId())) {
          reduceObject.online.add(currentValue.getId());
        } else {
          reduceObject.offline.add(currentValue.getId());
        }
        return reduceObject;
      },
      {
        online: new Set<string>(),
        offline: new Set<string>(),
      },
    );
    client.emit(Event.EVENT_FRIEND_LIST_STATUS_RESPONSE, {
      online: [...online],
      offline: [...offline],
      listFriend: friends,
    });
  }

  handleDisconnect(client: AuthenticationSocket) {
    console.log(`>>> New Out coming Connection from: ${client.id}.`);
    this.sessions.removeUserSocket(client.user.id);
    console.log(
      `>>> User >>> name: ${client.user.firstName} ${client.user.lastName}`,
    );
  }
}
