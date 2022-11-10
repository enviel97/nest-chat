import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import environment from './common/environment';

const start = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');

  try {
    await app.listen(environment.server.port, () => {
      console.log(`Base url: http://localhost:${environment.server.port}`);
      console.log(`Port: ${environment.server.port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
