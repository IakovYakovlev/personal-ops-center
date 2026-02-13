import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Get Retry-After from exception response
    const exceptionResponse = exception.getResponse() as Record<string, any>;
    const retryAfter = String(exceptionResponse['Retry-After'] || 60);

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      retryAfter: parseInt(retryAfter),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
