import { Module } from '@nestjs/common';
import { Services } from 'src/common/define';
import { ConversationModule } from 'src/routes/conversation/conversation.module';
import { MessagingGateway } from './gateway';
import { GatewaySessionManager } from './gateway.session';

@Module({
  imports: [ConversationModule],
  providers: [
    MessagingGateway,
    { provide: Services.GATEWAY_SESSION, useClass: GatewaySessionManager },
  ],
})
export class GatewayModule {}
