/**
 * Auth provider type
 *
 * Supported authentication methods:
 * - email: email/password authentication
 * - google: Google OAuth
 * - github: GitHub OAuth
 * - phone: phone number authentication
 */
export const AuthProvider = {
  EMAIL: 'email',
  GOOGLE: 'google',
  GITHUB: 'github',
  PHONE: 'phone',
} as const

export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider]
