import { createTestApp } from './helpers/create-app'
import { createRequest } from './helpers/create-request'

import type { INestApplication } from '@nestjs/common'

/**
 * Article response type definition
 */
interface ArticleResponse {
  id: string
  title: string
  content: string
  status: string
  slug: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================================
// Response format E2E tests
//
// Focused on verifying the format produced by the global response processing chain
// (interceptors + filters). Does not verify specific business values, only field
// existence and types.
// ============================================================

describe('response format', () => {
  let app: INestApplication
  let createdArticleId: string

  beforeAll(async () => {
    app = await createTestApp()

    // Create a test article to be reused by subsequent test cases
    const res = await createRequest(app)
      .post('/api/articles')
      .send({
        title: 'Response Format Test Article',
        content: 'Content for response format testing, long enough to pass validation.',
      })
      .expect(201)

    createdArticleId = (res.body as { id: string }).id
  })

  afterAll(async () => {
    if (createdArticleId) {
      await createRequest(app).delete(`/api/articles/${createdArticleId}`)
    }
    await app.close()
  })

  // ---------------------------------------------------------------------------
  // Success response format
  // ---------------------------------------------------------------------------

  describe('success response format', () => {
    it('gET single resource: returns object directly without object/data wrapper', async () => {
      const res = await createRequest(app)
        .get(`/api/articles/${createdArticleId}`)
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
        .post('/api/articles')
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
      await createRequest(app).delete(`/api/articles/${body.id as string}`)
    })

    it('pOST 201 Created: response header contains Location', async () => {
      const res = await createRequest(app)
        .post('/api/articles')
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
      await createRequest(app).delete(`/api/articles/${articleId}`)
    })

    it('all success responses include X-Request-Id header', async () => {
      const res = await createRequest(app)
        .get(`/api/articles/${createdArticleId}`)
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
        .get(`/api/articles/${nonExistentId}`)
        .expect(404)

      const body = res.body as Record<string, unknown>

      expect(body).toHaveProperty('type')
      expect(body).toHaveProperty('title')
      expect(body).toHaveProperty('status', 404)
      expect(body).toHaveProperty('instance')
      expect(body).toHaveProperty('code')
      expect(body).toHaveProperty('detail')
    })

    it('404: code and detail fields are strings', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const res = await createRequest(app)
        .get(`/api/articles/${nonExistentId}`)
        .expect(404)

      const body = res.body as Record<string, unknown>

      expect(typeof body.code).toBe('string')
      expect(typeof body.detail).toBe('string')
    })

    it('422 validation error: errors array contains field-level info (field, pointer, code, message)', async () => {
      const res = await createRequest(app)
        .post('/api/articles')
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

    it('400 business error: code and detail fields are present', async () => {
      // Publish the article first, then publish again to trigger 400 business error
      await createRequest(app)
        .patch(`/api/articles/${createdArticleId}/publish`)

      const res = await createRequest(app)
        .patch(`/api/articles/${createdArticleId}/publish`)
        .expect(400)

      const body = res.body as Record<string, unknown>

      expect(body).toHaveProperty('code')
      expect(body).toHaveProperty('detail')
      expect(typeof body.code).toBe('string')
      expect(typeof body.detail).toBe('string')
    })

    it('error response Content-Type is application/problem+json', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const res = await createRequest(app)
        .get(`/api/articles/${nonExistentId}`)
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
        .get(`/api/articles/${createdArticleId}`)
        .expect(200)

      expect(res.headers['x-request-id']).toBeDefined()
    })

    it('all responses (error) include X-Request-Id', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const res = await createRequest(app)
        .get(`/api/articles/${nonExistentId}`)
        .expect(404)

      expect(res.headers['x-request-id']).toBeDefined()
    })

    it('201 response includes Location header pointing to the newly created resource', async () => {
      const res = await createRequest(app)
        .post('/api/articles')
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
      await createRequest(app).delete(`/api/articles/${body.id}`)
    })

    it('error response Content-Type is application/problem+json', async () => {
      const res = await createRequest(app)
        .post('/api/articles')
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
        .get('/api/articles/all')
        .expect(200)

      const body = res.body as Record<string, unknown>

      expect(body.object).toBe('list')
    })

    it('gET /articles: data is an array', async () => {
      const res = await createRequest(app)
        .get('/api/articles/all')
        .expect(200)

      const body = res.body as Record<string, unknown>

      expect(Array.isArray(body.data)).toBe(true)
    })

    it('gET /articles: non-paginated endpoint does not contain page/total fields', async () => {
      const res = await createRequest(app)
        .get('/api/articles/all')
        .expect(200)

      const body = res.body as Record<string, unknown>

      expect(body).not.toHaveProperty('page')
      expect(body).not.toHaveProperty('total')
      expect(body).not.toHaveProperty('pageSize')
    })
  })
})

// ============================================================
// Article E2E Tests
// ============================================================

describe('article E2E Tests', () => {
  let app: INestApplication
  let createdArticleId: string

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    // Cleanup: delete the article created during tests
    if (createdArticleId) {
      await createRequest(app).delete(`/api/articles/${createdArticleId}`)
    }

    await app.close()
  })

  describe('/articles (POST) - create article', () => {
    it('should successfully create a draft article', async () => {
      const createDto = {
        title: 'E2E Test Article',
        content:
          'This is an E2E test article content with enough characters to pass validation.',
      }

      const response = await createRequest(app)
        .post('/api/articles')
        .send(createDto)
        .expect(201)

      const article = response.body as ArticleResponse
      expect(article).toHaveProperty('id')
      expect(article.title).toBe(createDto.title)
      expect(article.content).toBe(createDto.content)
      expect(article.status).toBe('draft')

      // Save ID for subsequent tests and cleanup
      createdArticleId = article.id
    })

    it('should return 400 when title is too short', async () => {
      const createDto = {
        title: 'Sho', // fewer than 5 characters
        content: 'Valid content with enough characters for testing.',
      }

      const response = await createRequest(app)
        .post('/api/articles')
        .send(createDto)
        .expect(422)

      // Verify error message is returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id (GET) - get article', () => {
    it('should successfully retrieve the created article', async () => {
      const response = await createRequest(app)
        .get(`/api/articles/${createdArticleId}`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.id).toBe(createdArticleId)
      expect(article.title).toBe('E2E Test Article')
    })

    it('should return 404 when article does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const response = await createRequest(app)
        .get(`/api/articles/${nonExistentId}`)
        .expect(404)

      // Verify error message is returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id/publish (PATCH) - publish article', () => {
    it('should successfully publish a draft article', async () => {
      const response = await createRequest(app)
        .patch(`/api/articles/${createdArticleId}/publish`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.status).toBe('published')
      expect(article.publishedAt).toBeDefined()
    })

    it('publishing an already-published article should fail', async () => {
      const response = await createRequest(app)
        .patch(`/api/articles/${createdArticleId}/publish`)
        .expect(400)

      // Verify error message is returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id/archive (PATCH) - archive article', () => {
    it('should successfully archive a published article', async () => {
      const response = await createRequest(app)
        .patch(`/api/articles/${createdArticleId}/archive`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.status).toBe('archived')
    })
  })

  describe('/articles/all (GET) - full list without pagination', () => {
    it('should return the full article list', async () => {
      const response = await createRequest(app)
        .get('/api/articles/all')
        .expect(200)

      const body = response.body as { object: string, data: ArticleResponse[] }
      expect(body.object).toBe('list')
      expect(Array.isArray(body.data)).toBe(true)
    })
  })

  describe('/articles/paginated (GET) - offset-paginated list', () => {
    it('should return a paginated article list', async () => {
      const response = await createRequest(app)
        .get('/api/articles/paginated')
        .expect(200)

      const body = response.body as {
        object: string
        data: ArticleResponse[]
        page: number
        pageSize: number
        total: number
        hasMore: boolean
      }
      expect(body.object).toBe('list')
      expect(Array.isArray(body.data)).toBe(true)
      expect(typeof body.page).toBe('number')
      expect(typeof body.pageSize).toBe('number')
      expect(typeof body.total).toBe('number')
      expect(typeof body.hasMore).toBe('boolean')
    })

    it('supports page and pageSize query parameters', async () => {
      const response = await createRequest(app)
        .get('/api/articles/paginated?page=1&pageSize=2')
        .expect(200)

      const body = response.body as { page: number, pageSize: number }
      expect(body.page).toBe(1)
      expect(body.pageSize).toBe(2)
    })
  })

  describe('/articles/cursor (GET) - cursor-paginated list', () => {
    it('should return a cursor-paginated article list', async () => {
      const response = await createRequest(app)
        .get('/api/articles/cursor')
        .expect(200)

      const body = response.body as {
        object: string
        data: ArticleResponse[]
        nextCursor: string | null
        hasMore: boolean
      }
      expect(body.object).toBe('list')
      expect(Array.isArray(body.data)).toBe(true)
      expect(typeof body.hasMore).toBe('boolean')
      expect(body.nextCursor === null || typeof body.nextCursor === 'string').toBe(true)
    })

    it('paginating with nextCursor should return correct results', async () => {
      // Create a second article to ensure at least 2 exist for cursor pagination
      const extra = await createRequest(app)
        .post('/api/articles')
        .send({ title: 'Cursor Test Extra Article', content: 'Extra content for cursor pagination test.' })
        .expect(201)
      const extraId = (extra.body as { id: string }).id

      // use pageSize=1 to fetch the first page
      const firstResponse = await createRequest(app)
        .get('/api/articles/cursor?pageSize=1')
        .expect(200)

      const firstBody = firstResponse.body as {
        data: ArticleResponse[]
        nextCursor: string | null
        hasMore: boolean
      }

      expect(firstBody.hasMore).toBe(true)
      expect(firstBody.nextCursor).not.toBeNull()

      // Use nextCursor to fetch the second page
      const secondResponse = await createRequest(app)
        .get(`/api/articles/cursor?pageSize=1&cursor=${firstBody.nextCursor!}`)
        .expect(200)

      const secondBody = secondResponse.body as { data: ArticleResponse[] }
      expect(Array.isArray(secondBody.data)).toBe(true)
      // The second page should not contain the article from the first page
      expect(secondBody.data[0]?.id).not.toBe(firstBody.data[0]?.id)

      // Cleanup extra article
      await createRequest(app).delete(`/api/articles/${extraId}`)
    })
  })

  describe('full business flow test', () => {
    it('should complete the full flow: create -> publish -> archive -> delete', async () => {
      // 1. Create article
      const createResponse = await createRequest(app)
        .post('/api/articles')
        .send({
          title: 'Flow Test Article',
          content: 'This is a complete flow test article with enough content.',
        })
        .expect(201)

      const createdArticle = createResponse.body as ArticleResponse
      const articleId = createdArticle.id
      expect(createdArticle.status).toBe('draft')

      // 2. Publish article
      const publishResponse = await createRequest(app)
        .patch(`/api/articles/${articleId}/publish`)
        .expect(200)

      const publishedArticle = publishResponse.body as ArticleResponse
      expect(publishedArticle.status).toBe('published')

      // 3. Archive article
      const archiveResponse = await createRequest(app)
        .patch(`/api/articles/${articleId}/archive`)
        .expect(200)

      const archivedArticle = archiveResponse.body as ArticleResponse
      expect(archivedArticle.status).toBe('archived')

      // 4. Delete article
      await createRequest(app).delete(`/api/articles/${articleId}`).expect(200)

      // 5. Verify article has been deleted
      await createRequest(app).get(`/api/articles/${articleId}`).expect(404)
    })
  })
})
