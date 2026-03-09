/**
 * Profile aggregate root pure domain tests — no NestJS Testing Module
 */
import { Profile } from '@/modules/profile/domain/aggregates/profile.aggregate'

describe('profile aggregate', () => {
  describe('updateDisplayName', () => {
    it('throws Error when displayName exceeds 50 characters', () => {
      const profile = Profile.create('user-1')
      const tooLong = 'a'.repeat(51)

      expect(() => profile.updateDisplayName(tooLong)).toThrow(
        'Display name cannot exceed 50 characters',
      )
    })

    it('null value is valid', () => {
      const profile = Profile.create('user-1', 'Initial Name')

      profile.updateDisplayName(null)

      expect(profile.displayName).toBeNull()
    })

    it('valid string updates displayName', () => {
      const profile = Profile.create('user-1')

      profile.updateDisplayName('New Display Name')

      expect(profile.displayName).toBe('New Display Name')
    })

    it('exactly 50 characters is valid', () => {
      const profile = Profile.create('user-1')
      const exactly50 = 'a'.repeat(50)

      expect(() => profile.updateDisplayName(exactly50)).not.toThrow()
      expect(profile.displayName).toBe(exactly50)
    })
  })

  describe('updateBio', () => {
    it('throws Error when bio exceeds 500 characters', () => {
      const profile = Profile.create('user-1')
      const tooLong = 'b'.repeat(501)

      expect(() => profile.updateBio(tooLong)).toThrow(
        'Bio cannot exceed 500 characters',
      )
    })

    it('valid bio content updates bio', () => {
      const profile = Profile.create('user-1')

      profile.updateBio('Hello, I am a test user.')

      expect(profile.bio).toBe('Hello, I am a test user.')
    })
  })
})
