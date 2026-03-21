import { vi } from 'vitest'

import { AuthFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { createOAuthMocks } from '@/__tests__/unit/factories/mock-factory'
import { OAuthService } from '@/modules/auth/application/services/oauth.service'
import { UserRegisteredViaOAuthEvent } from '@/modules/auth/domain/events/user-registered-via-oauth.event'

import type { OAuthUserProfile } from '@/modules/auth/application/ports/oauth.port'

const googleProfile: OAuthUserProfile = {
  provider: 'google',
  providerId: 'google-123',
  email: 'oauth@example.com',
  name: 'OAuth User',
  accessToken: 'google-access-token',
}

describe('oAuthService', () => {
  let service: OAuthService
  let mocks: ReturnType<typeof createOAuthMocks>

  beforeEach(() => {
    mocks = createOAuthMocks()
    service = new OAuthService(
      mocks.authIdentityRepo,
      mocks.authSessionRepo,
      mocks.userRoleRepo,
      mocks.userRepo,
      mocks.jwtService,
      mocks.configService,
      mocks.eventPublisher,
    )

    mocks.configService.get.mockReturnValue('7d')
    mocks.jwtService.sign.mockReturnValue('mock-access-token')
    mocks.authSessionRepo.save.mockResolvedValue(undefined)
    mocks.eventPublisher.publish.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('findOrCreateUser', () => {
    it('oAuth identity exists → issues token, publishes UserLoggedInViaOAuthEvent, no user created', async () => {
      mocks.authIdentityRepo.findByProviderAndIdentifier.mockResolvedValue(
        AuthFixtures.oauthIdentity('google', { userId: 'user-id-1', accountId: 'google-123' }),
      )
      mocks.userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.findOrCreateUser(googleProfile)

      expect(result.accessToken).toBe('mock-access-token')
      expect(mocks.userRepo.create).not.toHaveBeenCalled()
      await vi.waitFor(() => {
        expect(mocks.eventPublisher.publish).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 'user-id-1', provider: 'google', linked: false }),
        )
      })
    })

    it('email identity exists (no OAuth) → links OAuth identity, publishes UserLoggedInViaOAuthEvent with linked=true', async () => {
      mocks.authIdentityRepo.findByProviderAndIdentifier
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(AuthFixtures.emailIdentity({ userId: 'user-id-2', email: 'oauth@example.com' }))
      mocks.authIdentityRepo.save.mockResolvedValue(undefined)
      mocks.userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.findOrCreateUser(googleProfile)

      expect(result.accessToken).toBe('mock-access-token')
      expect(mocks.authIdentityRepo.save).toHaveBeenCalledOnce()
      expect(mocks.userRepo.create).not.toHaveBeenCalled()
      await vi.waitFor(() => {
        expect(mocks.eventPublisher.publish).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 'user-id-2', provider: 'google', linked: true }),
        )
      })
    })

    it('brand new user → creates user + OAuth identity, publishes UserRegisteredViaOAuthEvent', async () => {
      mocks.authIdentityRepo.findByProviderAndIdentifier
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
      mocks.userRepo.create.mockResolvedValue({
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
      mocks.authIdentityRepo.save.mockResolvedValue(undefined)
      mocks.userRoleRepo.getRole.mockResolvedValue('USER')

      const result = await service.findOrCreateUser(googleProfile)

      expect(result.accessToken).toBe('mock-access-token')
      expect(mocks.userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'OAuth User', email: 'oauth@example.com' }),
      )
      expect(mocks.authIdentityRepo.save).toHaveBeenCalledOnce()
      await vi.waitFor(() => {
        expect(mocks.eventPublisher.publish).toHaveBeenCalledWith(
          expect.objectContaining({ provider: 'google' }),
        )
        const event = mocks.eventPublisher.publish.mock.calls[0]?.[0]
        expect(event).toBeInstanceOf(UserRegisteredViaOAuthEvent)
      })
    })
  })
})
