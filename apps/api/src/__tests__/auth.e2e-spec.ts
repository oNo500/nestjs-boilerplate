import { USER_MANAGEMENT_REPOSITORY } from '@/modules/user-management/application/ports/user.repository.port'

import { createTestApp } from './helpers/create-app'
import { registerAndLogin } from './helpers/create-authenticated-request'
import { createRequest } from './helpers/create-request'

import type { UserManagementRepository } from '@/modules/user-management/application/ports/user.repository.port'
import type { INestApplication } from '@nestjs/common'

// ============================================================
// Type definitions
// ============================================================

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: { id: string, email: string, role: string | null }
}

interface SessionInfo {
  id: string
  isCurrent: boolean
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  expiresAt: string
}

interface SessionsListResponse {
  sessions: SessionInfo[]
}

// ============================================================
// Test suite
// ============================================================

describe('auth E2E Tests', () => {
  let app: INestApplication
  let prefix: string
  let userRepo: UserManagementRepository

  // Track all registered user IDs for cleanup
  const createdUserIds: string[] = []

  /** Register and track the user ID for afterAll cleanup */
  async function register(email: string, password: string, name: string): Promise<AuthResponse> {
    const res = await createRequest(app)
      .post('/api/auth/register')
      .send({ email, password, name })
      .expect(201)
    const body = res.body as AuthResponse
    createdUserIds.push(body.user.id)
    return body
  }

  beforeAll(async () => {
    app = await createTestApp()
    prefix = globalThis.e2ePrefix ?? `e2e-${Date.now()}`
    userRepo = app.get<UserManagementRepository>(USER_MANAGEMENT_REPOSITORY)
  })

  afterAll(async () => {
    await Promise.allSettled(createdUserIds.map((id) => userRepo.hardDelete(id)))
    await app.close()
  })

  // ============================================================
  // POST /api/auth/register
  // ============================================================

  describe('pOST /api/auth/register', () => {
    it('201 with tokens', async () => {
      const email = `${prefix}-reg-success@test.com`
      const body = await register(email, 'Password123', 'testuser1')

      expect(body.accessToken).toBeDefined()
      expect(body.refreshToken).toBeDefined()
      expect(body.user.email).toBe(email)
    })

    it('duplicate email → 409', async () => {
      const email = `${prefix}-reg-dup@test.com`
      await register(email, 'Password123', 'testuser2')

      const res = await createRequest(app)
        .post('/api/auth/register')
        .send({ email, password: 'Password123', name: 'testuser2b' })
      expect(res.status).toBe(409)
    })

    it('invalid email format → 422', async () => {
      const res = await createRequest(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'Password123', name: 'testuser' })
      expect(res.status).toBe(422)
    })

    it('password too short → 422', async () => {
      const res = await createRequest(app)
        .post('/api/auth/register')
        .send({ email: `${prefix}-short-pw@test.com`, password: 'abc', name: 'testuser' })
      expect(res.status).toBe(422)
    })
  })

  // ============================================================
  // POST /api/auth/login
  // ============================================================

  describe('pOST /api/auth/login', () => {
    it('200 with tokens on success', async () => {
      const email = `${prefix}-login-ok@test.com`
      await register(email, 'Password123', 'loginuser')

      const res = await createRequest(app)
        .post('/api/auth/login')
        .send({ email, password: 'Password123' })
        .expect(200)

      const body = res.body as AuthResponse
      expect(body.accessToken).toBeDefined()
      expect(body.user.email).toBe(email)
    })

    it('user not found → 401', async () => {
      const res = await createRequest(app)
        .post('/api/auth/login')
        .send({ email: `${prefix}-nonexistent@test.com`, password: 'Password123' })
      expect(res.status).toBe(401)
    })

    it('wrong password → 401', async () => {
      const email = `${prefix}-wrong-pw@test.com`
      await register(email, 'Password123', 'wrongpwuser')

      const res = await createRequest(app)
        .post('/api/auth/login')
        .send({ email, password: 'WrongPassword999' })
      expect(res.status).toBe(401)
    })
  })

  // ============================================================
  // POST /api/auth/refresh-token
  // ============================================================

  describe('pOST /api/auth/refresh-token', () => {
    it('success: rotates token (old token becomes invalid)', async () => {
      const email = `${prefix}-refresh@test.com`
      const { refreshToken: oldRefreshToken } = await register(email, 'Password123', 'refreshuser')

      // Use old token to get new tokens
      const refreshRes = await createRequest(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken })
        .expect(200)

      const refreshBody = refreshRes.body as AuthResponse
      expect(refreshBody.accessToken).toBeDefined()
      expect(refreshBody.refreshToken).toBeDefined()
      expect(refreshBody.refreshToken).not.toBe(oldRefreshToken)

      // Old token should now be invalid
      await createRequest(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken })
        .expect(401)
    })

    it('invalid token → 401', async () => {
      const res = await createRequest(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token-that-does-not-exist' })
      expect(res.status).toBe(401)
    })
  })

  // ============================================================
  // POST /api/auth/logout
  // ============================================================

  describe('pOST /api/auth/logout', () => {
    it('session is deleted after logout', async () => {
      const email = `${prefix}-logout@test.com`
      const { accessToken, refreshToken } = await register(email, 'Password123', 'logoutuser')

      const logoutRes = await createRequest(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
      expect(logoutRes.status).toBe(200)

      // refresh token should no longer be valid
      const refreshRes = await createRequest(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
      expect(refreshRes.status).toBe(401)
    })
  })

  // ============================================================
  // GET /api/auth/sessions
  // ============================================================

  describe('gET /api/auth/sessions', () => {
    it('401 when no token', async () => {
      const res = await createRequest(app).get('/api/auth/sessions')
      expect(res.status).toBe(401)
    })

    it('isCurrent is correctly marked for the current session', async () => {
      const email = `${prefix}-sessions@test.com`
      const token = await registerAndLogin(app, email, 'Password123', 'sessionsuser')
      // registerAndLogin internally calls register — track the user for cleanup
      const user = await userRepo.findByEmail(email)
      if (user) createdUserIds.push(user.id)

      const res = await createRequest(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      const body = res.body as SessionsListResponse
      expect(body.sessions).toBeDefined()
      expect(body.sessions.length).toBeGreaterThan(0)

      const currentSessions = body.sessions.filter((s) => s.isCurrent)
      expect(currentSessions).toHaveLength(1)
    })
  })

  // ============================================================
  // POST /api/auth/revoke-session
  // ============================================================

  describe('pOST /api/auth/revoke-session', () => {
    it('cannot revoke the current session', async () => {
      const email = `${prefix}-revoke-self@test.com`
      const token = await registerAndLogin(app, email, 'Password123', 'revokeself')
      const user = await userRepo.findByEmail(email)
      if (user) createdUserIds.push(user.id)

      const sessionsRes = await createRequest(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      const body = sessionsRes.body as SessionsListResponse
      const currentSession = body.sessions.find((s) => s.isCurrent)!

      const revokeRes = await createRequest(app)
        .post('/api/auth/revoke-session')
        .set('Authorization', `Bearer ${token}`)
        .send({ sessionId: currentSession.id })
        .expect(200)

      const revokeBody = revokeRes.body as { success: boolean }
      expect(revokeBody.success).toBe(false)
    })

    it('can revoke another session', async () => {
      const email = `${prefix}-revoke-other@test.com`

      // First login — creates session A
      const { accessToken: tokenA } = await register(email, 'Password123', 'revokenotself')

      // Second login — creates session B
      const loginResB = await createRequest(app)
        .post('/api/auth/login')
        .send({ email, password: 'Password123' })
        .expect(200)
      const { accessToken: tokenB } = loginResB.body as AuthResponse

      // Get sessions using token B — session B is current
      const sessionsRes = await createRequest(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200)

      const sessions = (sessionsRes.body as SessionsListResponse).sessions
      const sessionA = sessions.find((s) => !s.isCurrent)

      // There must be at least one non-current session (session A)
      expect(sessionA).toBeDefined()

      const revokeRes = await createRequest(app)
        .post('/api/auth/revoke-session')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ sessionId: sessionA!.id })
        .expect(200)

      const revokeBody = revokeRes.body as { success: boolean }
      expect(revokeBody.success).toBe(true)

      // Cleanup: revoke remaining sessions for token A
      await createRequest(app)
        .post('/api/auth/revoke-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
    })
  })
})
