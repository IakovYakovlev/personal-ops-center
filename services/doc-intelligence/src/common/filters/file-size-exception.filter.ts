import { ExceptionFilter, Catch, ArgumentsHost, PayloadTooLargeException } from '@nestjs/common';
import { Response } from 'express';

@Catch(PayloadTooLargeException)
export class FileSizeExceptionFilter implements ExceptionFilter {
  catch(exception: PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(413).json({
      statusCode: 413,
      error: 'Payload Too Large',
      message: 'File size exceeds the maximum limit of 5 MB',
    });
  }
}
