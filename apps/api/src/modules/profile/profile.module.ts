import { Module } from '@nestjs/common'

import { PROFILE_REPOSITORY } from '@/modules/profile/application/ports/profile.repository.port'
import { ProfileService } from '@/modules/profile/application/services/profile.service'
import { ProfileRepositoryImpl } from '@/modules/profile/infrastructure/repositories/profile.repository'
import { ProfileController } from '@/modules/profile/presentation/controllers/profile.controller'
import { PROFILE_PORT } from '@/shared-kernel/application/ports/profile.port'

import type { ProfilePort } from '@/shared-kernel/application/ports/profile.port'

/**
 * Profile module
 *
 * Provides user profile management functionality.
 */
@Module({
  controllers: [ProfileController],
  providers: [
    // Application Service
    ProfileService,

    // Repository implementation (DIP)
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryImpl,
    },

    // Implements ProfilePort interface (consumed by other modules)
    {
      provide: PROFILE_PORT,
      useFactory: (profileService: ProfileService): ProfilePort => ({
        async createProfile(data) {
          const profile = await profileService.createProfile(
            data.userId,
            data.displayName,
          )
          return {
            userId: profile.userId,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
            preferences: profile.preferences,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        },
        async findByUserId(userId) {
          const profile = await profileService.findByUserId(userId)
          if (!profile) return null
          return {
            userId: profile.userId,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
            preferences: profile.preferences,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        },
        async exists(userId) {
          return profileService.exists(userId)
        },
        async deleteProfile(userId) {
          return profileService.deleteProfile(userId)
        },
      }),
      inject: [ProfileService],
    },
  ],
  exports: [
    ProfileService,
    // Export ProfilePort for use by other modules
    PROFILE_PORT,
  ],
})
export class ProfileModule {}
