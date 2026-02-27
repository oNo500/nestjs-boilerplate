const ACCESS_TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
