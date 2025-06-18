import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { Request } from 'express';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private moduleRef: ModuleRef) {
    super({
      passReqToCallback: true,
      usernameField: 'email',
    });
  }

  async validate(request: Request, username: string, password: string): Promise<any> {
    const contextId = ContextIdFactory.getByRequest(request);
    const authService = await this.moduleRef.resolve(AuthService, contextId);
    return await authService.validateUser(username, password);
  }
}
