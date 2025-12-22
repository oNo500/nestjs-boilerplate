import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import type { Env } from '@/app/config/env.schema'
import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * JWT payload
 */
export interface JwtPayload {
  sub: string // User ID
  email: string
  roles: RoleType[]
  sessionId: string // Session ID
}

/**
 * JWT Strategy
 *
 * Validates JWT Token and extracts user information
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    })
  }

  /**
   * Validate JWT payload
   *
   * Passport automatically validates signature and expiration
   * Just return user information here
   */
  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      sessionId: payload.sessionId,
    }
  }
}
