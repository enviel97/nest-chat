import { Module } from '@nestjs/common';
import * as Redis from 'redis';
import environment from 'src/common/environment';

export const REDIS = Symbol('SESSION:REDIS');

@Module({
  providers: [
    {
      provide: REDIS,
      useValue: Redis.createClient({
        legacyMode: true,
        username: environment.redis.username,
        password: environment.redis.password,
        socket: {
          host: environment.redis.host,
          port: environment.redis.port,
        },
      }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
