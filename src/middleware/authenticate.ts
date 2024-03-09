import { PassportModule as passportRegister } from '@nestjs/passport';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as createRedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';
import environment from 'src/common/environment';

// Base Passport module setup
export const PassportModule = passportRegister.register({
  session: true,
});

// Config session
export const SessionConfig = (redisClient: any) => {
  const RedisStore = createRedisStore(session);

  return [
    session({
      store: new RedisStore({
        client: redisClient as any,
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
        maxAge: 86400000,
      },
    }),
    passport.initialize(),
    passport.session(),
  ];
};

// handle protect route/controller
@Injectable()
export class AuthenticateGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}
