import { WebSocketGateway as WsG, WebSocketServer } from '@nestjs/websockets';
import { CorsOption } from '../../cors';
import { Services } from 'src/common/define';
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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

  @OnEvent(Event2.subscribe.image_profile)
  async handleImageUploadSuccess(payload: ImageUploadPayload) {
    const { friends } = await this.profileServices.listFriends(payload.user);
    this.sessions.emitSocket(
      friends.map((friend) => friend.user.getId()),
      payload,
      Event2.emit.PROFILE_UPLOAD_IMAGE,
    );
  }
}
