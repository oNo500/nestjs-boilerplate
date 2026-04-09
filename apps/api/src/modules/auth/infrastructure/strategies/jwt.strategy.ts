import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ClsService } from 'nestjs-cls'
import { ExtractJwt, Strategy } from 'passport-jwt'

import type { Env } from '@/app/config/env.schema'
import type { JwtPayload } from '@/modules/auth/application/ports/jwt.port'

/**
 * JWT strategy
 *
 * Validates a JWT token and extracts user information
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<Env, true>,
    private readonly cls: ClsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    })
  }

  /**
   * Validate the JWT payload
   *
   * Passport automatically verifies the signature and expiration time.
   * This method returns user information and writes it to CLS for use by listeners.
   */
  validate(payload: JwtPayload) {
    this.cls.set('userId', payload.sub)
    this.cls.set('userEmail', payload.email)

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      sessionId: payload.sessionId,
    }
  }
}
