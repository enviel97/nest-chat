import { BullModule } from '@nestjs/bull';
import { Services } from 'src/common/define';
import environment from 'src/common/environment';

export default BullModule.forRoot(Services.BACKGROUND, {
  redis: {
    username: environment.redis.username,
    password: environment.redis.password,
    host: environment.redis.host,
    port: environment.redis.port,
  },
});
