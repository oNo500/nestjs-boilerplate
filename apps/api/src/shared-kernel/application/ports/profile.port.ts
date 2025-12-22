import type { UserPreferences } from '@/shared-kernel/domain/value-objects/user-preferences.vo'

/**
 * Profile Port
 *
 * Abstract interface for user profile service
 * Implemented by Profile module for use by other modules
 *
 * Architecture changes:
 * - Removed email (now in auth_identities table)
 * - Added displayName, avatarUrl, bio, preferences
 */
export const PROFILE_PORT = Symbol('PROFILE_PORT')

/**
 * Data for creating user profile
 */
export interface CreateProfileData {
  /** User ID (1:1 relation with users table) */
  userId: string
  /** Display name (optional) */
  displayName?: string
}

/**
 * User profile information
 */
export interface ProfileInfo {
  /** User ID */
  userId: string
  /** Display name */
  displayName: string | null
  /** Avatar URL */
  avatarUrl: string | null
  /** Bio */
  bio: string | null
  /** User preferences */
  preferences: UserPreferences
  /** Created timestamp */
  createdAt: Date
  /** Updated timestamp */
  updatedAt: Date
}

/**
 * Profile Port interface
 *
 * Provides basic profile operations
 */
export interface ProfilePort {
  /**
   * Create user profile
   * @param data Profile data
   * @returns Created profile
   */
  createProfile(data: CreateProfileData): Promise<ProfileInfo>

  /**
   * Find profile by user ID
   * @param userId User ID
   * @returns Profile or null
   */
  findByUserId(userId: string): Promise<ProfileInfo | null>

  /**
   * Check if profile exists
   * @param userId User ID
   * @returns True if exists
   */
  exists(userId: string): Promise<boolean>

  /**
   * Delete user profile
   * @param userId User ID
   * @returns True if deleted
   */
  deleteProfile(userId: string): Promise<boolean>
}
