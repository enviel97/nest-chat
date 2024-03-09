import {
  Inject,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import ConfigModule from './middleware/environment';
import MongooseModule from './middleware/mongoose';
import { PassportModule, SessionConfig } from './middleware/authenticate';
import { GatewayModule } from './middleware/gateway/gateway.module';
import EventConfigModule from './middleware/gateway/event.config';
import { CacheModule } from './middleware/cache/cache.module';
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
  ],
  controllers: [],
  providers: [ThrottlerProvider],
})
export class AppModule {
  constructor(
    @Inject(Services.REDIS)
    private readonly redisClient: any,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(...SessionConfig(this.redisClient)).forRoutes('*');
    // middleware logger
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
