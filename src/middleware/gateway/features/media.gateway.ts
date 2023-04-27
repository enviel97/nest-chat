import { WebSocketGateway as WsG, WebSocketServer } from '@nestjs/websockets';
import { CorsOption } from '../../cors';
import { Services } from 'src/common/define';
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QueuesEmit, QueuesEvent } from 'src/common/queues';

@WsG({ cors: CorsOption })
export class MediaGateway {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySession,
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

  @OnEvent(QueuesEvent.IMAGE_UPLOAD_SUCCESS)
  async handleImageUploadSuccess(payload: { user: string; avatar: string }) {
    this.sessions.emitSocket(
      [payload.user],
      { ...payload },
      QueuesEmit.IMAGE_UPLOAD_SUCCESS,
    );
  }
}
