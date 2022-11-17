import { Logger, Module } from '@nestjs/common';
import * as Redis from 'redis';
import environment from 'src/common/environment';

export const REDIS = Symbol('SESSION:REDIS');

@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async () => {
        const client = Redis.createClient({
          legacyMode: true,
          username: environment.redis.username,
          password: environment.redis.password,
          socket: {
            host: environment.redis.host,
            port: environment.redis.port,
          },
        });
        client
          .connect()
          .then(() => {
            Logger.log('Connected to redis successfully', 'Redis');
          })
          .catch((err) => {
            Logger.error('Could not establish a connection with redis. ' + err);
          });
        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
