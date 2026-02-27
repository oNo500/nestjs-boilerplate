import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { createValidationPipe } from '@/app/config/validation.config'
import { AllExceptionsFilter } from '@/app/filters/all-exceptions.filter'
import { ProblemDetailsFilter } from '@/app/filters/problem-details.filter'
import { ThrottlerExceptionFilter } from '@/app/filters/throttler-exception.filter'
import { CorrelationIdInterceptor } from '@/app/interceptors/correlation-id.interceptor'
import { LinkHeaderInterceptor } from '@/app/interceptors/link-header.interceptor'
import { LocationHeaderInterceptor } from '@/app/interceptors/location-header.interceptor'
import { RequestContextInterceptor } from '@/app/interceptors/request-context.interceptor'
import { TraceContextInterceptor } from '@/app/interceptors/trace-context.interceptor'
import { TransformInterceptor } from '@/app/interceptors/transform.interceptor'
import { AppModule } from '@/app.module'

import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { Test as SuperTestType } from 'supertest'
import type TestAgent from 'supertest/lib/agent'

function createRequest(app: INestApplication): TestAgent<SuperTestType> {
  return request(app.getHttpServer() as never)
}

/**
 * Response format E2E tests
 *
 * Focused on verifying the format produced by the global response processing chain
 * (interceptors + filters). Does not verify specific business values, only field
 * existence and types.
 */
describe('response format', () => {
  let app: INestApplication
  let createdArticleId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    // Reproduce the global configuration from main.ts
    app.useGlobalFilters(
      app.get(ThrottlerExceptionFilter),
      app.get(ProblemDetailsFilter),
      app.get(AllExceptionsFilter),
    )

    app.useGlobalInterceptors(
      app.get(RequestContextInterceptor),
      app.get(CorrelationIdInterceptor),
      app.get(TraceContextInterceptor),
      new LocationHeaderInterceptor(),
      new LinkHeaderInterceptor(),
      new TransformInterceptor(app.get(Reflector)),
    )

    app.useGlobalPipes(createValidationPipe())

    await app.init()

    // Create a test article to be reused by subsequent test cases
    const res = await createRequest(app)
      .post('/articles')
      .send({
        title: 'Response Format Test Article',
        content: 'Content for response format testing, long enough to pass validation.',
      })
      .expect(201)

    createdArticleId = (res.body as { id: string }).id
  })

  afterAll(async () => {
    if (createdArticleId) {
      await createRequest(app).delete(`/articles/${createdArticleId}`)
    }
    await app.close()
  })

  // ---------------------------------------------------------------------------
  // Success response format
  // ---------------------------------------------------------------------------

  describe('success response format', () => {
    it('gET single resource: returns object directly without object/data wrapper', async () => {
      const res = await createRequest(app)
        .get(`/articles/${createdArticleId}`)
        .expect(200)

      const body = res.body as Record<string, unknown>

      // Has business fields
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('title')
      expect(body).toHaveProperty('status')

      // No collection envelope fields
      expect(body).not.toHaveProperty('object')
      expect(body).not.toHaveProperty('data')
      expect(body).not.toHaveProperty('hasMore')
    })

    it('pOST 201 Created: response body is a single resource object', async () => {
      const res = await createRequest(app)
        .post('/articles')
        .send({
          title: 'Another Test Article For Format',
          content: 'Content for format test, long enough.',
        })
        .expect(201)

      const body = res.body as Record<string, unknown>

      expect(body).toHaveProperty('id')
      expect(typeof body.id).toBe('string')
      expect(body).not.toHaveProperty('object')

      // Cleanup
      await createRequest(app).delete(`/articles/${body.id as string}`)
    })

    it('pOST 201 Created: response header contains Location', async () => {
      const res = await createRequest(app)
        .post('/articles')
        .send({
          title: 'Location Header Test Article',
          content: 'Content for location header test, long enough.',
        })
        .expect(201)

      const body = res.body as Record<string, unknown>
      const articleId = body.id as string

      expect(res.headers.location).toBeDefined()
      expect(res.headers.location).toContain(articleId)

      // Cleanup
      await createRequest(app).delete(`/articles/${articleId}`)
    })

    it('all success responses include X-Request-Id header', async () => {
      const res = await createRequest(app)
        .get(`/articles/${createdArticleId}`)
        .expect(200)

      expect(res.headers['x-request-id']).toBeDefined()
      expect(typeof res.headers['x-request-id']).toBe('string')
      expect((res.headers['x-request-id']!).length).toBeGreaterThan(0)
    })
  })

  // ---------------------------------------------------------------------------
  // Error response format - RFC 9457
  // ---------------------------------------------------------------------------

  describe('error response format - RFC 9457', () => {
    it('404: contains all required RFC 9457 fields', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const res = await createRequest(app)
        .get(`/articles/${nonExistentId}`)
        .expect(404)

      const body = res.body as Record<string, unknown>

      expect(body).toHaveProperty('type')
      expect(body).toHaveProperty('title')
      expect(body).toHaveProperty('status', 404)
      expect(body).toHaveProperty('instance')
      expect(body).toHaveProperty('errors')
      expect(Array.isArray(body.errors)).toBe(true)
    })

    it('404: each item in errors array contains code and message', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const res = await createRequest(app)
        .get(`/articles/${nonExistentId}`)
        .expect(404)

      const body = res.body as { errors: Record<string, unknown>[] }

      expect(body.errors.length).toBeGreaterThan(0)

      const firstError = body.errors[0]!
      expect(firstError).toHaveProperty('code')
      expect(firstError).toHaveProperty('message')
      expect(typeof firstError.code).toBe('string')
      expect(typeof firstError.message).toBe('string')
    })

    it('422 validation error: errors array contains field-level info (field, pointer, code, message)', async () => {
      const res = await createRequest(app)
        .post('/articles')
        .send({
          title: 'Ab', // fewer than 5 characters, triggers MinLength validation
          content: 'Valid content',
        })
        .expect(422)

      const body = res.body as { errors: Record<string, unknown>[] }

      expect(Array.isArray(body.errors)).toBe(true)
      expect(body.errors.length).toBeGreaterThan(0)

      const fieldError = body.errors[0]!
      expect(fieldError).toHaveProperty('field')
      expect(fieldError).toHaveProperty('pointer')
      expect(fieldError).toHaveProperty('code')
      expect(fieldError).toHaveProperty('message')

      // pointer should be in JSON Pointer format (starts with /)
      expect(typeof fieldError.pointer).toBe('string')
      expect((fieldError.pointer as string).startsWith('/')).toBe(true)
    })

    it('400 business error: errors array contains code and message', async () => {
      // Publish the article first, then publish again to trigger 400 business error
      await createRequest(app)
        .patch(`/articles/${createdArticleId}/publish`)

      const res = await createRequest(app)
        .patch(`/articles/${createdArticleId}/publish`)
        .expect(400)

      const body = res.body as { errors: Record<string, unknown>[] }

      expect(Array.isArray(body.errors)).toBe(true)
      expect(body.errors.length).toBeGreaterThan(0)

      const error = body.errors[0]
      expect(error).toHaveProperty('code')
      expect(error).toHaveProperty('message')
    })

    it('error response Content-Type is application/problem+json', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const res = await createRequest(app)
        .get(`/articles/${nonExistentId}`)
        .expect(404)

      expect(res.headers['content-type']).toContain('application/problem+json')
    })
  })

  // ---------------------------------------------------------------------------
  // Response headers
  // ---------------------------------------------------------------------------

  describe('response headers', () => {
    it('all responses (success) include X-Request-Id', async () => {
      const res = await createRequest(app)
        .get(`/articles/${createdArticleId}`)
        .expect(200)

      expect(res.headers['x-request-id']).toBeDefined()
    })

    it('all responses (error) include X-Request-Id', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const res = await createRequest(app)
        .get(`/articles/${nonExistentId}`)
        .expect(404)

      expect(res.headers['x-request-id']).toBeDefined()
    })

    it('201 response includes Location header pointing to the newly created resource', async () => {
      const res = await createRequest(app)
        .post('/articles')
        .send({
          title: 'Location Path Verify Test',
          content: 'Content for location path verification test.',
        })
        .expect(201)

      const body = res.body as { id: string }
      const location = res.headers.location!

      expect(location).toBeDefined()
      // Location should contain the resource ID
      expect(location).toContain(body.id)
      // Location should contain the request path
      expect(location).toContain('/articles/')

      // Cleanup
      await createRequest(app).delete(`/articles/${body.id}`)
    })

    it('error response Content-Type is application/problem+json', async () => {
      const res = await createRequest(app)
        .post('/articles')
        .send({ title: 'Ab', content: 'x' })
        .expect(422)

      expect(res.headers['content-type']).toContain('application/problem+json')
    })
  })

  // ---------------------------------------------------------------------------
  // Collection response format
  // ---------------------------------------------------------------------------

  describe('collection response format', () => {
    it('gET /articles: object field is "list"', async () => {
      const res = await createRequest(app)
        .get('/articles/all')
        .expect(200)

      const body = res.body as Record<string, unknown>

      expect(body.object).toBe('list')
    })

    it('gET /articles: data is an array', async () => {
      const res = await createRequest(app)
        .get('/articles/all')
        .expect(200)

      const body = res.body as Record<string, unknown>

      expect(Array.isArray(body.data)).toBe(true)
    })

    it('gET /articles: non-paginated endpoint does not contain page/total fields', async () => {
      const res = await createRequest(app)
        .get('/articles/all')
        .expect(200)

      const body = res.body as Record<string, unknown>

      expect(body).not.toHaveProperty('page')
      expect(body).not.toHaveProperty('total')
      expect(body).not.toHaveProperty('pageSize')
    })
  })
})
