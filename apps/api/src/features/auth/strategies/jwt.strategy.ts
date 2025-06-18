import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtPayload, JwtValidateUser } from '@/types/interface/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayload, done: VerifiedCallback) {
    // return {
    //   userId: payload.sub,
    //   role: payload.role,
    // } as JwtValidateUser;
    return done(null, {
      userId: payload.sub,
      role: payload.role,
    } as JwtValidateUser);
  }
}
