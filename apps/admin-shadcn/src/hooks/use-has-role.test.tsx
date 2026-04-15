import { renderHook } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { UserProvider } from '@/components/user-provider'

import { useCurrentUser, useHasRole } from './use-has-role'

import type { StoredUser } from '@/lib/token'

function wrapper(user: StoredUser | null) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <UserProvider user={user}>{children}</UserProvider>
  }
}

describe('useCurrentUser', () => {
  it('returns null when no user', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper: wrapper(null) })
    expect(result.current).toBeNull()
  })

  it('returns null when user has no role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: null }
    const { result } = renderHook(() => useCurrentUser(), { wrapper: wrapper(user) })
    expect(result.current).toBeNull()
  })

  it('returns narrowed user when role is set', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    const { result } = renderHook(() => useCurrentUser(), { wrapper: wrapper(user) })
    expect(result.current).toEqual({ id: 'u1', email: 'a@b.com', role: 'ADMIN' })
  })
})

describe('useHasRole', () => {
  it('returns false when no user', () => {
    const { result } = renderHook(() => useHasRole('USER'), { wrapper: wrapper(null) })
    expect(result.current).toBe(false)
  })

  it('returns true when user meets required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    const { result } = renderHook(() => useHasRole('ADMIN'), { wrapper: wrapper(user) })
    expect(result.current).toBe(true)
  })

  it('returns true when user outranks required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    const { result } = renderHook(() => useHasRole('USER'), { wrapper: wrapper(user) })
    expect(result.current).toBe(true)
  })

  it('returns false when user below required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'USER' }
    const { result } = renderHook(() => useHasRole('ADMIN'), { wrapper: wrapper(user) })
    expect(result.current).toBe(false)
  })
})
