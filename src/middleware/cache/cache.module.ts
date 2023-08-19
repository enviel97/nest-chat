import { Services } from 'src/common/define';
import { CacheService } from './cache.services';
import environment from 'src/common/environment';
import { CacheModule as CacheModuleServices } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

const CacheProvider = {
  provide: Services.CACHE,
  useClass: CacheService,
};
@Global()
@Module({
  imports: [
    CacheModuleServices.register({
      isGlobal: true,
      store: redisStore,
      host: environment.redis.host,
      port: environment.redis.port,
      username: environment.redis.username,
      password: environment.redis.password,
      no_ready_check: true,
    }),
  ],
  providers: [CacheProvider],
  exports: [CacheProvider],
})
export class CacheModule {}
