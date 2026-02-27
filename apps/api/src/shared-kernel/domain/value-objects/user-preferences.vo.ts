/**
 * User preferences
 *
 * A value object shared across modules that defines user personalization settings.
 * Stored in the profiles.preferences JSONB column.
 */
export interface UserPreferences {
  /** Theme: light / dark / follow system */
  theme?: 'light' | 'dark' | 'system'
  /** Language preference */
  lang?: string
  /** Timezone */
  timezone?: string
  /** Whether notifications are enabled */
  notifications?: boolean
}

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: true,
}
