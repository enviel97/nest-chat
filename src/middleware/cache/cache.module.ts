import { Global, Module } from '@nestjs/common';
import { Services } from 'src/common/define';
import { CacheService } from './cache.services';
import { CacheModule as CacheModuleRegister } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import type { CacheStore } from '@nestjs/common/cache/interfaces/cache-manager.interface';
import environment from 'src/common/environment';
import { redisStore } from 'cache-manager-redis-store';
const CacheProvider = {
  provide: Services.CACHE,
  useClass: CacheService,
};
@Global()
@Module({
  imports: [
    CacheModuleRegister.registerAsync<RedisClientOptions>({
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
    }),
  ],
  providers: [CacheProvider],
  exports: [CacheProvider],
})
export class CacheModule {}
