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
  settings: {
    lockDuration: 60 * 60 * 1000,
    maxStalledCount: 0,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    timeout: 10 * 1000,
  },
});
