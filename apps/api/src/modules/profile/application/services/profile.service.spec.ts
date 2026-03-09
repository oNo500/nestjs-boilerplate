import { createMock } from '@golevelup/ts-vitest'
import { Test } from '@nestjs/testing'
import { vi } from 'vitest'

import { ProfileFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { PROFILE_REPOSITORY } from '@/modules/profile/application/ports/profile.repository.port'
import { ProfileService } from '@/modules/profile/application/services/profile.service'

import type { ProfileRepository } from '@/modules/profile/application/ports/profile.repository.port'
import type { TestingModule } from '@nestjs/testing'
import type { Mocked } from 'vitest'

describe('profileService', () => {
  let service: ProfileService
  let profileRepository: Mocked<ProfileRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PROFILE_REPOSITORY, useValue: createMock<ProfileRepository>() },
      ],
    }).compile()

    service = module.get<ProfileService>(ProfileService)
    profileRepository = module.get(PROFILE_REPOSITORY)

    profileRepository.save.mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('not found → auto-creates and returns new Profile', async () => {
      profileRepository.findByUserId.mockResolvedValue(null)

      const result = await service.getProfile('user-not-found')

      expect(profileRepository.save).toHaveBeenCalledOnce()
      expect(result).toBeDefined()
    })

    it('found → returns Profile', async () => {
      const profile = ProfileFixtures.profile('user-id-1', 'Test User')
      profileRepository.findByUserId.mockResolvedValue(profile)

      const result = await service.getProfile('user-id-1')

      expect(result).toBe(profile)
      expect(result.userId).toBe('user-id-1')
    })
  })

  describe('updateProfile', () => {
    it('only updates fields that are passed in (conditional application)', async () => {
      const profile = ProfileFixtures.profileWithData({
        userId: 'user-id-1',
        displayName: 'Original Name',
        bio: 'Original bio',
      })
      profileRepository.findByUserId.mockResolvedValue(profile)

      // Only update displayName, bio should remain unchanged
      const result = await service.updateProfile('user-id-1', { displayName: 'Updated Name' })

      expect(result.displayName).toBe('Updated Name')
      expect(result.bio).toBe('Original bio')
      expect(profileRepository.save).toHaveBeenCalledWith(profile)
    })

    it('updates all provided fields', async () => {
      const profile = ProfileFixtures.profile('user-id-1')
      profileRepository.findByUserId.mockResolvedValue(profile)

      const result = await service.updateProfile('user-id-1', {
        displayName: 'New Name',
        bio: 'New bio',
      })

      expect(result.displayName).toBe('New Name')
      expect(result.bio).toBe('New bio')
    })

    it('setting displayName to null clears it', async () => {
      const profile = ProfileFixtures.profileWithData({ displayName: 'Has Name' })
      profileRepository.findByUserId.mockResolvedValue(profile)

      const result = await service.updateProfile('user-id-1', { displayName: null })

      expect(result.displayName).toBeNull()
    })
  })
})
