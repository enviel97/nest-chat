import { Inject, MiddlewareConsumer, Module } from '@nestjs/common';
import environment from './middleware/environment';
import { default as env } from 'src/common/environment';

import { REDIS, RedisModule } from 'src/middleware/redis';
import { default as PassportModule } from 'src/middleware/passport';

import * as RedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';

import mongoose from './middleware/mongoose';
import { AuthModule } from './routes/auth/auth.module';
import { UserModule } from './routes/user/user.module';

@Module({
  imports: [
    // environment module
    environment,
    mongoose,
    PassportModule,
    RedisModule,
    // route module
    AuthModule,
    UserModule,
  ],
})
export class AppModule {
  constructor(@Inject(REDIS) private readonly redis: any) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new (RedisStore(session))({
            client: this.redis,
            logErrors: true,
          }),
          saveUninitialized: false,
          secret: env.server.cookie_key,
          resave: false,
          cookie: {
            sameSite: 'none',
            httpOnly: true,
            maxAge: 86400000,
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
