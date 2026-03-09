import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { AUTH_IDENTITY_REPOSITORY } from '@/modules/auth/application/ports/auth-identity.repository.port'
import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { AuthIdentity } from '@/modules/auth/domain/aggregates/auth-identity.aggregate'
import { AuthSession } from '@/modules/auth/domain/entities/auth-session.entity'
import { USER_REPOSITORY } from '@/shared-kernel/application/ports/user.repository.port'
import { AUDIT_LOGGER } from '@/shared-kernel/infrastructure/audit/audit-logger.port'

import type { Env } from '@/app/config/env.schema'
import type { AuthIdentityRepository } from '@/modules/auth/application/ports/auth-identity.repository.port'
import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'
import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { JwtPayload } from '@/modules/auth/infrastructure/strategies/jwt.strategy'
import type { OAuthUserProfile } from '@/modules/auth/presentation/dtos/oauth-callback.dto'
import type { UserRepository } from '@/shared-kernel/application/ports/user.repository.port'
import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'
import type { AuditLogger } from '@/shared-kernel/infrastructure/audit/audit-logger.port'

@Injectable()
export class OAuthService {
  constructor(
    @Inject(AUTH_IDENTITY_REPOSITORY)
    private readonly authIdentityRepo: AuthIdentityRepository,
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly authSessionRepo: AuthSessionRepository,
    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepo: UserRoleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    @Inject(AUDIT_LOGGER) private readonly auditLogger: AuditLogger,
  ) {}

  /**
   * Find or create user from OAuth profile, then return tokens.
   *
   * Flow:
   * 1. Look for existing OAuth identity (provider + providerId)
   *    → found: issue tokens
   * 2. Not found → look for same-email user (via email identity)
   *    → found: link OAuth identity to existing user → issue tokens
   * 3. Not found: create new user + OAuth identity → issue tokens
   */
  async findOrCreateUser(profile: OAuthUserProfile): Promise<{
    accessToken: string
    refreshToken: string
    user: { id: string, email: string, role: RoleType | null }
  }> {
    // Step 1: look for existing OAuth identity
    const existingOAuthIdentity = await this.authIdentityRepo.findByProviderAndIdentifier(
      profile.provider,
      profile.providerId,
    )

    if (existingOAuthIdentity) {
      const role = await this.userRoleRepo.getRole(existingOAuthIdentity.userId)
      const tokens = await this.generateTokens(existingOAuthIdentity.userId, profile.email, role)
      void this.auditLogger.log({
        action: 'auth.oauth.login',
        actorId: existingOAuthIdentity.userId,
        actorEmail: profile.email,
        detail: { provider: profile.provider },
      })
      return tokens
    }

    // Step 2: look for same-email user via email identity
    const emailIdentity = await this.authIdentityRepo.findByProviderAndIdentifier('email', profile.email)

    let userId: string

    if (emailIdentity) {
      // Link OAuth identity to existing user
      userId = emailIdentity.userId
      const oauthIdentityId = randomUUID()
      const linkedIdentity = AuthIdentity.createOAuthIdentity(
        oauthIdentityId,
        userId,
        profile.provider,
        profile.providerId,
        profile.accessToken,
        profile.refreshToken,
        profile.accessTokenExpiresAt,
      )
      await this.authIdentityRepo.save(linkedIdentity)

      void this.auditLogger.log({
        action: 'auth.oauth.login',
        actorId: userId,
        actorEmail: profile.email,
        detail: { provider: profile.provider, linked: true },
      })
    } else {
      // Step 3: create new user + OAuth identity
      userId = randomUUID()
      await this.userRepo.create({ id: userId, name: profile.name, email: profile.email })

      const oauthIdentityId = randomUUID()
      const newIdentity = AuthIdentity.createOAuthIdentity(
        oauthIdentityId,
        userId,
        profile.provider,
        profile.providerId,
        profile.accessToken,
        profile.refreshToken,
        profile.accessTokenExpiresAt,
      )
      await this.authIdentityRepo.save(newIdentity)

      void this.auditLogger.log({
        action: 'auth.oauth.register',
        actorId: userId,
        actorEmail: profile.email,
        detail: { provider: profile.provider },
      })
    }

    const role = await this.userRoleRepo.getRole(userId)
    return this.generateTokens(userId, profile.email, role)
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: RoleType | null,
  ) {
    const refreshToken = randomUUID()
    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true }) ?? '7d'
    const expiresAt = this.parseExpiration(refreshExpiresIn)

    const sessionId = randomUUID()
    const session = AuthSession.create(sessionId, userId, refreshToken, expiresAt)
    await this.authSessionRepo.save(session)

    const payload: JwtPayload = {
      sub: userId,
      email,
      roles: role ? [role] : [],
      sessionId,
    }
    const accessToken = this.jwtService.sign(payload)

    return { accessToken, refreshToken, user: { id: userId, email, role } }
  }

  private parseExpiration(expiresIn: string): Date {
    const now = new Date()
    const match = /^(\d+)([smhd])$/.exec(expiresIn)
    if (!match) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const value = Number.parseInt(match[1]!, 10)
    const unit = match[2]!
    const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
    return new Date(now.getTime() + value * multipliers[unit]!)
  }
}
