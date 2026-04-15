import { describe, expect, it } from 'vitest'

import { ROLES, hasRequiredRole } from './rbac'

describe('ROLES', () => {
  it('exposes ADMIN and USER values', () => {
    expect(ROLES.ADMIN).toBe('ADMIN')
    expect(ROLES.USER).toBe('USER')
  })
})

describe('hasRequiredRole', () => {
  it('returns false when actor is null', () => {
    expect(hasRequiredRole(null, 'USER')).toBe(false)
  })

  it('returns false when actor is undefined', () => {
    expect(hasRequiredRole(undefined, 'USER')).toBe(false)
  })

  it('returns true when actor equals required', () => {
    expect(hasRequiredRole('USER', 'USER')).toBe(true)
    expect(hasRequiredRole('ADMIN', 'ADMIN')).toBe(true)
  })

  it('returns true when actor outranks required', () => {
    expect(hasRequiredRole('ADMIN', 'USER')).toBe(true)
  })

  it('returns false when actor is below required', () => {
    expect(hasRequiredRole('USER', 'ADMIN')).toBe(false)
  })
})
