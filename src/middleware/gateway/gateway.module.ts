import { Module } from '@nestjs/common';
import { Services } from 'src/common/define';
import { WebsocketGateway } from './features/websocket.gateway';
import { GatewaySessionManager } from './gateway.session';
import { MessagingGateway } from './features/message.gateway';
import { ConversationGateway } from './features/conversation.gateway';

@Module({
  providers: [
    MessagingGateway,
    ConversationGateway,
    WebsocketGateway,
    { provide: Services.GATEWAY_SESSION, useClass: GatewaySessionManager },
  ],
})
export class GatewayModule {}
