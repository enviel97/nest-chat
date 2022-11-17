import { Inject, MiddlewareConsumer, Module } from '@nestjs/common';
import ConfigModule from './middleware/environment';
import environment, { default as env } from 'src/common/environment';
import MongooseModule from './middleware/mongoose';
import PassportModule from './middleware/passport';
import { AuthModule } from './routes/auth/auth.module';
import { UserModule } from './routes/user/user.module';
import { REDIS, RedisModule } from 'src/adapter/redis.module';
import * as createRedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';
import { RedisClientType } from 'redis';

@Module({
  imports: [
    // route module
    AuthModule,
    UserModule,
    // environment module
    ConfigModule,
    PassportModule,
    MongooseModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(@Inject(REDIS) private readonly redisClient: RedisClientType) {}

  configure(consumer: MiddlewareConsumer) {
    const RedisStore = createRedisStore(session);
    consumer
      .apply(
        session({
          store: new RedisStore({ client: this.redisClient as any }),
          name: 'AUTH:SESSION',
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
  }
}
