import type { Profile } from '@/modules/profile/domain/aggregates/profile.aggregate'

/**
 * Profile repository interface (DIP)
 *
 * Defines abstract operations for user profile persistence.
 */
export interface ProfileRepository {
  /**
   * Saves a profile (create or update).
   */
  save(profile: Profile): Promise<void>

  /**
   * Finds a profile by user ID.
   */
  findByUserId(userId: string): Promise<Profile | null>

  /**
   * Checks whether a user profile exists.
   */
  exists(userId: string): Promise<boolean>

  /**
   * Deletes a profile.
   */
  delete(userId: string): Promise<boolean>
}

/**
 * Repository injection token
 */
export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY')
