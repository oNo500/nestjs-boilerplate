import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/app.module'

import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { SuperTest, Test as SuperTestType } from 'supertest'
import type TestAgent from 'supertest/lib/agent'

/**
 * Article response type
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
 * Create type-safe supertest instance
 */
function createRequest(app: INestApplication): TestAgent<SuperTestType> {
  return request(app.getHttpServer() as never)
}

/**
 * Article E2E Tests
 *
 * Covers:
 * - Complete HTTP request testing
 * - Application startup and shutdown
 * - End-to-end business flow testing
 *
 * Note:
 * - Uses real database
 * - Test data must be cleaned up
 * - Recommend using separate test database
 */
describe('article E2E Tests', () => {
  let app: INestApplication
  let createdArticleId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    // Cleanup: delete test article
    if (createdArticleId) {
      await createRequest(app).delete(`/articles/${createdArticleId}`)
    }

    await app.close()
  })

  describe('/articles (POST) - Create article', () => {
    it('should create draft article successfully', async () => {
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
        title: 'Sho', // Less than 5 characters
        content: 'Valid content with enough characters for testing.',
      }

      const response = await createRequest(app)
        .post('/articles')
        .send(createDto)
        .expect(400)

      // Verify error message returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id (GET) - Get article', () => {
    it('should get created article successfully', async () => {
      const response = await createRequest(app)
        .get(`/articles/${createdArticleId}`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.id).toBe(createdArticleId)
      expect(article.title).toBe('E2E Test Article')
    })

    it('should return 404 when article not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const response = await createRequest(app)
        .get(`/articles/${nonExistentId}`)
        .expect(404)

      // Verify error message returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id/publish (POST) - Publish article', () => {
    it('should publish draft article successfully', async () => {
      const response = await createRequest(app)
        .post(`/articles/${createdArticleId}/publish`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.status).toBe('published')
      expect(article.publishedAt).toBeDefined()
    })

    it('should fail when republishing published article', async () => {
      const response = await createRequest(app)
        .post(`/articles/${createdArticleId}/publish`)
        .expect(400)

      // Verify error message returned
      expect(response.body).toBeDefined()
    })
  })

  describe('/articles/:id/archive (POST) - Archive article', () => {
    it('should archive published article successfully', async () => {
      const response = await createRequest(app)
        .post(`/articles/${createdArticleId}/archive`)
        .expect(200)

      const article = response.body as ArticleResponse
      expect(article.status).toBe('archived')
    })
  })

  describe('/articles (GET) - Get article list', () => {
    it('should return article list', async () => {
      const response = await createRequest(app)
        .get('/articles')
        .expect(200)

      const articles = response.body as ArticleResponse[]
      expect(Array.isArray(articles)).toBe(true)
      expect(articles.length).toBeGreaterThan(0)

      // Verify list contains our created article
      const ourArticle = articles.find(
        (article) => article.id === createdArticleId,
      )
      expect(ourArticle).toBeDefined()
    })
  })

  describe('complete business flow test', () => {
    it('should complete full flow: create -> publish -> archive -> delete', async () => {
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
        .post(`/articles/${articleId}/publish`)
        .expect(200)

      const publishedArticle = publishResponse.body as ArticleResponse
      expect(publishedArticle.status).toBe('published')

      // 3. Archive article
      const archiveResponse = await createRequest(app)
        .post(`/articles/${articleId}/archive`)
        .expect(200)

      const archivedArticle = archiveResponse.body as ArticleResponse
      expect(archivedArticle.status).toBe('archived')

      // 4. Delete article
      await createRequest(app).delete(`/articles/${articleId}`).expect(200)

      // 5. Verify article deleted
      await createRequest(app).get(`/articles/${articleId}`).expect(404)
    })
  })
})
