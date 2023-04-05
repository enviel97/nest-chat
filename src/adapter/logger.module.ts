import { Injectable, NestMiddleware, RequestMethod } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common/services';
import environment from 'src/common/environment';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (environment.server.env === 'dev') {
      // Gets the request log
      console.log(
        '\n>>>>>>>>>>>>>>>>>>>>>> INCOMING REQUEST >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
      );

      Logger.log(`[ URI: ${req.originalUrl} ]`, req.method);
      console.log({
        ...(req.headers.cookie && { cookie: req.headers.cookie }),
        ...(req.body && { body: req.body }),
        ...(req.query && { query: req.query }),
      });

      // Ends middleware function execution, hence allowing to move on
    }

    if (next) {
      next();
    }
  }
}
