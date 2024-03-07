import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import environment from './common/environment';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
  MongooseExceptionFilter,
} from './middleware/error';
import { CorsOption } from './middleware/cors';
import { WebsocketAdapter } from './middleware/gateway/gateway.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import 'src/extensions';

const start = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableCors(CorsOption);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  const websocketAdapter = new WebsocketAdapter(app);
  const httpAdapterHost = app.get(HttpAdapterHost);
  // setup
  app.useWebSocketAdapter(websocketAdapter);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new HttpExceptionFilter(),
    new MongooseExceptionFilter(),
  );
  app.set('trust proxy', 'loopback');

  try {
    await app.listen(environment.server.port, () => {
      Logger.log(`Base url: http://localhost:${environment.server.port}`);
      Logger.log(`Port: ${environment.server.port}`);
    });
  } catch (error) {
    console.log({ error });
  }
};

start();
