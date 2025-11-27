import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ConsoleLogger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: ConsoleLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine the message safely
    let message = 'Internal server error';
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      // Handle cases where response is an object with a message or just a string
      message =
        typeof response === 'object' &&
        response !== null &&
        'message' in response
          ? (response as any).message
          : exception.message;
    } else if (exception instanceof Error) {
      // For non-HTTP errors (like DB errors), log the real reason but hide it from user in prod
      message = exception.message;
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: Array.isArray(message) ? message[0] : message, // Clean up array messages from validators
    };

    // Log the actual error stack for the developer
    this.logger.error(
      `[${AllExceptionsFilter.name}] ${httpStatus} Error: ${JSON.stringify(responseBody)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
