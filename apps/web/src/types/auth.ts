/**
 * Auth type definitions
 */

// User basic info
export interface UserInfo {
  id: string
  email: string
  roles: string[]
}

// User profile with username
export interface UserProfile extends UserInfo {
  username: string
}

// Login request
export interface LoginRequest {
  email: string
  password: string
}

// Login/register response with tokens
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
}

// Register request
export interface RegisterRequest {
  email: string
  password: string
  username: string
}

// Token refresh response
export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

// Auth Tokens
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
