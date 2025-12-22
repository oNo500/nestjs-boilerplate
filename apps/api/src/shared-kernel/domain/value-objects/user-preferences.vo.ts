/**
 * User preferences
 *
 * Shared value object for user personalization
 * Stored in profiles.preferences JSONB field
 */
export interface UserPreferences {
  /** Theme: light/dark/system */
  theme?: 'light' | 'dark' | 'system'
  /** Language preference */
  lang?: string
  /** Timezone */
  timezone?: string
  /** Notifications enabled */
  notifications?: boolean
}

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: true,
}
