import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthenticationSocket } from './gateway.session';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie';
import env from 'src/common/environment';
import type { RedisClientType } from 'redis';
import environment from 'src/common/environment';
import { Services } from 'src/common/define';
import type { ServerOptions } from 'socket.io';
import { GatewayException } from './exeptions/GatewayAdapter.exception';

export class WebsocketAdapter extends IoAdapter {
  private redisClient: RedisClientType;

  constructor(app: any) {
    super(app);
    app.resolve(Services.REDIS).then((service: RedisClientType) => {
      this.redisClient = service;
    });
  }

  private getSignedCookie(clientCookie: string) {
    if (!clientCookie) {
      console.log('ERROR: Client has no cookie');
      throw new GatewayException();
    }
    const { SESSION_ID } = cookie.parse(clientCookie);
    if (!SESSION_ID) {
      console.log('ERROR: SESSION_ID has not exits');
      throw new GatewayException();
    }
    const signedCookie = cookieParser.signedCookie(
      SESSION_ID,
      env.server.cookie_key,
    );
    if (!signedCookie) {
      console.log('ERROR: SESSION_ID parser error');
      throw new GatewayException();
    }
    return signedCookie;
  }

  private async getUserSession(signedCookie: string) {
    const sessionDB = await this.redisClient.v4.GET(
      `${environment.server.session_prefix}${signedCookie}`,
    );
    if (!sessionDB) {
      console.log('ERROR: Hacking authenticate notice');
      throw new GatewayException();
    }
    const userDB = JSON.parse(sessionDB)?.passport?.user;
    if (!userDB) {
      console.log('ERROR: User not found');
      throw new GatewayException();
    }
    return userDB;
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthenticationSocket, next) => {
      try {
        console.log('>>>>>>>>> INSIDE WEBSOCKET ADAPTER MIDDLEWARE');
        const { cookie: clientCookie } = socket.handshake.headers;
        const signedCookie = this.getSignedCookie(clientCookie);
        socket.user = await this.getUserSession(signedCookie);
        next();
      } catch (error) {
        next(error);
      }
    });

    return server;
  }
}
