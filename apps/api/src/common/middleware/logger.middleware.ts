import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

const concatStr = (strings: (number | string)[], divider?: string): string => strings.join(divider ?? ' ');

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(concatStr([req.method, req.originalUrl]), 'Request');
    next();
  }
}
