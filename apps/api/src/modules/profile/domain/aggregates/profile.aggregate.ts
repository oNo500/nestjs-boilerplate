import { BaseAggregateRoot } from '@/shared-kernel/domain/base-aggregate-root'

import type { UserPreferences } from '@/shared-kernel/domain/value-objects/user-preferences.vo'

/**
 * Profile aggregate root
 *
 * Encapsulates business logic for user profiles.
 */
export class Profile extends BaseAggregateRoot {
  readonly #userId: string
  #displayName: string | null
  #avatarUrl: string | null
  #bio: string | null
  #preferences: UserPreferences
  readonly #createdAt: Date
  #updatedAt: Date

  private constructor(
    userId: string,
    displayName: string | null,
    avatarUrl: string | null,
    bio: string | null,
    preferences: UserPreferences,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super()
    this.#userId = userId
    this.#displayName = displayName
    this.#avatarUrl = avatarUrl
    this.#bio = bio
    this.#preferences = preferences
    this.#createdAt = createdAt
    this.#updatedAt = updatedAt
  }

  /**
   * Creates a new profile (factory method).
   */
  static create(userId: string, displayName?: string): Profile {
    const now = new Date()
    return new Profile(userId, displayName ?? null, null, null, {}, now, now)
  }

  /**
   * Reconstitutes a profile from persisted data (factory method).
   */
  static reconstitute(
    userId: string,
    displayName: string | null,
    avatarUrl: string | null,
    bio: string | null,
    preferences: UserPreferences,
    createdAt: Date,
    updatedAt: Date,
  ): Profile {
    return new Profile(
      userId,
      displayName,
      avatarUrl,
      bio,
      preferences,
      createdAt,
      updatedAt,
    )
  }

  // ========== Getters ==========

  get userId(): string {
    return this.#userId
  }

  get displayName(): string | null {
    return this.#displayName
  }

  get avatarUrl(): string | null {
    return this.#avatarUrl
  }

  get bio(): string | null {
    return this.#bio
  }

  get preferences(): UserPreferences {
    return { ...this.#preferences }
  }

  get createdAt(): Date {
    return this.#createdAt
  }

  get updatedAt(): Date {
    return this.#updatedAt
  }

  // ========== Business methods ==========

  /**
   * Updates the display name.
   */
  updateDisplayName(displayName: string | null): void {
    if (displayName !== null && displayName.length > 50) {
      throw new Error('Display name cannot exceed 50 characters')
    }
    this.#displayName = displayName
    this.#updatedAt = new Date()
  }

  /**
   * Updates the avatar.
   */
  updateAvatar(avatarUrl: string | null): void {
    this.#avatarUrl = avatarUrl
    this.#updatedAt = new Date()
  }

  /**
   * Updates the bio.
   */
  updateBio(bio: string | null): void {
    if (bio !== null && bio.length > 500) {
      throw new Error('Bio cannot exceed 500 characters')
    }
    this.#bio = bio
    this.#updatedAt = new Date()
  }

  /**
   * Updates preferences.
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.#preferences = {
      ...this.#preferences,
      ...preferences,
    }
    this.#updatedAt = new Date()
  }

  /**
   * Sets the theme.
   */
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.updatePreferences({ theme })
  }

  /**
   * Sets the language.
   */
  setLanguage(lang: string): void {
    this.updatePreferences({ lang })
  }

  /**
   * Sets the timezone.
   */
  setTimezone(timezone: string): void {
    this.updatePreferences({ timezone })
  }

  /**
   * Toggles notifications.
   */
  setNotifications(enabled: boolean): void {
    this.updatePreferences({ notifications: enabled })
  }
}
