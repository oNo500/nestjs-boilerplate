import { randomUUID } from 'node:crypto'

import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { DomainEventPublisher } from '@/app/events/domain-event-publisher'
import { AUTH_IDENTITY_REPOSITORY } from '@/modules/auth/application/ports/auth-identity.repository.port'
import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { LOGIN_LOG_REPOSITORY } from '@/modules/auth/application/ports/login-log.repository.port'
import { PASSWORD_HASHER } from '@/modules/auth/application/ports/password-hasher.port'
import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { USER_REPOSITORY } from '@/modules/auth/application/ports/user.repository.port'
import { AuthIdentity } from '@/modules/auth/domain/aggregates/auth-identity.aggregate'
import { AuthSession } from '@/modules/auth/domain/entities/auth-session.entity'
import { UserLoggedInEvent } from '@/modules/auth/domain/events/user-logged-in.event'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { Env } from '@/app/config/env.schema'
import type { AuthIdentityRepository } from '@/modules/auth/application/ports/auth-identity.repository.port'
import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'
import type { JwtPayload } from '@/modules/auth/application/ports/jwt.port'
import type { LoginLogRepository } from '@/modules/auth/application/ports/login-log.repository.port'
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port'
import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { UserRepository } from '@/modules/auth/application/ports/user.repository.port'
import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

interface DeviceContext {
  ipAddress?: string
  userAgent?: string
}

/**
 * Adapts better-auth schema: accounts (multiple auth methods) / sessions (session management) / users.role (single role)
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_IDENTITY_REPOSITORY)
    private readonly authIdentityRepo: AuthIdentityRepository,
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly authSessionRepo: AuthSessionRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepo: UserRoleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    private readonly eventPublisher: DomainEventPublisher,
    @Inject(LOGIN_LOG_REPOSITORY) private readonly loginLogRepo: LoginLogRepository,
  ) {}

  async login(email: string, password: string, deviceContext?: DeviceContext) {
    const identity = await this.authIdentityRepo.findByProviderAndIdentifier('email', email)
    if (!identity) {
      void this.loginLogRepo.create({
        email,
        status: 'failed',
        ipAddress: deviceContext?.ipAddress,
        userAgent: deviceContext?.userAgent,
        failReason: 'user_not_found',
      })
      throw new UnauthorizedException({ code: ErrorCode.INVALID_CREDENTIALS, message: 'Invalid email or password' })
    }

    if (!identity.password) {
      void this.loginLogRepo.create({
        userId: identity.userId,
        email,
        status: 'failed',
        ipAddress: deviceContext?.ipAddress,
        userAgent: deviceContext?.userAgent,
        failReason: 'no_password_auth',
      })
      throw new UnauthorizedException({ code: ErrorCode.INVALID_CREDENTIALS, message: 'Invalid email or password' })
    }
    const isValid = await this.passwordHasher.verify(password, identity.password)
    if (!isValid) {
      void this.loginLogRepo.create({
        userId: identity.userId,
        email,
        status: 'failed',
        ipAddress: deviceContext?.ipAddress,
        userAgent: deviceContext?.userAgent,
        failReason: 'invalid_password',
      })
      throw new UnauthorizedException({ code: ErrorCode.INVALID_CREDENTIALS, message: 'Invalid email or password' })
    }

    await this.authIdentityRepo.save(identity)

    const role = await this.userRoleRepo.getRole(identity.userId)
    const result = await this.generateTokens(identity.userId, email, role, deviceContext)

    void this.eventPublisher.publish(new UserLoggedInEvent(identity.userId, email))

    void this.loginLogRepo.create({
      userId: identity.userId,
      email,
      status: 'success',
      ipAddress: deviceContext?.ipAddress,
      userAgent: deviceContext?.userAgent,
    })

    return result
  }

  async register(
    email: string,
    password: string,
    name: string,
    deviceContext?: DeviceContext,
    initialRole: RoleType = 'USER',
  ) {
    const exists = await this.authIdentityRepo.existsByIdentifier(email)
    if (exists) {
      throw new ConflictException({ code: ErrorCode.EMAIL_EXISTS, message: 'This email is already registered' })
    }

    const userId = randomUUID()
    await this.userRepo.create({ id: userId, name, email, role: initialRole })

    const identityId = randomUUID()
    const passwordHash = await this.passwordHasher.hash(password)
    const identity = AuthIdentity.createEmailIdentity(identityId, userId, email, passwordHash)
    await this.authIdentityRepo.save(identity)

    return this.generateTokens(userId, email, initialRole, deviceContext)
  }

  async refreshToken(refreshToken: string, deviceContext?: DeviceContext) {
    const session = await this.authSessionRepo.findByToken(refreshToken)
    if (!session?.isValid) {
      throw new UnauthorizedException({ code: ErrorCode.TOKEN_INVALID, message: 'Invalid refresh token' })
    }

    await this.authSessionRepo.delete(session.id)

    const identities = await this.authIdentityRepo.findByUserId(session.userId)
    const emailIdentity = identities.find((i) => i.provider === 'email')
    const email = emailIdentity?.identifier ?? ''

    const role = await this.userRoleRepo.getRole(session.userId)

    return this.generateTokens(session.userId, email, role, deviceContext)
  }

  async logout(refreshToken: string): Promise<boolean> {
    const session = await this.authSessionRepo.findByToken(refreshToken)
    if (!session) {
      return false
    }
    return this.authSessionRepo.delete(session.id)
  }

  async revokeAllSessions(userId: string): Promise<number> {
    return this.authSessionRepo.deleteAllByUserId(userId)
  }

  async revokeSession(
    sessionId: string,
    userId: string,
    currentSessionId: string,
  ): Promise<{ success: boolean, message: string }> {
    if (sessionId === currentSessionId) {
      return { success: false, message: 'Cannot revoke the current session; use logout instead' }
    }

    const session = await this.authSessionRepo.findById(sessionId)
    if (session?.userId !== userId) {
      return { success: false, message: 'Session not found or insufficient permissions' }
    }

    const deleted = await this.authSessionRepo.delete(sessionId)
    return { success: deleted, message: deleted ? 'Session revoked' : 'Revocation failed' }
  }

  /**
   * @deprecated Use revokeAllSessions instead
   */
  async logoutAll(userId: string): Promise<number> {
    return this.revokeAllSessions(userId)
  }

  async getSession(sessionId: string, userId: string, email: string, role: string | null) {
    const session = await this.authSessionRepo.findById(sessionId)
    if (session?.userId !== userId) {
      throw new UnauthorizedException({ code: ErrorCode.TOKEN_INVALID, message: 'Session not found or has expired' })
    }

    return {
      user: { id: userId, email, role },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    }
  }

  async listSessions(userId: string, currentSessionId: string) {
    const sessions = await this.authSessionRepo.findActiveByUserId(userId)
    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: s.id === currentSessionId,
      })),
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const identity = await this.authIdentityRepo.findByUserIdAndProvider(userId, 'email')
    if (!identity) {
      throw new UnauthorizedException({ code: ErrorCode.UNAUTHORIZED, message: 'No email authentication method found' })
    }

    if (!identity.password) {
      throw new UnauthorizedException({ code: ErrorCode.INVALID_CREDENTIALS, message: 'Current password is incorrect' })
    }
    const isValid = await this.passwordHasher.verify(currentPassword, identity.password)
    if (!isValid) {
      throw new UnauthorizedException({ code: ErrorCode.INVALID_CREDENTIALS, message: 'Current password is incorrect' })
    }

    const newPasswordHash = await this.passwordHasher.hash(newPassword)
    identity.changePassword(newPasswordHash)
    await this.authIdentityRepo.save(identity)

    // Delete all sessions after password change (enhanced security)
    await this.authSessionRepo.deleteAllByUserId(userId)
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: RoleType | null,
    deviceContext?: DeviceContext,
  ) {
    const refreshToken = randomUUID()

    const refreshExpiresIn
      = this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true }) ?? '7d'
    const expiresAt = this.parseExpiration(refreshExpiresIn)

    const sessionId = randomUUID()
    const session = AuthSession.create(
      sessionId,
      userId,
      refreshToken,
      expiresAt,
      deviceContext?.ipAddress,
      deviceContext?.userAgent,
    )
    await this.authSessionRepo.save(session)

    const payload: JwtPayload = {
      sub: userId,
      email,
      roles: role ? [role] : [], // Wrap single role in an array to maintain JWT format compatibility
      sessionId,
    }
    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role },
    }
  }

  private parseExpiration(expiresIn: string): Date {
    const now = new Date()
    const match = /^(\d+)([smhd])$/.exec(expiresIn)

    if (!match) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Default: 7 days
    }

    const value = Number.parseInt(match[1]!, 10)
    const unit = match[2]!

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }

    return new Date(now.getTime() + value * multipliers[unit]!)
  }
}
