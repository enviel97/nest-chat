import {
  Inject,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import * as createRedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { RedisClientType } from 'redis';

import ConfigModule from './middleware/environment';
import MongooseModule from './middleware/mongoose';
import { PassportModule } from './middleware/passport';
import { GatewayModule } from './middleware/gateway/gateway.module';
import EventConfigModule from './middleware/gateway/event.config';
import { CacheModule } from './middleware/cache/cache.module';
import QueuesModule from './middleware/queues';
import ThrottlerModule from './middleware/throttler';

import { AuthModule } from './routes/auth/auth.module';
import { UserModule } from './routes/user/user.module';
import { MediaModule } from './routes/media/media.module';
import { ConversationModule } from './routes/conversation/conversation.module';
import { MessagesModule } from './routes/messages/messages.module';

import { ImageStorageModule } from './adapter/image_storage/image-storage.module';
import { LoggerMiddleware } from './adapter/logger.module';
import { RedisModule } from './adapter/redis.module';

import { Services } from './common/define';
import environment from './common/environment';

const ThrottlerProvider = {
  provide: Services.APP_GUARD,
  useClass: ThrottlerGuard,
};
@Module({
  imports: [
    // route module
    AuthModule,
    UserModule,
    ConversationModule,
    MessagesModule,
    MediaModule,

    // environment module
    ConfigModule,
    PassportModule,
    MongooseModule,
    RedisModule,
    ImageStorageModule,

    // middleware
    GatewayModule,
    EventConfigModule,
    ThrottlerModule,
    CacheModule,
    QueuesModule,
  ],
  controllers: [],
  providers: [ThrottlerProvider],
})
export class AppModule {
  constructor(
    @Inject(Services.REDIS)
    private readonly redisClient: RedisClientType,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const RedisStore = createRedisStore(session);
    consumer
      .apply(
        session({
          store: new RedisStore({
            client: this.redisClient as any,
            prefix: environment.server.session_prefix,
            logErrors: true,
          }),
          name: 'SESSION_ID',
          resave: true,
          saveUninitialized: false,

          secret: environment.server.cookie_key,
          cookie: {
            sameSite: 'strict',
            secure: environment.server.env === 'prod',
            httpOnly: true,
            // maxAge: 86400000,
            maxAge: 10000,
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
    // middleware logger
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
