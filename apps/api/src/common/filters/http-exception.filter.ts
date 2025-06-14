import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { UserNotFoundException } from '@/common/error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: UserNotFoundException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(404).json({
      message: exception.message,
      code: 'USER_NOT_FOUND',
    });
  }
  // catch(exception: unknown, host: ArgumentsHost) {
  //   const ctx = host.switchToHttp();
  //   const response = ctx.getResponse<Response>();
  //   const request = ctx.getRequest<Request>();

  //   const status =
  //     exception instanceof HttpException
  //       ? exception.getStatus()
  //       : HttpStatus.INTERNAL_SERVER_ERROR;

  //   const message =
  //     exception instanceof HttpException
  //       ? exception.getResponse()
  //       : 'Internal server error';

  //   // response.status(status).json({
  //   //   code: status,
  //   //   message,
  //   //   path: request.url,
  //   //   timestamp: new Date().toISOString(),
  //   // });
  // }
}
