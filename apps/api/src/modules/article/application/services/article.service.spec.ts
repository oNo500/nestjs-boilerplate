import { createMock } from '@golevelup/ts-vitest'
import { NotFoundException } from '@nestjs/common'
import { vi } from 'vitest'

import { ArticleFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { ArticleService } from '@/modules/article/application/services/article.service'
import { ArticleStatus } from '@/modules/article/domain/enums/article-status.enum'
import { Slug } from '@/modules/article/domain/value-objects/slug.vo'

import type { DomainEventPublisher } from '@/app/events/domain-event-publisher'
import type { ArticleRepository } from '@/modules/article/application/ports/article.repository.port'
import type { SlugGenerator } from '@/modules/article/application/ports/slug-generator.port'
import type { Mocked } from 'vitest'

describe('articleService', () => {
  let service: ArticleService
  let articleRepository: Mocked<ArticleRepository>
  let slugGenerator: Mocked<SlugGenerator>
  let domainEventPublisher: Mocked<DomainEventPublisher>

  beforeEach(() => {
    articleRepository = createMock<ArticleRepository>()
    slugGenerator = createMock<SlugGenerator>()
    domainEventPublisher = createMock<DomainEventPublisher>()
    service = new ArticleService(articleRepository, slugGenerator, domainEventPublisher)

    articleRepository.save.mockResolvedValue()
    domainEventPublisher.publishEventsForAggregate.mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('success → creates draft, saves, publishes events', async () => {
      const slug = Slug.create('test-article')
      slugGenerator.generate.mockReturnValue(slug)
      slugGenerator.generateUnique.mockResolvedValue(slug)

      const result = await service.create('Test Article', 'This is a test article content with enough characters to be valid.')

      expect(result.status).toBe(ArticleStatus.DRAFT)
      expect(articleRepository.save).toHaveBeenCalledWith(result)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(result)
    })

    it('slug collision → generates unique slug', async () => {
      const baseSlug = Slug.create('test-article')
      const uniqueSlug = Slug.create('test-article-1')
      slugGenerator.generate.mockReturnValue(baseSlug)
      slugGenerator.generateUnique.mockResolvedValue(uniqueSlug)

      const result = await service.create('Test Article', 'Content long enough to be valid.')

      expect(slugGenerator.generateUnique).toHaveBeenCalledWith(baseSlug.value, expect.any(Function))
      expect(result.slug).toBe(uniqueSlug)
    })
  })

  describe('publish', () => {
    it('not found → NotFoundException', async () => {
      articleRepository.findById.mockResolvedValue(null)

      await expect(service.publish('non-existent-id')).rejects.toThrow(NotFoundException)
      expect(articleRepository.save).not.toHaveBeenCalled()
    })

    it('content too short → throws domain error', async () => {
      const article = ArticleFixtures.draft({ content: 'Short' })
      articleRepository.findById.mockResolvedValue(article)

      await expect(service.publish(article.id)).rejects.toThrow('Article content is less than 50 characters and cannot be published')
      expect(articleRepository.save).not.toHaveBeenCalled()
    })

    it('success → status becomes PUBLISHED, saves, publishes events', async () => {
      const article = ArticleFixtures.draft()
      articleRepository.findById.mockResolvedValue(article)

      const result = await service.publish(article.id)

      expect(result.status).toBe(ArticleStatus.PUBLISHED)
      expect(result.publishedAt).toBeInstanceOf(Date)
      expect(articleRepository.save).toHaveBeenCalledWith(article)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(article)
    })
  })

  describe('archive', () => {
    it('draft article → throws domain error', async () => {
      const article = ArticleFixtures.draft()
      articleRepository.findById.mockResolvedValue(article)

      await expect(service.archive(article.id)).rejects.toThrow('Only published articles can be archived')
    })

    it('success → status becomes ARCHIVED, saves, publishes events', async () => {
      const article = ArticleFixtures.published()
      articleRepository.findById.mockResolvedValue(article)

      const result = await service.archive(article.id)

      expect(result.status).toBe(ArticleStatus.ARCHIVED)
      expect(articleRepository.save).toHaveBeenCalledWith(article)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(article)
    })
  })

  describe('update', () => {
    it('published article → throws domain error', async () => {
      const article = ArticleFixtures.published()
      articleRepository.findById.mockResolvedValue(article)

      await expect(service.update(article.id, 'New Title', 'New Content')).rejects.toThrow('Only draft articles can be edited')
    })

    it('success → updates title and content, saves, publishes events', async () => {
      const article = ArticleFixtures.draft()
      articleRepository.findById.mockResolvedValue(article)

      const result = await service.update(article.id, 'New Title', 'New content that is also long enough to be valid.')

      expect(result.title.value).toBe('New Title')
      expect(articleRepository.save).toHaveBeenCalledWith(article)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(article)
    })
  })

  describe('addTag / removeTag', () => {
    it('addTag → tag appears in article', async () => {
      const article = ArticleFixtures.draft()
      articleRepository.findById.mockResolvedValue(article)

      const result = await service.addTag(article.id, 'typescript')

      expect(result.tags.value).toContain('typescript')
      expect(articleRepository.save).toHaveBeenCalledWith(article)
    })

    it('removeTag → tag removed, others remain', async () => {
      const article = ArticleFixtures.draft()
      article.addTag('typescript')
      article.addTag('nestjs')
      articleRepository.findById.mockResolvedValue(article)

      const result = await service.removeTag(article.id, 'typescript')

      expect(result.tags.value).not.toContain('typescript')
      expect(result.tags.value).toContain('nestjs')
    })
  })

  describe('findById / findBySlug / findAll', () => {
    it('findById → returns article', async () => {
      const article = ArticleFixtures.draft()
      articleRepository.findById.mockResolvedValue(article)

      expect(await service.findById(article.id)).toBe(article)
    })

    it('findBySlug → returns article', async () => {
      const article = ArticleFixtures.draft()
      articleRepository.findBySlug.mockResolvedValue(article)

      expect(await service.findBySlug('test-article')).toBe(article)
    })

    it('findAll → returns all articles', async () => {
      const articles = [ArticleFixtures.draft({ id: 'id-1' }), ArticleFixtures.draft({ id: 'id-2' })]
      articleRepository.findAll.mockResolvedValue(articles)

      expect(await service.findAll()).toHaveLength(2)
    })
  })

  describe('delete', () => {
    it('success → returns true', async () => {
      articleRepository.delete.mockResolvedValue(true)

      expect(await service.delete('test-id')).toBe(true)
      expect(articleRepository.delete).toHaveBeenCalledWith('test-id')
    })
  })
})
