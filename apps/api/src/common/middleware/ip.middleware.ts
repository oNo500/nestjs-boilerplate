import { NestMiddleware, Injectable } from '@nestjs/common';
import { getClientIp } from '@supercharge/request-ip';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RealIpMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction) {
    request.x_ip = getClientIp(request)!;
    next();
  }
}
