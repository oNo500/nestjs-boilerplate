import { randomUUID } from 'node:crypto'

import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { AUTH_IDENTITY_REPOSITORY } from '@/modules/auth/application/ports/auth-identity.repository.port'
import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { PASSWORD_HASHER } from '@/modules/auth/application/ports/password-hasher.port'
import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { AuthIdentity } from '@/modules/auth/domain/aggregates/auth-identity.aggregate'
import { AuthSession } from '@/modules/auth/domain/entities/auth-session.entity'
import { USER_REPOSITORY } from '@/shared-kernel/application/ports/user.repository.port'

import type { Env } from '@/app/config/env.schema'
import type { AuthIdentityRepository } from '@/modules/auth/application/ports/auth-identity.repository.port'
import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port'
import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { JwtPayload } from '@/modules/auth/infrastructure/strategies/jwt.strategy'
import type { UserRepository } from '@/shared-kernel/application/ports/user.repository.port'
import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * Device information interface
 */
interface DeviceContext {
  ipAddress?: string
  userAgent?: string
}

/**
 * Auth Service
 *
 * Handles authentication business logic
 * Compatible with better-auth schema:
 * - accounts: Multiple authentication methods
 * - sessions: Session management
 * - users.role: Single role
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
  ) {}

  /**
   * User login (email/password)
   */
  async login(email: string, password: string, deviceContext?: DeviceContext) {
    // 1. Find authentication identity by email
    const identity = await this.authIdentityRepo.findByProviderAndIdentifier(
      'email',
      email,
    )
    if (!identity) {
      throw new UnauthorizedException('Invalid email or password')
    }

    // 2. Verify password
    if (!identity.password) {
      throw new UnauthorizedException('Invalid email or password')
    }
    const isValid = await this.passwordHasher.verify(password, identity.password)
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password')
    }

    // 3. Save authentication identity (update updatedAt)
    await this.authIdentityRepo.save(identity)

    // 4. Get user role
    const role = await this.userRoleRepo.getRole(identity.userId)

    // 5. Generate tokens
    return this.generateTokens(identity.userId, email, role, deviceContext)
  }

  /**
   * User registration (email/password)
   */
  async register(
    email: string,
    password: string,
    name: string,
    deviceContext?: DeviceContext,
    initialRole: RoleType = 'USER',
  ) {
    // 1. Check if email already exists
    const exists = await this.authIdentityRepo.existsByIdentifier(email)
    if (exists) {
      throw new ConflictException('Email already registered')
    }

    // 2. Create user
    const userId = randomUUID()
    await this.userRepo.create({
      id: userId,
      name,
      email,
      role: initialRole,
    })

    // 3. Create authentication identity
    const identityId = randomUUID()
    const passwordHash = await this.passwordHasher.hash(password)
    const identity = AuthIdentity.createEmailIdentity(
      identityId,
      userId,
      email,
      passwordHash,
    )
    await this.authIdentityRepo.save(identity)

    // 4. Generate tokens
    return this.generateTokens(userId, email, initialRole, deviceContext)
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string, deviceContext?: DeviceContext) {
    // 1. Find session
    const session = await this.authSessionRepo.findByToken(refreshToken)
    if (!session?.isValid) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    // 2. Delete old session
    await this.authSessionRepo.delete(session.id)

    // 3. Get user authentication info
    const identities = await this.authIdentityRepo.findByUserId(session.userId)
    const emailIdentity = identities.find((i) => i.provider === 'email')
    const email = emailIdentity?.identifier ?? ''

    // 4. Get user role
    const role = await this.userRoleRepo.getRole(session.userId)

    // 5. Generate new tokens
    return this.generateTokens(session.userId, email, role, deviceContext)
  }

  /**
   * Logout (delete current session)
   */
  async logout(refreshToken: string): Promise<boolean> {
    const session = await this.authSessionRepo.findByToken(refreshToken)
    if (!session) {
      return false
    }
    return this.authSessionRepo.delete(session.id)
  }

  /**
   * Revoke all sessions (logout all devices)
   */
  async revokeAllSessions(userId: string): Promise<number> {
    return this.authSessionRepo.deleteAllByUserId(userId)
  }

  /**
   * Revoke specific session
   */
  async revokeSession(
    sessionId: string,
    userId: string,
    currentSessionId: string,
  ): Promise<{ success: boolean, message: string }> {
    // Cannot revoke current session
    if (sessionId === currentSessionId) {
      return {
        success: false,
        message: 'Cannot revoke current session, use logout instead',
      }
    }

    // Find session
    const session = await this.authSessionRepo.findById(sessionId)
    if (session?.userId !== userId) {
      return {
        success: false,
        message: 'Session not found or unauthorized',
      }
    }

    // Delete session
    const deleted = await this.authSessionRepo.delete(sessionId)
    return {
      success: deleted,
      message: deleted ? 'Session revoked' : 'Revoke failed',
    }
  }

  /**
   * @deprecated Use revokeAllSessions instead
   */
  async logoutAll(userId: string): Promise<number> {
    return this.revokeAllSessions(userId)
  }

  /**
   * Get current session info
   */
  async getSession(sessionId: string, userId: string, email: string, role: string | null) {
    const session = await this.authSessionRepo.findById(sessionId)
    if (session?.userId !== userId) {
      throw new UnauthorizedException('Session not found or expired')
    }

    return {
      user: {
        id: userId,
        email,
        role,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    }
  }

  /**
   * List active sessions for user
   */
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

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // 1. Find email authentication identity
    const identity = await this.authIdentityRepo.findByUserIdAndProvider(
      userId,
      'email',
    )
    if (!identity) {
      throw new UnauthorizedException('Email authentication not found')
    }

    // 2. Verify current password
    if (!identity.password) {
      throw new UnauthorizedException('Invalid current password')
    }
    const isValid = await this.passwordHasher.verify(
      currentPassword,
      identity.password,
    )
    if (!isValid) {
      throw new UnauthorizedException('Invalid current password')
    }

    // 3. Change password
    const newPasswordHash = await this.passwordHasher.hash(newPassword)
    identity.changePassword(newPasswordHash)
    await this.authIdentityRepo.save(identity)

    // 4. Delete all sessions (enhanced security)
    await this.authSessionRepo.deleteAllByUserId(userId)
  }

  /**
   * Generate Access Token and Refresh Token
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: RoleType | null,
    deviceContext?: DeviceContext,
  ) {
    // Generate Refresh Token
    const refreshToken = randomUUID()

    // Calculate expiration time (default 7 days)
    const refreshExpiresIn
      = this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true }) ?? '7d'
    const expiresAt = this.parseExpiration(refreshExpiresIn)

    // Create session (create first to get sessionId)
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

    // Generate Access Token (includes sessionId)
    const payload: JwtPayload = {
      sub: userId,
      email,
      roles: role ? [role] : [], // Maintain compatibility, wrap single role in array
      sessionId,
    }
    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        role,
      },
    }
  }

  /**
   * Parse expiration time string
   */
  private parseExpiration(expiresIn: string): Date {
    const now = new Date()
    const match = /^(\d+)([smhd])$/.exec(expiresIn)

    if (!match) {
      // Default 7 days
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
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
