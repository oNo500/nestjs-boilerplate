import { Test } from '@nestjs/testing'
import request from 'supertest'

import { createValidationPipe } from '@/app/config/validation.config'
import { AppModule } from '@/app.module'

import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { SuperTest, Test as SuperTestType } from 'supertest'
import type TestAgent from 'supertest/lib/agent'

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

/**
 * Create a type-safe supertest instance
 */
function createRequest(app: INestApplication): TestAgent<SuperTestType> {
  return request(app.getHttpServer() as never)
}

/**
 * Article E2E Tests
 *
 * Demonstrates:
 * - Full HTTP request testing
 * - Application startup and shutdown
 * - End-to-end business flow testing
 *
 * Notes:
 * - E2E tests use a real database
 * - Test data must be cleaned up after tests
 * - Using a dedicated test database is recommended
 */
describe('article E2E Tests', () => {
  let app: INestApplication
  let createdArticleId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(createValidationPipe())
    await app.init()
  })

  afterAll(async () => {
    // Cleanup: delete the article created during tests
    if (createdArticleId) {
      await createRequest(app).delete(`/articles/${createdArticleId}`)
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
        .post('/articles')
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
        .post('/articles')
        .send(createDto)
        .expect(422)

      // Verify error message is returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id (GET) - get article', () => {
    it('should successfully retrieve the created article', async () => {
      const response = await createRequest(app)
        .get(`/articles/${createdArticleId}`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.id).toBe(createdArticleId)
      expect(article.title).toBe('E2E Test Article')
    })

    it('should return 404 when article does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const response = await createRequest(app)
        .get(`/articles/${nonExistentId}`)
        .expect(404)

      // Verify error message is returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id/publish (PATCH) - publish article', () => {
    it('should successfully publish a draft article', async () => {
      const response = await createRequest(app)
        .patch(`/articles/${createdArticleId}/publish`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.status).toBe('published')
      expect(article.publishedAt).toBeDefined()
    })

    it('publishing an already-published article should fail', async () => {
      const response = await createRequest(app)
        .patch(`/articles/${createdArticleId}/publish`)
        .expect(400)

      // Verify error message is returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id/archive (PATCH) - archive article', () => {
    it('should successfully archive a published article', async () => {
      const response = await createRequest(app)
        .patch(`/articles/${createdArticleId}/archive`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.status).toBe('archived')
    })
  })

  describe('/articles/all (GET) - full list without pagination', () => {
    it('should return the full article list', async () => {
      const response = await createRequest(app)
        .get('/articles/all')
        .expect(200)

      const body = response.body as { object: string, data: ArticleResponse[] }
      expect(body.object).toBe('list')
      expect(Array.isArray(body.data)).toBe(true)
    })
  })

  describe('/articles/paginated (GET) - offset-paginated list', () => {
    it('should return a paginated article list', async () => {
      const response = await createRequest(app)
        .get('/articles/paginated')
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
        .get('/articles/paginated?page=1&pageSize=2')
        .expect(200)

      const body = response.body as { page: number, pageSize: number }
      expect(body.page).toBe(1)
      expect(body.pageSize).toBe(2)
    })
  })

  describe('/articles/cursor (GET) - cursor-paginated list', () => {
    it('should return a cursor-paginated article list', async () => {
      const response = await createRequest(app)
        .get('/articles/cursor')
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
      // A previous test already created an article; use pageSize=1 to fetch the first page
      const firstResponse = await createRequest(app)
        .get('/articles/cursor?pageSize=1')
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
        .get(`/articles/cursor?pageSize=1&cursor=${firstBody.nextCursor!}`)
        .expect(200)

      const secondBody = secondResponse.body as { data: ArticleResponse[] }
      expect(Array.isArray(secondBody.data)).toBe(true)
      // The second page should not contain the article from the first page
      expect(secondBody.data[0]?.id).not.toBe(firstBody.data[0]?.id)
    })
  })

  describe('full business flow test', () => {
    it('should complete the full flow: create -> publish -> archive -> delete', async () => {
      // 1. Create article
      const createResponse = await createRequest(app)
        .post('/articles')
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
        .patch(`/articles/${articleId}/publish`)
        .expect(200)

      const publishedArticle = publishResponse.body as ArticleResponse
      expect(publishedArticle.status).toBe('published')

      // 3. Archive article
      const archiveResponse = await createRequest(app)
        .patch(`/articles/${articleId}/archive`)
        .expect(200)

      const archivedArticle = archiveResponse.body as ArticleResponse
      expect(archivedArticle.status).toBe('archived')

      // 4. Delete article
      await createRequest(app).delete(`/articles/${articleId}`).expect(200)

      // 5. Verify article has been deleted
      await createRequest(app).get(`/articles/${articleId}`).expect(404)
    })
  })
})
