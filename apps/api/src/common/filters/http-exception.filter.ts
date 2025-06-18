import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const { error, message } = this.normalizeError(exception);

    const traceId = request.headers['x-request-id'] || request.headers['x-correlation-id'] || request.id || request.url;

    response.status(status).json({
      error: {
        code: error,
        message,
      },
      mate: {
        traceId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private normalizeError(exception: unknown): {
    error: string;
    message: string;
    stack?: string;
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return { error: exception.name, message: res };
      }
      if (typeof res === 'object' && res !== null) {
        const obj = res as any;
        return {
          error: obj.error || exception.name,
          message: obj.message || obj.msg || 'Unknown error',
          stack: exception.stack,
        };
      }
    }
    return {
      error: 'INTERNAL_SERVER_ERROR',
      message: (exception as any)?.message || 'Internal server error',
      stack: (exception as any)?.stack || undefined,
    };
  }
}
