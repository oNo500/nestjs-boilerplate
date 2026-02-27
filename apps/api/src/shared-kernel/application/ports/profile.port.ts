import type { UserPreferences } from '@/shared-kernel/domain/value-objects/user-preferences.vo'

/**
 * Implemented by the Profile module; consumed by other modules.
 */
export const PROFILE_PORT = Symbol('PROFILE_PORT')

export interface CreateProfileData {
  /** 1:1 relation with the users table */
  userId: string
  displayName?: string
}

export interface ProfileInfo {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface ProfilePort {
  createProfile(data: CreateProfileData): Promise<ProfileInfo>
  findByUserId(userId: string): Promise<ProfileInfo | null>
  exists(userId: string): Promise<boolean>
  deleteProfile(userId: string): Promise<boolean>
}
