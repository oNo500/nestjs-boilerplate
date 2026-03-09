import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { USER_MANAGEMENT_REPOSITORY } from '@/modules/user-management/application/ports/user.repository.port'

import { createTestApp } from './helpers/create-app'
import { createRequest } from './helpers/create-request'

import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { UserManagementRepository } from '@/modules/user-management/application/ports/user.repository.port'
import type { INestApplication } from '@nestjs/common'

interface UserResponse {
  id: string
  name: string
  displayName: string | null
  email: string
  role: string | null
  banned: boolean
}

interface UserListResponse {
  object: string
  data: UserResponse[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

describe('userManagement E2E Tests', () => {
  let app: INestApplication
  let prefix: string
  let userRepo: UserManagementRepository
  let userRoleRepo: UserRoleRepository

  // Track created user IDs for cleanup
  const createdUserIds: string[] = []

  let adminToken: string
  let adminUserId: string
  let regularUserToken: string
  let regularUserId: string

  beforeAll(async () => {
    app = await createTestApp()
    prefix = globalThis.e2ePrefix ?? `e2e-${Date.now()}`
    userRepo = app.get<UserManagementRepository>(USER_MANAGEMENT_REPOSITORY)
    userRoleRepo = app.get<UserRoleRepository>(USER_ROLE_REPOSITORY)

    const adminEmail = `${prefix}-admin@test.com`
    const regularEmail = `${prefix}-user@test.com`

    // Register admin user
    const adminRegRes = await createRequest(app)
      .post('/api/auth/register')
      .send({ email: adminEmail, password: 'Password123', name: 'adminuser' })
      .expect(201)

    const adminBody = adminRegRes.body as { accessToken: string, user: { id: string } }
    adminUserId = adminBody.user.id
    createdUserIds.push(adminUserId)

    // Elevate to ADMIN via repository (bypasses chicken-and-egg HTTP auth problem)
    await userRoleRepo.setRole(adminUserId, 'ADMIN')

    // Re-login to get a fresh token containing the ADMIN role in JWT payload
    const adminLoginRes = await createRequest(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'Password123' })
      .expect(200)

    adminToken = (adminLoginRes.body as { accessToken: string }).accessToken

    // Register regular user
    const regularRegRes = await createRequest(app)
      .post('/api/auth/register')
      .send({ email: regularEmail, password: 'Password123', name: 'regularuser' })
      .expect(201)

    const regularBody = regularRegRes.body as { accessToken: string, user: { id: string } }
    regularUserToken = regularBody.accessToken
    regularUserId = regularBody.user.id
    createdUserIds.push(regularUserId)
  })

  afterAll(async () => {
    // Cleanup: hard-delete all users created during this test suite
    await Promise.allSettled(createdUserIds.map((id) => userRepo.hardDelete(id)))
    await app.close()
  })

  // ============================================================
  // GET /api/users
  // ============================================================

  describe('gET /api/users', () => {
    it('401 when no token', async () => {
      const res = await createRequest(app).get('/api/users')
      expect(res.status).toBe(401)
    })

    it('403 for non-ADMIN user', async () => {
      const res = await createRequest(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
      expect(res.status).toBe(403)
    })

    it('aDMIN can list users with pagination', async () => {
      const res = await createRequest(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      const body = res.body as UserListResponse
      expect(body.data).toBeDefined()
      expect(Array.isArray(body.data)).toBe(true)
      expect(typeof body.total).toBe('number')
      expect(body.total).toBeGreaterThan(0)
    })
  })

  // ============================================================
  // POST /api/users
  // ============================================================

  describe('pOST /api/users', () => {
    it('403 for non-ADMIN user', async () => {
      const res = await createRequest(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          email: `${prefix}-new-user@test.com`,
          password: 'Password123',
        })
      expect(res.status).toBe(403)
    })

    it('aDMIN can create user (201)', async () => {
      const email = `${prefix}-admin-created@test.com`
      const res = await createRequest(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, password: 'Password123', name: 'admincreated' })
        .expect(201)

      const body = res.body as UserResponse
      expect(body.id).toBeDefined()
      expect(body.email).toBe(email)
      createdUserIds.push(body.id)
    })

    it('aDMIN creating duplicate email → 409', async () => {
      const email = `${prefix}-admin-dup@test.com`

      // Create first
      const first = await createRequest(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, password: 'Password123', name: 'dupuser1' })
        .expect(201)

      createdUserIds.push((first.body as UserResponse).id)

      // Duplicate
      const res = await createRequest(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, password: 'Password123', name: 'dupuser2' })
      expect(res.status).toBe(409)
    })
  })

  // ============================================================
  // PUT /api/users/:id/role
  // ============================================================

  describe('pUT /api/users/:id/role', () => {
    it('403 for non-ADMIN user trying to change role', async () => {
      const res = await createRequest(app)
        .put(`/api/users/${adminUserId}/role`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ role: 'ADMIN' })
      expect(res.status).toBe(403)
    })

    it('non-admin gets 403 before 404 for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'
      const res = await createRequest(app)
        .put(`/api/users/${nonExistentId}/role`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ role: 'USER' })
      expect(res.status).toBe(403)
    })

    it('aDMIN cannot assign role to themselves', async () => {
      const res = await createRequest(app)
        .put(`/api/users/${adminUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'USER' })
      expect(res.status).toBe(403)
    })

    it('aDMIN assigning role to non-existent user → 404', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'
      const res = await createRequest(app)
        .put(`/api/users/${nonExistentId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'USER' })
      expect(res.status).toBe(404)
    })

    it('aDMIN can assign role to another user', async () => {
      const res = await createRequest(app)
        .put(`/api/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'ADMIN' })
        .expect(200)

      const body = res.body as UserResponse
      expect(body.role).toBe('ADMIN')

      // Reset back to USER for test isolation
      await createRequest(app)
        .put(`/api/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'USER' })
    })
  })

  // ============================================================
  // GET /api/users/summary
  // ============================================================

  describe('gET /api/users/summary', () => {
    it('401 when no token', async () => {
      const res = await createRequest(app).get('/api/users/summary')
      expect(res.status).toBe(401)
    })

    it('403 for non-ADMIN user', async () => {
      const res = await createRequest(app)
        .get('/api/users/summary')
        .set('Authorization', `Bearer ${regularUserToken}`)
      expect(res.status).toBe(403)
    })

    it('aDMIN can get summary with correct shape', async () => {
      const res = await createRequest(app)
        .get('/api/users/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      const body = res.body as { total: number, active: number, adminCount: number, newToday: number }
      expect(typeof body.total).toBe('number')
      expect(typeof body.active).toBe('number')
      expect(typeof body.adminCount).toBe('number')
      expect(typeof body.newToday).toBe('number')
      expect(body.total).toBeGreaterThan(0)
      expect(body.adminCount).toBeGreaterThanOrEqual(1) // at least the admin we created
      expect(body.newToday).toBeGreaterThanOrEqual(1) // created during this test run
    })
  })

  // ============================================================
  // Basic access control verification
  // ============================================================

  describe('access control', () => {
    it('regular user cannot access admin endpoints', async () => {
      const getRes = await createRequest(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
      expect(getRes.status).toBe(403)

      const postRes = await createRequest(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ email: `${prefix}-blocked@test.com`, password: 'Password123' })
      expect(postRes.status).toBe(403)
    })

    it('unauthenticated requests to all user management endpoints return 401', async () => {
      const [r1, r2, r3] = await Promise.all([
        createRequest(app).get('/api/users'),
        createRequest(app).post('/api/users'),
        createRequest(app).put(`/api/users/${regularUserId}/role`),
      ])
      expect(r1.status).toBe(401)
      expect(r2.status).toBe(401)
      expect(r3.status).toBe(401)
    })
  })
})
