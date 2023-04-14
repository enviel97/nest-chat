import {
  Inject,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import ConfigModule from './middleware/environment';
import environment, { default as env } from 'src/common/environment';
import MongooseModule from './middleware/mongoose';
import PassportModule from './middleware/passport';
import { AuthModule } from './routes/auth/auth.module';
import { UserModule } from './routes/user/user.module';
import { RedisModule } from 'src/adapter/redis.module';
import * as createRedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';
import { RedisClientType } from 'redis';
import { ConversationModule } from './routes/conversation/conversation.module';
import { MessagesModule } from './routes/messages/messages.module';
import { GatewayModule } from './middleware/gateway/gateway.module';
import EventConfigModule from './middleware/gateway/event.config';
import { LoggerMiddleware } from './adapter/logger.module';
import { Services } from './common/define';
import ThrottlerModule from './middleware/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ImageStorageModule } from './adapter/image_storage';
import CacheModule from './middleware/cache/cache.register';

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
  ],
  controllers: [],
  providers: [ThrottlerProvider],
})
export class AppModule {
  constructor(
    @Inject(Services.REDIS) private readonly redisClient: RedisClientType,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const RedisStore = createRedisStore(session);
    consumer
      .apply(
        session({
          store: new RedisStore({
            client: this.redisClient as any,
            prefix: environment.server.session_prefix,
          }),
          name: 'SESSION_ID',
          resave: false,
          saveUninitialized: true,

          secret: env.server.cookie_key,
          cookie: {
            sameSite: 'strict',
            secure: environment.server.env === 'prod',
            // httpOnly: true,
            maxAge: 86400000,
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
