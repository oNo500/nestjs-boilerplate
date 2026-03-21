import { IDENTITY_REPOSITORY } from '@/modules/identity/application/ports/user.repository.port'

import { createTestApp } from './helpers/create-app'
import { registerAndLogin } from './helpers/create-authenticated-request'
import { createRequest } from './helpers/create-request'

import type { IdentityRepository } from '@/modules/identity/application/ports/user.repository.port'
import type { INestApplication } from '@nestjs/common'

interface ProfileResponse {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  preferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

describe('profile E2E Tests', () => {
  let app: INestApplication
  let prefix: string
  let userRepo: IdentityRepository

  const createdUserIds: string[] = []

  /** Register, track for cleanup, and return accessToken */
  async function registerTracked(email: string, password: string, name: string): Promise<string> {
    const token = await registerAndLogin(app, email, password, name)
    const user = await userRepo.findByEmail(email)
    if (user) createdUserIds.push(user.id)
    return token
  }

  beforeAll(async () => {
    app = await createTestApp()
    prefix = globalThis.e2ePrefix ?? `e2e-${Date.now()}`
    userRepo = app.get<IdentityRepository>(IDENTITY_REPOSITORY)
  })

  afterAll(async () => {
    await Promise.allSettled(createdUserIds.map((id) => userRepo.hardDelete(id)))
    await app.close()
  })

  // ============================================================
  // GET /api/profile
  // ============================================================

  describe('gET /api/profile', () => {
    it('401 when no token', async () => {
      const res = await createRequest(app).get('/api/profile')
      expect(res.status).toBe(401)
    })

    it('returns current user profile', async () => {
      const email = `${prefix}-profile-get@test.com`
      const token = await registerTracked(email, 'Password123', 'profileuser1')

      const res = await createRequest(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      const body = res.body as ProfileResponse
      expect(body.userId).toBeDefined()
      expect(body).toHaveProperty('displayName')
      expect(body).toHaveProperty('avatarUrl')
      expect(body).toHaveProperty('bio')
    })
  })

  // ============================================================
  // PATCH /api/profile
  // ============================================================

  describe('pATCH /api/profile', () => {
    it('updates displayName', async () => {
      const email = `${prefix}-profile-dn@test.com`
      const token = await registerTracked(email, 'Password123', 'profileuser2')

      const res = await createRequest(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ displayName: 'My Display Name' })
        .expect(200)

      const body = res.body as ProfileResponse
      expect(body.displayName).toBe('My Display Name')
    })

    it('displayName exceeds 50 characters → 422', async () => {
      const email = `${prefix}-profile-dn-long@test.com`
      const token = await registerTracked(email, 'Password123', 'profileuser3')

      const res = await createRequest(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ displayName: 'a'.repeat(51) })
      expect(res.status).toBe(422)
    })

    it('updates bio', async () => {
      const email = `${prefix}-profile-bio@test.com`
      const token = await registerTracked(email, 'Password123', 'profileuser4')

      const res = await createRequest(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ bio: 'This is my bio.' })
        .expect(200)

      const body = res.body as ProfileResponse
      expect(body.bio).toBe('This is my bio.')
    })

    it('bio exceeds 500 characters → 422', async () => {
      const email = `${prefix}-profile-bio-long@test.com`
      const token = await registerTracked(email, 'Password123', 'profileuser5')

      const res = await createRequest(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ bio: 'b'.repeat(501) })
      expect(res.status).toBe(422)
    })
  })
})
