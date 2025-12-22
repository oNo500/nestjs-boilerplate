import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AUTH_COOKIE_OPTIONS,
  AUTH_WRITE_ROUTES,
  clearAuthCookies,
  proxyAuthRequest,
  setAuthCookies,
} from '../auth'

// Mock env
vi.mock('@/config/env', () => ({
  env: {
    API_UPSTREAM_BASE_URL: 'http://localhost:3000',
    NODE_ENV: 'test',
  },
}))

describe('AUTH_WRITE_ROUTES', () => {
  it('should contain all auth routes that modify cookies', () => {
    expect(AUTH_WRITE_ROUTES).toContain('/api/auth/login')
    expect(AUTH_WRITE_ROUTES).toContain('/api/auth/logout')
    expect(AUTH_WRITE_ROUTES).toContain('/api/auth/refresh')
    expect(AUTH_WRITE_ROUTES).toContain('/api/auth/register')
    expect(AUTH_WRITE_ROUTES).toHaveLength(4)
  })
})

describe('AUTH_COOKIE_OPTIONS', () => {
  it('should have secure httpOnly cookies', () => {
    expect(AUTH_COOKIE_OPTIONS.httpOnly).toBe(true)
    expect(AUTH_COOKIE_OPTIONS.sameSite).toBe('lax')
    expect(AUTH_COOKIE_OPTIONS.path).toBe('/')
  })

  it('should have 7 days maxAge', () => {
    expect(AUTH_COOKIE_OPTIONS.maxAge).toBe(60 * 60 * 24 * 7)
  })
})

describe('proxyAuthRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should proxy request to upstream and return response', async () => {
    const mockResponse = { accessToken: 'token', user: { id: '1' } }

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await proxyAuthRequest('/api/auth/login', {
      email: 'test@example.com',
      password: 'pass',
    })

    expect(result.ok).toBe(true)
    expect(result.status).toBe(200)
    expect(result.data).toEqual(mockResponse)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('should return error response when upstream fails', async () => {
    const mockError = { detail: 'Invalid credentials' }

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve(mockError),
    })

    const result = await proxyAuthRequest('/api/auth/login', {
      email: 'test@example.com',
      password: 'wrong',
    })

    expect(result.ok).toBe(false)
    expect(result.status).toBe(401)
    expect(result.data).toEqual(mockError)
  })
})

describe('setAuthCookies', () => {
  it('should set access_token and refresh_token cookies', () => {
    const response = NextResponse.json({})
    const mockSet = vi.spyOn(response.cookies, 'set')

    setAuthCookies(response, {
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
    })

    expect(mockSet).toHaveBeenCalledTimes(2)
    expect(mockSet).toHaveBeenCalledWith(
      'access_token',
      'access-123',
      AUTH_COOKIE_OPTIONS,
    )
    expect(mockSet).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-456',
      AUTH_COOKIE_OPTIONS,
    )
  })
})

describe('clearAuthCookies', () => {
  it('should delete both auth cookies', () => {
    const response = NextResponse.json({})
    const mockDelete = vi.spyOn(response.cookies, 'delete')

    clearAuthCookies(response)

    expect(mockDelete).toHaveBeenCalledTimes(2)
    expect(mockDelete).toHaveBeenCalledWith('access_token')
    expect(mockDelete).toHaveBeenCalledWith('refresh_token')
  })
})
