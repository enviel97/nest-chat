import { Logger, Module } from '@nestjs/common';
import * as Redis from 'redis';
import { Services } from 'src/common/define';
import environment from 'src/common/environment';

@Module({
  providers: [
    {
      provide: Services.REDIS,
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
  exports: [Services.REDIS],
})
export class RedisModule {}
