import { createMock } from '@golevelup/ts-vitest'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { vi } from 'vitest'

import { AuthFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { AUTH_IDENTITY_REPOSITORY } from '@/modules/auth/application/ports/auth-identity.repository.port'
import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { LOGIN_LOG_REPOSITORY } from '@/modules/auth/application/ports/login-log.repository.port'
import { PASSWORD_HASHER } from '@/modules/auth/application/ports/password-hasher.port'
import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { AuthService } from '@/modules/auth/application/services/auth.service'
import { USER_REPOSITORY } from '@/shared-kernel/application/ports/user.repository.port'
import { AUDIT_LOGGER } from '@/shared-kernel/infrastructure/audit/audit-logger.port'

import type { AuthIdentityRepository } from '@/modules/auth/application/ports/auth-identity.repository.port'
import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'
import type { LoginLogRepository } from '@/modules/auth/application/ports/login-log.repository.port'
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port'
import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { UserRepository } from '@/shared-kernel/application/ports/user.repository.port'
import type { AuditLogger } from '@/shared-kernel/infrastructure/audit/audit-logger.port'
import type { TestingModule } from '@nestjs/testing'
import type { Mocked } from 'vitest'

describe('authService', () => {
  let service: AuthService
  let authIdentityRepo: Mocked<AuthIdentityRepository>
  let authSessionRepo: Mocked<AuthSessionRepository>
  let passwordHasher: Mocked<PasswordHasher>
  let userRoleRepo: Mocked<UserRoleRepository>
  let userRepo: Mocked<UserRepository>
  let jwtService: Mocked<JwtService>
  let configService: Mocked<ConfigService>
  let auditLogger: Mocked<AuditLogger>
  let loginLogRepo: Mocked<LoginLogRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AUTH_IDENTITY_REPOSITORY, useValue: createMock<AuthIdentityRepository>() },
        { provide: AUTH_SESSION_REPOSITORY, useValue: createMock<AuthSessionRepository>() },
        { provide: PASSWORD_HASHER, useValue: createMock<PasswordHasher>() },
        { provide: USER_ROLE_REPOSITORY, useValue: createMock<UserRoleRepository>() },
        { provide: USER_REPOSITORY, useValue: createMock<UserRepository>() },
        { provide: JwtService, useValue: createMock<JwtService>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: AUDIT_LOGGER, useValue: createMock<AuditLogger>() },
        { provide: LOGIN_LOG_REPOSITORY, useValue: createMock<LoginLogRepository>() },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    authIdentityRepo = module.get(AUTH_IDENTITY_REPOSITORY)
    authSessionRepo = module.get(AUTH_SESSION_REPOSITORY)
    passwordHasher = module.get(PASSWORD_HASHER)
    userRoleRepo = module.get(USER_ROLE_REPOSITORY)
    userRepo = module.get(USER_REPOSITORY)
    jwtService = module.get(JwtService)
    configService = module.get(ConfigService)
    auditLogger = module.get(AUDIT_LOGGER)
    loginLogRepo = module.get(LOGIN_LOG_REPOSITORY)

    // Default config values
    configService.get.mockReturnValue('7d')
    jwtService.sign.mockReturnValue('mock-access-token')
    authSessionRepo.save.mockResolvedValue()
    auditLogger.log.mockResolvedValue()
    loginLogRepo.create.mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================
  // login
  // ============================================================

  describe('login', () => {
    it('user_not_found → UnauthorizedException, records login log with failReason', async () => {
      authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(null)

      await expect(service.login('unknown@example.com', 'password')).rejects.toThrow(UnauthorizedException)

      await vi.waitFor(() => {
        expect(loginLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'failed', failReason: 'user_not_found' }),
        )
      })
    })

    it('no_password_auth → UnauthorizedException, records login log with failReason', async () => {
      const identity = AuthFixtures.identityWithNoPassword()
      authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(identity)

      await expect(service.login('test@example.com', 'password')).rejects.toThrow(UnauthorizedException)

      await vi.waitFor(() => {
        expect(loginLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'failed', failReason: 'no_password_auth' }),
        )
      })
    })

    it('invalid_password → UnauthorizedException, records login log with failReason', async () => {
      const identity = AuthFixtures.emailIdentity()
      authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(identity)
      passwordHasher.verify.mockResolvedValue(false)

      await expect(service.login('test@example.com', 'wrong-password')).rejects.toThrow(UnauthorizedException)

      await vi.waitFor(() => {
        expect(loginLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'failed', failReason: 'invalid_password' }),
        )
      })
    })

    it('success → returns accessToken, refreshToken, user; calls auditLogger; creates session', async () => {
      const identity = AuthFixtures.emailIdentity({ userId: 'user-id-1', email: 'test@example.com' })
      authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(identity)
      passwordHasher.verify.mockResolvedValue(true)
      authIdentityRepo.save.mockResolvedValue()
      userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.login('test@example.com', 'correct-password')

      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBeDefined()
      expect(result.user.id).toBe('user-id-1')
      expect(authSessionRepo.save).toHaveBeenCalled()

      await vi.waitFor(() => {
        expect(auditLogger.log).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'auth.login', actorId: 'user-id-1' }),
        )
        expect(loginLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'success', userId: 'user-id-1' }),
        )
      })
    })
  })

  // ============================================================
  // register
  // ============================================================

  describe('register', () => {
    it('eMAIL_EXISTS → ConflictException', async () => {
      authIdentityRepo.existsByIdentifier.mockResolvedValue(true)

      await expect(service.register('existing@example.com', 'password', 'Name')).rejects.toThrow(ConflictException)
      expect(userRepo.create).not.toHaveBeenCalled()
    })

    it('success → creates user + identity + session, returns tokens', async () => {
      authIdentityRepo.existsByIdentifier.mockResolvedValue(false)
      userRepo.create.mockResolvedValue({
        id: expect.any(String) as string,
        name: 'New User',
        email: 'new@example.com',
        emailVerified: false,
        image: null,
        role: 'USER',
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      passwordHasher.hash.mockResolvedValue('hashed-pw')
      authIdentityRepo.save.mockResolvedValue()
      userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.register('new@example.com', 'password', 'New User')

      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBeDefined()
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com', name: 'New User' }),
      )
      expect(authIdentityRepo.save).toHaveBeenCalled()
      expect(authSessionRepo.save).toHaveBeenCalled()
    })
  })

  // ============================================================
  // refreshToken
  // ============================================================

  describe('refreshToken', () => {
    it('session not found → UnauthorizedException', async () => {
      authSessionRepo.findByToken.mockResolvedValue(null)

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException)
    })

    it('session expired → UnauthorizedException', async () => {
      const expiredSession = AuthFixtures.expiredSession()
      authSessionRepo.findByToken.mockResolvedValue(expiredSession)

      await expect(service.refreshToken('expired-token')).rejects.toThrow(UnauthorizedException)
    })

    it('success → old session deleted, new session created (session rotation)', async () => {
      const validSession = AuthFixtures.session({ id: 'old-session-id', userId: 'user-id-1' })
      authSessionRepo.findByToken.mockResolvedValue(validSession)
      authSessionRepo.delete.mockResolvedValue(true)
      authIdentityRepo.findByUserId.mockResolvedValue([
        AuthFixtures.emailIdentity({ userId: 'user-id-1', email: 'test@example.com' }),
      ])
      userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.refreshToken('valid-refresh-token')

      expect(authSessionRepo.delete).toHaveBeenCalledWith('old-session-id')
      expect(authSessionRepo.save).toHaveBeenCalled()
      expect(result.accessToken).toBe('mock-access-token')
    })
  })

  // ============================================================
  // revokeSession
  // ============================================================

  describe('revokeSession', () => {
    it('cannot revoke current session → returns { success: false }', async () => {
      const result = await service.revokeSession('session-123', 'user-id-1', 'session-123')

      expect(result.success).toBe(false)
      expect(authSessionRepo.findById).not.toHaveBeenCalled()
    })

    it('session belongs to different user → returns { success: false }', async () => {
      const session = AuthFixtures.session({ id: 'other-session', userId: 'other-user-id' })
      authSessionRepo.findById.mockResolvedValue(session)

      const result = await service.revokeSession('other-session', 'user-id-1', 'current-session')

      expect(result.success).toBe(false)
    })

    it('success → returns { success: true }', async () => {
      const session = AuthFixtures.session({ id: 'target-session', userId: 'user-id-1' })
      authSessionRepo.findById.mockResolvedValue(session)
      authSessionRepo.delete.mockResolvedValue(true)

      const result = await service.revokeSession('target-session', 'user-id-1', 'current-session')

      expect(result.success).toBe(true)
      expect(authSessionRepo.delete).toHaveBeenCalledWith('target-session')
    })
  })

  // ============================================================
  // changePassword
  // ============================================================

  describe('changePassword', () => {
    it('no email identity → UnauthorizedException', async () => {
      authIdentityRepo.findByUserIdAndProvider.mockResolvedValue(null)

      await expect(service.changePassword('user-id-1', 'current', 'new')).rejects.toThrow(UnauthorizedException)
    })

    it('wrong current password → UnauthorizedException', async () => {
      const identity = AuthFixtures.emailIdentity()
      authIdentityRepo.findByUserIdAndProvider.mockResolvedValue(identity)
      passwordHasher.verify.mockResolvedValue(false)

      await expect(service.changePassword('user-id-1', 'wrong', 'new')).rejects.toThrow(UnauthorizedException)
    })

    it('success → updates password hash, clears all sessions', async () => {
      const identity = AuthFixtures.emailIdentity({ userId: 'user-id-1' })
      authIdentityRepo.findByUserIdAndProvider.mockResolvedValue(identity)
      passwordHasher.verify.mockResolvedValue(true)
      passwordHasher.hash.mockResolvedValue('new-hashed-pw')
      authIdentityRepo.save.mockResolvedValue()
      authSessionRepo.deleteAllByUserId.mockResolvedValue(2)

      await service.changePassword('user-id-1', 'current', 'new')

      expect(authIdentityRepo.save).toHaveBeenCalledWith(identity)
      expect(authSessionRepo.deleteAllByUserId).toHaveBeenCalledWith('user-id-1')
    })
  })
})
