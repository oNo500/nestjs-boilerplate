import { describe, expect, it } from 'vitest'

import {
  emailSchema,
  loginSchema,
  nameSchema,
  passwordSchema,
  registerSchema,
} from '../schemas'

describe('emailSchema', () => {
  it('should accept valid emails', () => {
    expect(() => emailSchema.parse('user@example.com')).not.toThrow()
    expect(() => emailSchema.parse('test.user+tag@domain.co.uk')).not.toThrow()
  })

  it('should reject invalid emails', () => {
    expect(() => emailSchema.parse('invalid')).toThrow()
    expect(() => emailSchema.parse('user@')).toThrow()
    expect(() => emailSchema.parse('@domain.com')).toThrow()
    expect(() => emailSchema.parse('')).toThrow()
  })
})

describe('passwordSchema', () => {
  it('should accept passwords with 8+ characters', () => {
    expect(() => passwordSchema.parse('12345678')).not.toThrow()
    expect(() => passwordSchema.parse('longpassword123')).not.toThrow()
  })

  it('should reject short passwords', () => {
    expect(() => passwordSchema.parse('1234567')).toThrow()
    expect(() => passwordSchema.parse('')).toThrow()
  })
})

describe('nameSchema', () => {
  it('should accept valid usernames', () => {
    expect(() => nameSchema.parse('john_doe')).not.toThrow()
    expect(() => nameSchema.parse('user-123')).not.toThrow()
    expect(() => nameSchema.parse('abc')).not.toThrow() // min 3
  })

  it('should reject invalid usernames', () => {
    expect(() => nameSchema.parse('ab')).toThrow() // too short
    expect(() => nameSchema.parse('a'.repeat(31))).toThrow() // too long
    expect(() => nameSchema.parse('user@name')).toThrow() // invalid char
    expect(() => nameSchema.parse('user name')).toThrow() // space
  })
})

describe('loginSchema', () => {
  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'newuser@example.com',
      name: 'new_user',
      password: 'Password1',
      confirmPassword: 'Password1',
    })
    expect(result.success).toBe(true)
  })

  it('should require password to contain letters and numbers', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      name: 'username',
      password: '12345678', // no letters
      confirmPassword: '12345678',
    })
    expect(result.success).toBe(false)
  })

  it('should require passwords to match', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      name: 'username',
      password: 'Password1',
      confirmPassword: 'Different1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find((issue) =>
        issue.path.includes('confirmPassword'),
      )
      expect(confirmError).toBeDefined()
    }
  })

  it('should reject invalid username', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      name: 'user@name', // invalid char
      password: 'Password1',
      confirmPassword: 'Password1',
    })
    expect(result.success).toBe(false)
  })
})
