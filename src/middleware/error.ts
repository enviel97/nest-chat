import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    Logger.error(
      exception.message,
      exception.getResponse()['message'] ?? 'Unknown',
    );
    return response.status(status).json({
      code: status,
      message: exception.message,
    });
  }
}

@Catch(MongoError, mongoose.Error)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    Logger.error(exception.message, exception);
    switch (exception.code) {
      case 11000: {
        const field = Object.keys(exception['keyPattern'] ?? {});
        return response.status(HttpStatus.CONFLICT).json({
          code: HttpStatus.CONFLICT,
          message:
            field.length === 0
              ? `Conflict values`
              : `${field[0]} already exists`,
        });
      }
      default:
        return response.status(HttpStatus.BAD_REQUEST).json({
          code: HttpStatus.BAD_REQUEST,
          message: 'Database request error',
        });
    }
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    Logger.error(exception.message, exception);

    const responseBody = {
      code: httpStatus,
      timestamp: new Date().toISOString(),
      message: 'Interval server error',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
