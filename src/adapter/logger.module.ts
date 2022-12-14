import { Injectable, NestMiddleware, RequestMethod } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common/services';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Gets the request log
    console.log(
      '\n>>>>>>>>>>>>>>>>>>>>>> INCOMING REQUEST >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
    );

    Logger.log(`[ URI: ${req.originalUrl} ]`, req.method);

    console.log({
      header: req.headers,
      body: req.body,
      query: req.query,
    });
    // Ends middleware function execution, hence allowing to move on
    if (next) {
      next();
    }
  }
}
