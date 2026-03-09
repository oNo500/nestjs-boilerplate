const ACCESS_TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  return (
    document.cookie
      .split('; ')
      .find((r) => r.startsWith(`${name}=`))
      ?.split('=')
      .slice(1)
      .join('=') ?? null
  )
}

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; path=/; SameSite=Lax`
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; Max-Age=0`
}

export function getToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY)
}

export function setToken(token: string): void {
  setCookie(ACCESS_TOKEN_KEY, token)
}

export function removeToken(): void {
  removeCookie(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  setCookie(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken(): void {
  removeCookie(REFRESH_TOKEN_KEY)
}

export type StoredUser = {
  id: string
  email: string
  role: string | null
}

export function getUser(): StoredUser | null {
  const raw = getCookie(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as StoredUser
  } catch {
    return null
  }
}

export function setUser(user: StoredUser): void {
  setCookie(USER_KEY, encodeURIComponent(JSON.stringify(user)))
}

export function removeUser(): void {
  removeCookie(USER_KEY)
}
