import { createMock } from '@golevelup/ts-vitest'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { vi } from 'vitest'

import { AuthFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { AUTH_IDENTITY_REPOSITORY } from '@/modules/auth/application/ports/auth-identity.repository.port'
import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { OAuthService } from '@/modules/auth/application/services/oauth.service'
import { USER_REPOSITORY } from '@/shared-kernel/application/ports/user.repository.port'
import { AUDIT_LOGGER } from '@/shared-kernel/infrastructure/audit/audit-logger.port'

import type { AuthIdentityRepository } from '@/modules/auth/application/ports/auth-identity.repository.port'
import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'
import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { OAuthUserProfile } from '@/modules/auth/presentation/dtos/oauth-callback.dto'
import type { UserRepository } from '@/shared-kernel/application/ports/user.repository.port'
import type { AuditLogger } from '@/shared-kernel/infrastructure/audit/audit-logger.port'
import type { TestingModule } from '@nestjs/testing'
import type { Mocked } from 'vitest'

describe('oAuthService', () => {
  let service: OAuthService
  let authIdentityRepo: Mocked<AuthIdentityRepository>
  let authSessionRepo: Mocked<AuthSessionRepository>
  let userRoleRepo: Mocked<UserRoleRepository>
  let userRepo: Mocked<UserRepository>
  let jwtService: Mocked<JwtService>
  let configService: Mocked<ConfigService>
  let auditLogger: Mocked<AuditLogger>

  const googleProfile: OAuthUserProfile = {
    provider: 'google',
    providerId: 'google-123',
    email: 'oauth@example.com',
    name: 'OAuth User',
    accessToken: 'google-access-token',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        { provide: AUTH_IDENTITY_REPOSITORY, useValue: createMock<AuthIdentityRepository>() },
        { provide: AUTH_SESSION_REPOSITORY, useValue: createMock<AuthSessionRepository>() },
        { provide: USER_ROLE_REPOSITORY, useValue: createMock<UserRoleRepository>() },
        { provide: USER_REPOSITORY, useValue: createMock<UserRepository>() },
        { provide: JwtService, useValue: createMock<JwtService>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: AUDIT_LOGGER, useValue: createMock<AuditLogger>() },
      ],
    }).compile()

    service = module.get<OAuthService>(OAuthService)
    authIdentityRepo = module.get(AUTH_IDENTITY_REPOSITORY)
    authSessionRepo = module.get(AUTH_SESSION_REPOSITORY)
    userRoleRepo = module.get(USER_ROLE_REPOSITORY)
    userRepo = module.get(USER_REPOSITORY)
    jwtService = module.get(JwtService)
    configService = module.get(ConfigService)
    auditLogger = module.get(AUDIT_LOGGER)

    configService.get.mockReturnValue('7d')
    jwtService.sign.mockReturnValue('mock-access-token')
    authSessionRepo.save.mockResolvedValue()
    auditLogger.log.mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('findOrCreateUser', () => {
    it('oAuth identity already exists → issues token, calls auditLogger with auth.oauth.login', async () => {
      const existingIdentity = AuthFixtures.oauthIdentity('google', { userId: 'user-id-1', accountId: 'google-123' })
      authIdentityRepo.findByProviderAndIdentifier
        .mockResolvedValueOnce(existingIdentity) // Step 1: finds existing OAuth identity
      userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.findOrCreateUser(googleProfile)

      expect(result.accessToken).toBe('mock-access-token')
      await vi.waitFor(() => {
        expect(auditLogger.log).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'auth.oauth.login', actorId: 'user-id-1' }),
        )
      })
      expect(userRepo.create).not.toHaveBeenCalled()
    })

    it('email identity exists (no OAuth) → links OAuth identity, logs auth.oauth.login with linked=true', async () => {
      const emailIdentity = AuthFixtures.emailIdentity({ userId: 'user-id-2', email: 'oauth@example.com' })
      authIdentityRepo.findByProviderAndIdentifier
        .mockResolvedValueOnce(null) // Step 1: no existing OAuth identity
        .mockResolvedValueOnce(emailIdentity) // Step 2: email identity found
      authIdentityRepo.save.mockResolvedValue()
      userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.findOrCreateUser(googleProfile)

      expect(result.accessToken).toBe('mock-access-token')
      expect(authIdentityRepo.save).toHaveBeenCalledOnce()
      expect(userRepo.create).not.toHaveBeenCalled()
      await vi.waitFor(() => {
        expect(auditLogger.log).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'auth.oauth.login',
            actorId: 'user-id-2',
          }),
        )
        const lastCall = auditLogger.log.mock.calls.at(-1)?.[0]
        expect(lastCall).toHaveProperty('detail.linked', true)
      })
    })

    it('brand new user → creates user + OAuth identity, logs auth.oauth.register', async () => {
      authIdentityRepo.findByProviderAndIdentifier
        .mockResolvedValueOnce(null) // Step 1: no existing OAuth identity
        .mockResolvedValueOnce(null) // Step 2: no email identity
      userRepo.create.mockResolvedValue({
        id: 'new-user-id',
        name: 'OAuth User',
        email: 'oauth@example.com',
        emailVerified: false,
        image: null,
        role: 'USER',
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      authIdentityRepo.save.mockResolvedValue()
      userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.findOrCreateUser(googleProfile)

      expect(result.accessToken).toBe('mock-access-token')
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'OAuth User', email: 'oauth@example.com' }),
      )
      expect(authIdentityRepo.save).toHaveBeenCalledOnce()
      await vi.waitFor(() => {
        expect(auditLogger.log).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'auth.oauth.register' }),
        )
      })
    })
  })
})
