import { setToken, setRefreshToken, setUser, removeToken, removeRefreshToken, removeUser } from '@/lib/token'

import type { StoredUser } from '@/lib/token'

export const mockUser: StoredUser = {
  id: 'user-1',
  email: 'user@example.com',
  role: 'admin',
}

export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
}

export const mockCredentials = {
  valid: { email: 'user@example.com', password: 'Pass123456' },
  invalid: { email: 'wrong@example.com', password: 'WrongPass' },
}

export function setupAuthenticatedState() {
  setToken(mockTokens.accessToken)
  setRefreshToken(mockTokens.refreshToken)
  setUser(mockUser)
}

export function clearAuthState() {
  removeToken()
  removeRefreshToken()
  removeUser()
}
