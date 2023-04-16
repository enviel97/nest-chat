import { CacheModule } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import type { CacheStore } from '@nestjs/common/cache/interfaces/cache-manager.interface';
import environment from 'src/common/environment';
import { redisStore } from 'cache-manager-redis-store';

export default CacheModule.registerAsync<RedisClientOptions>({
  isGlobal: true,
  useFactory: async () => {
    const store = await redisStore({
      username: environment.redis.username,
      password: environment.redis.password,
      socket: {
        host: environment.redis.host,
        port: environment.redis.port,
      },
    });

    return {
      store: { create: () => store as any as CacheStore },
    };
  },
});
