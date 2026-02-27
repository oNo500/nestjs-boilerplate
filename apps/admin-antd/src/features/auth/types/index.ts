/**
 * User status type
 */
export type UserStatus = 'active' | 'inactive'

/**
 * User info (aligned with API UserInfo)
 */
export interface User {
  id: string
  email: string
  role: string | null
  image?: string | null
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
