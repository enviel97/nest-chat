import { WebSocketGateway as WsG, WebSocketServer } from '@nestjs/websockets';
import { CorsOption } from '../../cors';
import { Services } from 'src/common/define';
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QueuesEmit, QueuesEvent } from 'src/common/queues';
import { Event2 } from 'src/common/event/event';

@WsG({ cors: CorsOption })
export class MediaGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,

    @Inject(Services.PROFILE)
    private readonly profileServices: IProfileService,
  ) {}

  @WebSocketServer()
  server: Server;

  @OnEvent(QueuesEvent.IMAGE_UPLOAD_ERROR)
  async handleImageUploadError(payload: string) {
    this.sessions.emitSocket(
      [payload],
      {
        imageError: 'Error loaded',
        reason: 'Image upload failure',
      },
      QueuesEmit.IMAGE_UPLOAD_ERROR,
    );
  }

  private async notificationToFriend(user: string, avatarId: string) {
    const { profileId, friends } = await this.profileServices.listFriends(user);
    const ids = friends.map((friend) => friend.user.getId());
    this.sessions.emitSocket(
      ids,
      { avatar: avatarId, id: profileId },
      Event2.emit.PROFILE_UPLOAD_IMAGE,
    );
  }

  @OnEvent(QueuesEvent.IMAGE_UPLOAD_SUCCESS)
  async handleImageUploadSuccess(payload: { user: string; avatar: string }) {
    this.sessions.emitSocket(
      [payload.user],
      { ...payload },
      QueuesEmit.IMAGE_UPLOAD_SUCCESS,
    );
    this.notificationToFriend(payload.user, payload.avatar);
  }
}
