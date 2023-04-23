import { Injectable, NestMiddleware, RequestMethod } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common/services';
import environment from 'src/common/environment';
import { performance } from 'perf_hooks';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestStart = performance.now();
    if (environment.server.env === 'dev') {
      // Gets the request log
      console.log('\n>>> INCOMING REQUEST >>>\n');

      Logger.log(`[ URI: ${req.originalUrl} ]:::`, req.method);
      console.log({
        ...(req.headers.cookie && { cookie: req.headers.cookie }),
        ...(req.body && { body: req.body }),
        ...(req.query && { query: req.query }),
      });

      // Ends middleware function execution, hence allowing to move on

      res.on('finish', () => {
        const duration = performance.now() - requestStart;
        Logger.log(
          `[ URI: ${req.originalUrl} ]:::${duration.toFixed(2)}ms`,
          req.method,
        );
      });
    }

    if (next) {
      next();
    }
  }
}
