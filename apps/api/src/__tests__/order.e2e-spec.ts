import { Module } from '@nestjs/common'

import { CACHE_PORT } from '@/modules/cache/application/ports/cache.port'
import { CacheModule } from '@/modules/cache/cache.module'

import { createTestApp } from './helpers/create-app'
import { createRequest } from './helpers/create-request'

import type { CachePort } from '@/modules/cache/application/ports/cache.port'
import type { INestApplication } from '@nestjs/common'

/**
 * In-memory cache implementation for E2E tests (replaces Redis)
 */
class InMemoryCacheService implements CachePort {
  private readonly store = new Map<string, { value: unknown, expiresAt?: number }>()

  get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key)
    if (!entry) return Promise.resolve(undefined as T | undefined)
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return Promise.resolve(undefined as T | undefined)
    }
    return Promise.resolve(entry.value as T)
  }

  set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined
    this.store.set(key, { value, expiresAt })
    return Promise.resolve()
  }

  del(key: string): Promise<void> {
    this.store.delete(key)
    return Promise.resolve()
  }

  reset(): Promise<void> {
    this.store.clear()
    return Promise.resolve()
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== undefined) return cached
    const result = await fn()
    await this.set(key, result, ttl)
    return result
  }
}

/**
 * Test CacheModule: replaces Redis with an in-memory cache
 */
@Module({
  providers: [
    { provide: CACHE_PORT, useClass: InMemoryCacheService },
  ],
  exports: [CACHE_PORT],
})
class InMemoryCacheModule {}

// ============================================================
// Type definitions
// ============================================================

interface OrderResponse {
  id: string
  userId: string
  status: 'pending_payment' | 'paid' | 'shipping' | 'completed' | 'cancelled'
  items: { productId: string, quantity: number, unitPrice: string }[]
  totalAmount: string
  currency: string
  version: number
  createdAt: string
  updatedAt: string
}

interface JobResponse {
  id: string
  type: string
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled'
  payload: Record<string, unknown>
  result: unknown
  error: { code: string, message: string } | null
}

interface BulkCancelResponse {
  object: 'batch_result'
  data: {
    id: string
    status: 204 | 404 | 409 | 422
    error?: { code: string, message: string }
  }[]
  summary: { succeeded: number, failed: number }
}

// ============================================================
// Helper functions
// ============================================================

/** Create a test order in pending_payment status */
async function createTestOrder(app: INestApplication, userId = 'test-user'): Promise<OrderResponse> {
  const res = await createRequest(app)
    .post('/api/orders')
    .set('Idempotency-Key', crypto.randomUUID())
    .send({
      userId,
      items: [{ productId: 'prod-001', quantity: 2, unitPrice: '99.99' }],
    })
    .expect((r) => {
      if (r.status !== 201 && r.status !== 200) {
        throw new Error(`createTestOrder failed: ${r.status} ${JSON.stringify(r.body)}`)
      }
    })

  return res.body as OrderResponse
}

/**
 * Pay for an order (wraps the GET ETag -> PATCH If-Match flow)
 * Returns the paid order
 */
async function payTestOrder(app: INestApplication, orderId: string): Promise<OrderResponse> {
  const getRes = await createRequest(app).get(`/api/orders/${orderId}`).expect(200)
  const etag = getRes.headers.etag!

  const payRes = await createRequest(app)
    .patch(`/api/orders/${orderId}/pay`)
    .set('If-Match', etag)
    .expect(200)

  return payRes.body as OrderResponse
}

/**
 * Poll a Job until status is no longer pending/running, or until timeout
 */
async function waitForJob(
  app: INestApplication,
  jobId: string,
  timeoutMs = 10_000,
): Promise<JobResponse> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const res = await createRequest(app).get(`/api/jobs/${jobId}`).expect(200)
    const job = res.body as JobResponse
    if (job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') {
      return job
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`Job ${jobId} did not complete within ${timeoutMs}ms`)
}

// ============================================================
// Test suite
// ============================================================

describe('order E2E Tests', () => {
  let app: INestApplication
  const createdOrderIds: string[] = []

  beforeAll(async () => {
    app = await createTestApp({
      moduleOverrides: [{ original: CacheModule, replacement: InMemoryCacheModule }],
    })
  })

  afterAll(async () => {
    // Cleanup: delete all orders created during tests
    for (const id of createdOrderIds) {
      await createRequest(app).delete(`/api/orders/${id}`)
    }
    await app.close()
  })

  // ============================================================
  // Feature 1: Idempotent requests (Idempotency-Key)
  // ============================================================

  describe('pOST /orders — idempotent order creation', () => {
    it('first request returns 201 with no Idempotent-Replayed header', async () => {
      const key = crypto.randomUUID()
      const body = {
        userId: 'user-idempotent-1',
        items: [{ productId: 'prod-001', quantity: 1, unitPrice: '50.00' }],
      }

      const res = await createRequest(app)
        .post('/api/orders')
        .set('Idempotency-Key', key)
        .send(body)
        .expect(201)

      const order = res.body as OrderResponse
      expect(order.id).toBeDefined()
      expect(order.status).toBe('pending_payment')
      expect(res.headers['idempotent-replayed']).toBeUndefined()

      createdOrderIds.push(order.id)
    })

    it('same key + same body replay: returns 200 + Idempotent-Replayed: true, order id matches first request', async () => {
      const key = crypto.randomUUID()
      const body = {
        userId: 'user-idempotent-2',
        items: [{ productId: 'prod-002', quantity: 3, unitPrice: '29.90' }],
      }

      // First request
      const first = await createRequest(app)
        .post('/api/orders')
        .set('Idempotency-Key', key)
        .send(body)
        .expect(201)

      const firstOrder = first.body as OrderResponse
      createdOrderIds.push(firstOrder.id)

      // Replay
      const second = await createRequest(app)
        .post('/api/orders')
        .set('Idempotency-Key', key)
        .send(body)
        .expect(200)

      const secondOrder = second.body as OrderResponse
      expect(secondOrder.id).toBe(firstOrder.id)
      expect(second.headers['idempotent-replayed']).toBe('true')
    })

    it('same key + different body: returns 422 + IDEMPOTENCY_KEY_REUSE_CONFLICT', async () => {
      const key = crypto.randomUUID()

      // First order
      const first = await createRequest(app)
        .post('/api/orders')
        .set('Idempotency-Key', key)
        .send({
          userId: 'user-idempotent-3',
          items: [{ productId: 'prod-001', quantity: 1, unitPrice: '50.00' }],
        })
        .expect(201)

      createdOrderIds.push((first.body as OrderResponse).id)

      // Same key, different body
      const res = await createRequest(app)
        .post('/api/orders')
        .set('Idempotency-Key', key)
        .send({
          userId: 'user-idempotent-3',
          items: [{ productId: 'prod-999', quantity: 5, unitPrice: '9.00' }], // different body
        })
        .expect(422)

      const body = res.body as { code: string }
      expect(body.code).toBe('IDEMPOTENCY_KEY_REUSE_CONFLICT')
    })

    it('missing Idempotency-Key: returns 400', async () => {
      const res = await createRequest(app)
        .post('/api/orders')
        .send({
          userId: 'user-no-key',
          items: [{ productId: 'prod-001', quantity: 1, unitPrice: '50.00' }],
        })
        .expect(400)

      expect(res.body).toHaveProperty('status', 400)
    })

    it('idempotent replay does not create additional order records', async () => {
      const key = crypto.randomUUID()
      const body = {
        userId: 'user-idempotent-count',
        items: [{ productId: 'prod-001', quantity: 1, unitPrice: '10.00' }],
      }

      const first = await createRequest(app)
        .post('/api/orders')
        .set('Idempotency-Key', key)
        .send(body)
        .expect(201)

      const orderId = (first.body as OrderResponse).id
      createdOrderIds.push(orderId)

      // Replay 3 times
      for (let i = 0; i < 3; i++) {
        const rep = await createRequest(app)
          .post('/api/orders')
          .set('Idempotency-Key', key)
          .send(body)
          .expect(200)

        // Each replay returns the same order id
        expect((rep.body as OrderResponse).id).toBe(orderId)
      }
    })
  })

  // ============================================================
  // Feature 2: Optimistic locking (If-Match / ETag)
  // ============================================================

  describe('pATCH /orders/:id/pay — optimistic lock payment', () => {
    it('gET /orders/:id response header contains ETag', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)

      const res = await createRequest(app).get(`/api/orders/${order.id}`).expect(200)

      expect(res.headers.etag).toBeDefined()
      // ETag format: quoted integer, e.g. "0"
      expect(res.headers.etag).toMatch(/^"\d+"$/)
    })

    it('correct If-Match -> 200, response includes updated ETag', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)

      const getRes = await createRequest(app).get(`/api/orders/${order.id}`).expect(200)
      const etag = getRes.headers.etag! // "0"

      const payRes = await createRequest(app)
        .patch(`/api/orders/${order.id}/pay`)
        .set('If-Match', etag)
        .expect(200)

      const paid = payRes.body as OrderResponse
      expect(paid.status).toBe('paid')
      // Version incremented after payment
      expect(paid.version).toBe(order.version + 1)
      // Response header contains new ETag
      expect(payRes.headers.etag).toBe(`"${paid.version}"`)
    })

    it('stale If-Match -> 412 Precondition Failed', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)

      // Use a non-matching version number (e.g. "999") to trigger payment -> 412 version conflict
      // Order is still in pending_payment but version does not match, triggering optimistic lock failure
      const res = await createRequest(app)
        .patch(`/api/orders/${order.id}/pay`)
        .set('If-Match', '"999"')
        .expect(412)

      const body = res.body as { code: string }
      expect(body.code).toBe('ORDER_VERSION_CONFLICT')
    })

    it('missing If-Match -> 412 (PRECONDITION_REQUIRED)', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)

      const res = await createRequest(app)
        .patch(`/api/orders/${order.id}/pay`)
        .expect(412)

      const body = res.body as { code: string }
      expect(body.code).toBe('PRECONDITION_REQUIRED')
    })

    it('invalid If-Match format -> 400', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)

      const res = await createRequest(app)
        .patch(`/api/orders/${order.id}/pay`)
        .set('If-Match', 'not-a-number')
        .expect(400)

      expect(res.body).toHaveProperty('status', 400)
    })

    it('order not found -> 404', async () => {
      const res = await createRequest(app)
        .patch(`/api/orders/00000000-0000-0000-0000-000000000000/pay`)
        .set('If-Match', '"0"')
        .expect(404)

      expect(res.body).toHaveProperty('status', 404)
    })

    it('paying an already-paid order -> 409 ORDER_ALREADY_PAID', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)

      await payTestOrder(app, order.id)

      // Pay again (with updated ETag)
      const getRes = await createRequest(app).get(`/api/orders/${order.id}`).expect(200)

      const res = await createRequest(app)
        .patch(`/api/orders/${order.id}/pay`)
        .set('If-Match', getRes.headers.etag!)
        .expect(409)

      const body = res.body as { code: string }
      expect(body.code).toBe('ORDER_ALREADY_PAID')
    })
  })

  // ============================================================
  // Feature 3: Async operations (202 Accepted + Job polling)
  // ============================================================

  describe('pOST /orders/:id/ship — async shipping', () => {
    it('returns 202 Accepted, response header contains Location pointing to Job', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)
      await payTestOrder(app, order.id)

      const res = await createRequest(app)
        .post(`/api/orders/${order.id}/ship`)
        .expect(202)

      const body = res.body as { jobId: string }
      expect(body.jobId).toBeDefined()
      expect(res.headers.location).toBe(`/api/jobs/${body.jobId}`)
    })

    it('gET /jobs/:id returns initial status pending or running', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)
      await payTestOrder(app, order.id)

      const shipRes = await createRequest(app)
        .post(`/api/orders/${order.id}/ship`)
        .expect(202)

      const { jobId } = shipRes.body as { jobId: string }

      const jobRes = await createRequest(app).get(`/api/jobs/${jobId}`).expect(200)

      const job = jobRes.body as JobResponse
      expect(['pending', 'running', 'succeeded']).toContain(job.status)
      expect(job.type).toBe('ship_order')
      expect((job.payload as { orderId: string }).orderId).toBe(order.id)
    })

    it('poll until Job completes: status becomes succeeded, result contains trackingNumber', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)
      await payTestOrder(app, order.id)

      const shipRes = await createRequest(app)
        .post(`/api/orders/${order.id}/ship`)
        .expect(202)

      const { jobId } = shipRes.body as { jobId: string }

      const job = await waitForJob(app, jobId)

      expect(job.status).toBe('succeeded')
      expect(job.result).toHaveProperty('trackingNumber')
      expect(typeof (job.result as Record<string, unknown>).trackingNumber).toBe('string')
      expect(job.error).toBeNull()
    }, 15_000) // allow enough timeout for async processing

    it('shipping an unpaid order -> 400', async () => {
      const order = await createTestOrder(app)
      createdOrderIds.push(order.id)

      // Ship without paying
      const res = await createRequest(app)
        .post(`/api/orders/${order.id}/ship`)
        .expect(400)

      expect(res.body).toBeDefined()
    })

    it('gET /jobs/:id not found -> 404', async () => {
      const res = await createRequest(app)
        .get('/api/jobs/00000000-0000-0000-0000-000000000000')
        .expect(404)

      expect(res.body).toHaveProperty('status', 404)
    })
  })

  // ============================================================
  // Feature 4: Bulk operations (207 Multi-Status)
  // ============================================================

  describe('dELETE /orders/bulk-cancel — bulk cancellation', () => {
    it('all succeed: returns 200, summary.failed === 0', async () => {
      const o1 = await createTestOrder(app)
      const o2 = await createTestOrder(app)
      // Not added to createdOrderIds because these two will be cancelled

      const res = await createRequest(app)
        .delete('/api/orders/bulk-cancel')
        .send({ ids: [o1.id, o2.id] })
        .expect(200)

      const body = res.body as BulkCancelResponse
      expect(body.object).toBe('batch_result')
      expect(body.summary.succeeded).toBe(2)
      expect(body.summary.failed).toBe(0)
      expect(body.data).toHaveLength(2)
      expect(body.data.every((item) => item.status === 204)).toBe(true)
    })

    it('partial success (mix of valid/paid/non-existent): returns 207', async () => {
      // o1: valid pending_payment, can be cancelled
      const o1 = await createTestOrder(app)
      // o2: already paid, cannot be cancelled
      const o2 = await createTestOrder(app)
      await payTestOrder(app, o2.id)
      createdOrderIds.push(o2.id) // paid order needs manual tracking

      const nonExistentId = 'a0000000-0000-4000-8000-000000000001'

      const res = await createRequest(app)
        .delete('/api/orders/bulk-cancel')
        .send({ ids: [o1.id, o2.id, nonExistentId] })
        .expect(207)

      const body = res.body as BulkCancelResponse
      expect(body.object).toBe('batch_result')
      expect(body.summary.succeeded).toBe(1)
      expect(body.summary.failed).toBe(2)

      const r1 = body.data.find((d) => d.id === o1.id)
      const r2 = body.data.find((d) => d.id === o2.id)
      const r3 = body.data.find((d) => d.id === nonExistentId)

      expect(r1?.status).toBe(204)
      expect(r2?.status).toBe(409)
      expect(r2?.error?.code).toBe('ORDER_ALREADY_PAID')
      expect(r3?.status).toBe(404)
      expect(r3?.error?.code).toBe('ORDER_NOT_FOUND')
    })

    it('all fail (all non-existent IDs): still returns 207, not 4xx', async () => {
      const ids = [
        'a0000000-0000-4000-8000-000000000001',
        'a0000000-0000-4000-8000-000000000002',
      ]

      const res = await createRequest(app)
        .delete('/api/orders/bulk-cancel')
        .send({ ids })
        .expect(207)

      const body = res.body as BulkCancelResponse
      expect(body.summary.succeeded).toBe(0)
      expect(body.summary.failed).toBe(2)
      expect(body.data.every((item) => item.status === 404)).toBe(true)
    })

    it('response structure contains object, data, and summary fields', async () => {
      const order = await createTestOrder(app)

      const res = await createRequest(app)
        .delete('/api/orders/bulk-cancel')
        .send({ ids: [order.id] })

      const body = res.body as BulkCancelResponse
      expect(body).toHaveProperty('object', 'batch_result')
      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('summary')
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.summary).toHaveProperty('succeeded')
      expect(body.summary).toHaveProperty('failed')
    })

    it('invalid UUID in ids field -> 422 validation error', async () => {
      const res = await createRequest(app)
        .delete('/api/orders/bulk-cancel')
        .send({ ids: ['not-a-uuid'] })
        .expect(422)

      expect(res.body).toHaveProperty('status', 422)
    })
  })

  // ============================================================
  // Full business flow
  // ============================================================

  describe('full order flow: create -> pay -> ship -> job complete', () => {
    it('should traverse the complete state machine: pending_payment -> paid -> shipping -> (job succeeded)', async () => {
      const key = crypto.randomUUID()

      // 1. Idempotent order creation
      const createRes = await createRequest(app)
        .post('/api/orders')
        .set('Idempotency-Key', key)
        .send({
          userId: 'user-flow-test',
          items: [
            { productId: 'prod-001', quantity: 1, unitPrice: '100.00' },
            { productId: 'prod-002', quantity: 2, unitPrice: '50.00' },
          ],
        })
        .expect(201)

      const order = createRes.body as OrderResponse
      expect(order.status).toBe('pending_payment')
      expect(order.totalAmount).toBe('200.00')
      createdOrderIds.push(order.id)

      // 2. Pay (optimistic lock)
      const paid = await payTestOrder(app, order.id)
      expect(paid.status).toBe('paid')
      expect(paid.version).toBe(1)

      // 3. Ship (async)
      const shipRes = await createRequest(app)
        .post(`/api/orders/${order.id}/ship`)
        .expect(202)

      const { jobId } = shipRes.body as { jobId: string }
      expect(shipRes.headers.location).toBe(`/api/jobs/${jobId}`)

      // 4. Verify order status has changed to shipping
      const shippingRes = await createRequest(app).get(`/api/orders/${order.id}`).expect(200)
      const shippingOrder = shippingRes.body as OrderResponse
      expect(shippingOrder.status).toBe('shipping')

      // 5. Wait for Job to complete
      const job = await waitForJob(app, jobId)
      expect(job.status).toBe('succeeded')
      expect(job.result).toHaveProperty('trackingNumber')
    }, 15_000)
  })
})
