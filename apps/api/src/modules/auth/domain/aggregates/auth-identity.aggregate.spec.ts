/**
 * AuthIdentity aggregate root pure domain tests — no NestJS Testing Module
 */
import { AuthIdentity } from '@/modules/auth/domain/aggregates/auth-identity.aggregate'

describe('authIdentity aggregate', () => {
  describe('createEmailIdentity', () => {
    it('provider=email, password is not null', () => {
      const identity = AuthIdentity.createEmailIdentity(
        'id-1',
        'user-1',
        'test@example.com',
        'hashed-password',
      )

      expect(identity.provider).toBe('email')
      expect(identity.password).toBe('hashed-password')
      expect(identity.userId).toBe('user-1')
      expect(identity.identifier).toBe('test@example.com')
    })

    it('normalizes email to lowercase', () => {
      const identity = AuthIdentity.createEmailIdentity(
        'id-1',
        'user-1',
        'TEST@EXAMPLE.COM',
        'hashed-password',
      )

      expect(identity.identifier).toBe('test@example.com')
    })
  })

  describe('createOAuthIdentity', () => {
    it('password=null, provider is set correctly', () => {
      const googleIdentity = AuthIdentity.createOAuthIdentity(
        'id-1',
        'user-1',
        'google',
        'google-account-123',
      )

      expect(googleIdentity.password).toBeNull()
      expect(googleIdentity.provider).toBe('google')
      expect(googleIdentity.accountId).toBe('google-account-123')

      const githubIdentity = AuthIdentity.createOAuthIdentity(
        'id-2',
        'user-1',
        'github',
        'github-account-456',
      )

      expect(githubIdentity.provider).toBe('github')
      expect(githubIdentity.password).toBeNull()
    })
  })

  describe('changePassword', () => {
    it('throws Error for non-email provider', () => {
      const oauthIdentity = AuthIdentity.createOAuthIdentity(
        'id-1',
        'user-1',
        'google',
        'google-123',
      )

      expect(() => oauthIdentity.changePassword('new-hash')).toThrow(
        'Password change is only supported for email authentication',
      )
    })

    it('email provider → successfully updates password', () => {
      const identity = AuthIdentity.createEmailIdentity(
        'id-1',
        'user-1',
        'test@example.com',
        'old-hash',
      )

      identity.changePassword('new-hash')

      expect(identity.password).toBe('new-hash')
    })
  })
})
