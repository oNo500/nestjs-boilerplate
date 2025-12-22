import type { AuthResponse, UserInfo, UserProfile } from '@/types/auth'

let userIdCounter = 1

export function createUser(overrides: Partial<UserInfo> = {}): UserInfo {
  const id = userIdCounter++
  return {
    id: `user-${id}`,
    email: `user${id}@example.com`,
    roles: ['USER'],
    ...overrides,
  }
}

export function createUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  const user = createUser(overrides)
  return {
    ...user,
    username: overrides.username ?? `user_${user.id}`,
  }
}

export function createAuthResponse(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
    accessToken: `mock-access-token-${Date.now()}`,
    refreshToken: `mock-refresh-token-${Date.now()}`,
    user: createUser(overrides.user),
    ...overrides,
  }
}

// Reset counter (call in afterEach)
export function resetFactories() {
  userIdCounter = 1
}
