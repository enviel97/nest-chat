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

const start = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  // setup
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new HttpExceptionFilter(),
    new MongooseExceptionFilter(),
  );

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
