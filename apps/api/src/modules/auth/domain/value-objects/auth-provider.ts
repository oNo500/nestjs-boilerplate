/**
 * Authentication provider type
 *
 * Supported authentication methods:
 * - email: Email/password authentication
 * - google: Google OAuth
 * - github: GitHub OAuth
 * - phone: Phone authentication
 */
export const AuthProvider = {
  EMAIL: 'email',
  GOOGLE: 'google',
  GITHUB: 'github',
  PHONE: 'phone',
} as const

export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider]
