import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthenticationSocket } from './gateway.session';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie';
import env from 'src/common/environment';
import { REDIS } from 'src/adapter/redis.module';
import { RedisClientType } from 'redis';
import environment from 'src/common/environment';

export class WebsocketAdapter extends IoAdapter {
  private redisClient: RedisClientType;

  constructor(app: any) {
    super(app);
    app.resolve(REDIS).then((service: RedisClientType) => {
      this.redisClient = service;
    });
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthenticationSocket, next) => {
      console.log('>>>>>>>>> INSIDE WEBSOCKET ADAPTER MIDDLEWARE');
      const { cookie: clientCookie } = socket.handshake.headers;
      if (!clientCookie) {
        console.log('ERROR: Client has no cookie');
        return next(new Error('Not Authenticate'));
      }
      const { SESSION_ID } = cookie.parse(clientCookie);
      if (!SESSION_ID) {
        console.log('ERROR: SESSION_ID has not exits');
        return next(new Error('Not Authenticate'));
      }
      const signedCookie = cookieParser.signedCookie(
        SESSION_ID,
        env.server.cookie_key,
      );
      if (!signedCookie) {
        console.log('ERROR: SESSION_ID parser error');
        return next(new Error('Not Authenticate'));
      }
      const sessionDB = await this.redisClient.v4.GET(
        `${environment.server.session_prefix}${signedCookie}`,
      );
      if (!sessionDB) {
        console.log('ERROR: Hacking authenticate notice');
        return next(new Error('Not Authenticate'));
      }
      const userDB = JSON.parse(sessionDB)?.passport?.user;
      if (!userDB) {
        console.log('ERROR: User not found');
        return next(new Error('Not Authenticate'));
      }
      socket.user = userDB;
      next();
    });

    return server;
  }
}
