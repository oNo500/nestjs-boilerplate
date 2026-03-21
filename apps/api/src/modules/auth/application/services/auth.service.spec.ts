import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { vi } from 'vitest'

import { AuthFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { createAuthMocks } from '@/__tests__/unit/factories/mock-factory'
import { AuthService } from '@/modules/auth/application/services/auth.service'

describe('authService', () => {
  let service: AuthService
  let mocks: ReturnType<typeof createAuthMocks>

  beforeEach(() => {
    mocks = createAuthMocks()
    service = new AuthService(
      mocks.authIdentityRepo,
      mocks.authSessionRepo,
      mocks.passwordHasher,
      mocks.userRoleRepo,
      mocks.userRepo,
      mocks.jwtService,
      mocks.configService,
      mocks.eventPublisher,
      mocks.loginLogRepo,
    )

    mocks.configService.get.mockReturnValue('7d')
    mocks.jwtService.sign.mockReturnValue('mock-access-token')
    mocks.authSessionRepo.save.mockResolvedValue(undefined)
    mocks.eventPublisher.publish.mockResolvedValue(undefined)
    mocks.loginLogRepo.create.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('user_not_found → UnauthorizedException, records failed login log', async () => {
      mocks.authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(null)

      await expect(service.login('unknown@example.com', 'password')).rejects.toThrow(UnauthorizedException)

      await vi.waitFor(() => {
        expect(mocks.loginLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'failed', failReason: 'user_not_found' }),
        )
      })
    })

    it('no_password_auth → UnauthorizedException, records failed login log', async () => {
      mocks.authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(AuthFixtures.identityWithNoPassword())

      await expect(service.login('test@example.com', 'password')).rejects.toThrow(UnauthorizedException)

      await vi.waitFor(() => {
        expect(mocks.loginLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'failed', failReason: 'no_password_auth' }),
        )
      })
    })

    it('invalid_password → UnauthorizedException, records failed login log', async () => {
      mocks.authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(AuthFixtures.emailIdentity())
      mocks.passwordHasher.verify.mockResolvedValue(false)

      await expect(service.login('test@example.com', 'wrong-password')).rejects.toThrow(UnauthorizedException)

      await vi.waitFor(() => {
        expect(mocks.loginLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'failed', failReason: 'invalid_password' }),
        )
      })
    })

    it('success → returns tokens and user, creates session, publishes UserLoggedInEvent', async () => {
      mocks.authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(
        AuthFixtures.emailIdentity({ userId: 'user-id-1', email: 'test@example.com' }),
      )
      mocks.passwordHasher.verify.mockResolvedValue(true)
      mocks.authIdentityRepo.save.mockResolvedValue(undefined)
      mocks.userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.login('test@example.com', 'correct-password')

      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBeDefined()
      expect(result.user.id).toBe('user-id-1')
      expect(mocks.authSessionRepo.save).toHaveBeenCalled()

      await vi.waitFor(() => {
        expect(mocks.eventPublisher.publish).toHaveBeenCalledOnce()
        expect(mocks.loginLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'success', userId: 'user-id-1' }),
        )
      })
    })
  })

  describe('register', () => {
    it('email exists → ConflictException, no user created', async () => {
      mocks.authIdentityRepo.existsByIdentifier.mockResolvedValue(true)

      await expect(service.register('existing@example.com', 'password', 'Name')).rejects.toThrow(ConflictException)
      expect(mocks.userRepo.create).not.toHaveBeenCalled()
    })

    it('success → creates user + identity + session, returns tokens', async () => {
      mocks.authIdentityRepo.existsByIdentifier.mockResolvedValue(false)
      mocks.userRepo.create.mockResolvedValue({
        id: 'new-user-id',
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
      mocks.passwordHasher.hash.mockResolvedValue('hashed-pw')
      mocks.authIdentityRepo.save.mockResolvedValue()
      mocks.userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.register('new@example.com', 'password', 'New User')

      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBeDefined()
      expect(mocks.userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com', name: 'New User' }),
      )
      expect(mocks.authIdentityRepo.save).toHaveBeenCalled()
      expect(mocks.authSessionRepo.save).toHaveBeenCalled()
    })
  })

  describe('refreshToken', () => {
    it('session not found → UnauthorizedException', async () => {
      mocks.authSessionRepo.findByToken.mockResolvedValue(null)

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException)
    })

    it('session expired → UnauthorizedException', async () => {
      mocks.authSessionRepo.findByToken.mockResolvedValue(AuthFixtures.expiredSession())

      await expect(service.refreshToken('expired-token')).rejects.toThrow(UnauthorizedException)
    })

    it('success → rotates session, returns new tokens', async () => {
      mocks.authSessionRepo.findByToken.mockResolvedValue(
        AuthFixtures.session({ id: 'old-session-id', userId: 'user-id-1' }),
      )
      mocks.authSessionRepo.delete.mockResolvedValue(true)
      mocks.authIdentityRepo.findByUserId.mockResolvedValue([
        AuthFixtures.emailIdentity({ userId: 'user-id-1', email: 'test@example.com' }),
      ])
      mocks.userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.refreshToken('valid-refresh-token')

      expect(mocks.authSessionRepo.delete).toHaveBeenCalledWith('old-session-id')
      expect(mocks.authSessionRepo.save).toHaveBeenCalled()
      expect(result.accessToken).toBe('mock-access-token')
    })
  })

  describe('revokeSession', () => {
    it('target === current session → returns { success: false }, no DB call', async () => {
      const result = await service.revokeSession('session-123', 'user-id-1', 'session-123')

      expect(result.success).toBe(false)
      expect(mocks.authSessionRepo.findById).not.toHaveBeenCalled()
    })

    it('session belongs to different user → returns { success: false }', async () => {
      mocks.authSessionRepo.findById.mockResolvedValue(
        AuthFixtures.session({ id: 'other-session', userId: 'other-user-id' }),
      )

      const result = await service.revokeSession('other-session', 'user-id-1', 'current-session')

      expect(result.success).toBe(false)
    })

    it('success → deletes session, returns { success: true }', async () => {
      mocks.authSessionRepo.findById.mockResolvedValue(
        AuthFixtures.session({ id: 'target-session', userId: 'user-id-1' }),
      )
      mocks.authSessionRepo.delete.mockResolvedValue(true)

      const result = await service.revokeSession('target-session', 'user-id-1', 'current-session')

      expect(result.success).toBe(true)
      expect(mocks.authSessionRepo.delete).toHaveBeenCalledWith('target-session')
    })
  })

  describe('changePassword', () => {
    it('no email identity → UnauthorizedException', async () => {
      mocks.authIdentityRepo.findByUserIdAndProvider.mockResolvedValue(null)

      await expect(service.changePassword('user-id-1', 'current', 'new')).rejects.toThrow(UnauthorizedException)
    })

    it('wrong current password → UnauthorizedException', async () => {
      mocks.authIdentityRepo.findByUserIdAndProvider.mockResolvedValue(AuthFixtures.emailIdentity())
      mocks.passwordHasher.verify.mockResolvedValue(false)

      await expect(service.changePassword('user-id-1', 'wrong', 'new')).rejects.toThrow(UnauthorizedException)
    })

    it('success → updates password hash, clears all sessions', async () => {
      const identity = AuthFixtures.emailIdentity({ userId: 'user-id-1' })
      mocks.authIdentityRepo.findByUserIdAndProvider.mockResolvedValue(identity)
      mocks.passwordHasher.verify.mockResolvedValue(true)
      mocks.passwordHasher.hash.mockResolvedValue('new-hashed-pw')
      mocks.authIdentityRepo.save.mockResolvedValue()
      mocks.authSessionRepo.deleteAllByUserId.mockResolvedValue(2)

      await service.changePassword('user-id-1', 'current', 'new')

      expect(mocks.authIdentityRepo.save).toHaveBeenCalledWith(identity)
      expect(mocks.authSessionRepo.deleteAllByUserId).toHaveBeenCalledWith('user-id-1')
    })
  })
})
