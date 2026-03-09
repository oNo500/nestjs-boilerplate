import { Inject, Injectable } from '@nestjs/common'

import { PROFILE_REPOSITORY } from '@/modules/profile/application/ports/profile.repository.port'
import { Profile } from '@/modules/profile/domain/aggregates/profile.aggregate'

import type { ProfileRepository } from '@/modules/profile/application/ports/profile.repository.port'
import type { UserPreferences } from '@/shared-kernel/domain/value-objects/user-preferences.vo'

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async createProfile(userId: string, displayName?: string): Promise<Profile> {
    const profile = Profile.create(userId, displayName)
    await this.profileRepository.save(profile)
    return profile
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepository.findByUserId(userId)
  }

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findByUserId(userId)
    if (!profile) {
      return this.createProfile(userId)
    }
    return profile
  }

  async exists(userId: string): Promise<boolean> {
    return this.profileRepository.exists(userId)
  }

  async updateDisplayName(
    userId: string,
    displayName: string | null,
  ): Promise<Profile> {
    const profile = await this.getProfile(userId)
    profile.updateDisplayName(displayName)
    await this.profileRepository.save(profile)
    return profile
  }

  async updateAvatar(
    userId: string,
    avatarUrl: string | null,
  ): Promise<Profile> {
    const profile = await this.getProfile(userId)
    profile.updateAvatar(avatarUrl)
    await this.profileRepository.save(profile)
    return profile
  }

  async updateBio(userId: string, bio: string | null): Promise<Profile> {
    const profile = await this.getProfile(userId)
    profile.updateBio(bio)
    await this.profileRepository.save(profile)
    return profile
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<Profile> {
    const profile = await this.getProfile(userId)
    profile.updatePreferences(preferences)
    await this.profileRepository.save(profile)
    return profile
  }

  async updateProfile(
    userId: string,
    updates: {
      displayName?: string | null
      avatarUrl?: string | null
      bio?: string | null
      preferences?: Partial<UserPreferences>
    },
  ): Promise<Profile> {
    const profile = await this.getProfile(userId)

    if (updates.displayName !== undefined) {
      profile.updateDisplayName(updates.displayName)
    }
    if (updates.avatarUrl !== undefined) {
      profile.updateAvatar(updates.avatarUrl)
    }
    if (updates.bio !== undefined) {
      profile.updateBio(updates.bio)
    }
    if (updates.preferences) {
      profile.updatePreferences(updates.preferences)
    }

    await this.profileRepository.save(profile)
    return profile
  }

  async deleteProfile(userId: string): Promise<boolean> {
    return this.profileRepository.delete(userId)
  }
}
