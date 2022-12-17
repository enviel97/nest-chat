import { Module } from '@nestjs/common';
import { Services } from 'src/common/define';
import { MessagingGateway } from './gateway';
import { GatewaySessionManager } from './gateway.session';

@Module({
  providers: [
    MessagingGateway,
    { provide: Services.GATEWAY_SESSION, useClass: GatewaySessionManager },
  ],
})
export class GatewayModule {}
