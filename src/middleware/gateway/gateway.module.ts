import { Module } from '@nestjs/common';
import { Services } from 'src/common/define';
import { WebsocketGateway } from './features/websocket.gateway';
import { GatewaySessionManager } from './gateway.session';
import { MessagingGateway } from './features/message.gateway';
import { ConversationGateway } from './features/conversation.gateway';
import { FriendGateway } from './features/friends.gateway';
import { MediaGateway } from './features/media.gateway';
import { UserModule } from 'src/routes/user/user.module';

const SessionsManager = {
  provide: Services.GATEWAY_SESSION,
  useClass: GatewaySessionManager,
};

@Module({
  imports: [UserModule],
  providers: [
    MessagingGateway,
    ConversationGateway,
    WebsocketGateway,
    FriendGateway,
    MediaGateway,
    SessionsManager,
  ],
})
export class GatewayModule {}
