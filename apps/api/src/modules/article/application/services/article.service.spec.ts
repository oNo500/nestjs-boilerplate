import { createMock } from '@golevelup/ts-vitest'
import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { vi } from 'vitest'

import { ARTICLE_REPOSITORY } from '@/modules/article/application/ports/article.repository.port'
import { SLUG_GENERATOR } from '@/modules/article/application/ports/slug-generator.port'
import { ArticleService } from '@/modules/article/application/services/article.service'
import { Article } from '@/modules/article/domain/aggregates/article.aggregate'
import { ArticleStatus } from '@/modules/article/domain/enums/article-status.enum'
import { Content } from '@/modules/article/domain/value-objects/content.vo'
import { Slug } from '@/modules/article/domain/value-objects/slug.vo'
import { Title } from '@/modules/article/domain/value-objects/title.vo'
import { DomainEventPublisher } from '@/shared-kernel/infrastructure/events/domain-event-publisher'

import type { ArticleRepository } from '@/modules/article/application/ports/article.repository.port'
import type { SlugGenerator } from '@/modules/article/application/ports/slug-generator.port'
import type { TestingModule } from '@nestjs/testing'
import type { Mocked } from 'vitest'

/**
 * ArticleService unit tests
 *
 * Demonstrates:
 * - Simplified mock creation using @golevelup/ts-vitest createMock
 * - Testing business logic without a real database
 * - Verifying domain event publication
 */
describe('articleService', () => {
  let service: ArticleService
  let articleRepository: Mocked<ArticleRepository>
  let slugGenerator: Mocked<SlugGenerator>
  let domainEventPublisher: Mocked<DomainEventPublisher>

  beforeEach(async () => {
    // Create the test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ARTICLE_REPOSITORY,
          useValue: createMock<ArticleRepository>(),
        },
        {
          provide: SLUG_GENERATOR,
          useValue: createMock<SlugGenerator>(),
        },
        {
          provide: DomainEventPublisher,
          useValue: createMock<DomainEventPublisher>(),
        },
      ],
    }).compile()

    service = module.get<ArticleService>(ArticleService)
    articleRepository = module.get(ARTICLE_REPOSITORY)
    slugGenerator = module.get(SLUG_GENERATOR)
    domainEventPublisher = module.get(DomainEventPublisher)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should successfully create a draft article', async () => {
      // Arrange
      const title = 'Test Article'
      const content = 'This is a test article content with enough characters to be valid.'
      const slug = Slug.create('test-article')

      slugGenerator.generate.mockReturnValue(slug)
      slugGenerator.generateUnique.mockResolvedValue(slug)
      articleRepository.existsBySlug.mockResolvedValue(false)
      articleRepository.save.mockResolvedValue()

      // Act
      const result = await service.create(title, content)

      // Assert
      expect(result).toBeInstanceOf(Article)
      expect(result.title.value).toBe(title)
      expect(result.content.value).toBe(content)
      expect(result.status).toBe(ArticleStatus.DRAFT)
      expect(articleRepository.save).toHaveBeenCalledWith(result)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(result)
    })

    it('should generate a unique slug', async () => {
      // Arrange
      const title = 'Test Article'
      const content = 'This is a test article content with enough characters.'
      const baseSlug = Slug.create('test-article')
      const uniqueSlug = Slug.create('test-article-1')

      slugGenerator.generate.mockReturnValue(baseSlug)
      slugGenerator.generateUnique.mockResolvedValue(uniqueSlug)
      articleRepository.save.mockResolvedValue()

      // Act
      const result = await service.create(title, content)

      // Assert
      expect(slugGenerator.generateUnique).toHaveBeenCalledWith(
        baseSlug.value,
        expect.any(Function),
      )
      expect(result.slug).toBe(uniqueSlug)
    })
  })

  describe('publish', () => {
    it('should successfully publish a draft article', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Article'),
        Content.create('This is a test content with enough characters to be publishable.'),
        Slug.create('test-article'),
      )
      article.clearDomainEvents() // Clear events emitted during creation

      articleRepository.findById.mockResolvedValue(article)
      articleRepository.save.mockResolvedValue()

      // Act
      const result = await service.publish('test-id')

      // Assert
      expect(result.status).toBe(ArticleStatus.PUBLISHED)
      expect(result.publishedAt).toBeInstanceOf(Date)
      expect(articleRepository.save).toHaveBeenCalledWith(article)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(article)
    })

    it('should throw NotFoundException when article does not exist', async () => {
      // Arrange
      articleRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(service.publish('non-existent-id')).rejects.toThrow(NotFoundException)
      expect(articleRepository.save).not.toHaveBeenCalled()
    })

    it('should throw an error when content is insufficient', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Title'),
        Content.create('Short'), // Content is less than 50 characters
        Slug.create('test-title'),
      )

      articleRepository.findById.mockResolvedValue(article)

      // Act & Assert
      await expect(service.publish('test-id')).rejects.toThrow('Article content is less than 50 characters and cannot be published')
      expect(articleRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('archive', () => {
    it('should successfully archive a published article', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Article'),
        Content.create('This is a test content with enough characters to be publishable.'),
        Slug.create('test-article'),
      )
      article.publish()
      article.clearDomainEvents()

      articleRepository.findById.mockResolvedValue(article)
      articleRepository.save.mockResolvedValue()

      // Act
      const result = await service.archive('test-id')

      // Assert
      expect(result.status).toBe(ArticleStatus.ARCHIVED)
      expect(articleRepository.save).toHaveBeenCalledWith(article)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(article)
    })

    it('should not allow archiving a draft article', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Title'),
        Content.create('This is a test content.'),
        Slug.create('test-title'),
      )

      articleRepository.findById.mockResolvedValue(article)

      // Act & Assert
      await expect(service.archive('test-id')).rejects.toThrow('Only published articles can be archived')
    })
  })

  describe('update', () => {
    it('should successfully update a draft article', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Old Title'),
        Content.create('Old content that is long enough to be valid.'),
        Slug.create('old-title'),
      )
      article.clearDomainEvents()

      const newTitle = 'New Title'
      const newContent = 'New content that is also long enough to be valid.'

      articleRepository.findById.mockResolvedValue(article)
      articleRepository.save.mockResolvedValue()

      // Act
      const result = await service.update('test-id', newTitle, newContent)

      // Assert
      expect(result.title.value).toBe(newTitle)
      expect(result.content.value).toBe(newContent)
      expect(articleRepository.save).toHaveBeenCalledWith(article)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(article)
    })

    it('should not allow editing a published article', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Title'),
        Content.create('This is a test content with enough characters to be publishable.'),
        Slug.create('test-title'),
      )
      article.publish()

      articleRepository.findById.mockResolvedValue(article)

      // Act & Assert
      await expect(service.update('test-id', 'New Title', 'New Content')).rejects.toThrow(
        'Only draft articles can be edited',
      )
    })
  })

  describe('addTag', () => {
    it('should successfully add a tag', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Title'),
        Content.create('Test content'),
        Slug.create('test-title'),
      )

      articleRepository.findById.mockResolvedValue(article)
      articleRepository.save.mockResolvedValue()

      // Act
      const result = await service.addTag('test-id', 'typescript')

      // Assert
      expect(result.tags.value).toContain('typescript')
      expect(articleRepository.save).toHaveBeenCalledWith(article)
    })
  })

  describe('removeTag', () => {
    it('should successfully remove a tag', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Title'),
        Content.create('Test content'),
        Slug.create('test-title'),
      )
      article.addTag('typescript')
      article.addTag('nestjs')

      articleRepository.findById.mockResolvedValue(article)
      articleRepository.save.mockResolvedValue()

      // Act
      const result = await service.removeTag('test-id', 'typescript')

      // Assert
      expect(result.tags.value).not.toContain('typescript')
      expect(result.tags.value).toContain('nestjs')
      expect(articleRepository.save).toHaveBeenCalledWith(article)
    })
  })

  describe('query methods', () => {
    it('findById should return the article', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Title'),
        Content.create('Test content'),
        Slug.create('test-title'),
      )
      articleRepository.findById.mockResolvedValue(article)

      // Act
      const result = await service.findById('test-id')

      // Assert
      expect(result).toBe(article)
      expect(articleRepository.findById).toHaveBeenCalledWith('test-id')
    })

    it('findBySlug should return the article', async () => {
      // Arrange
      const article = Article.create(
        'test-id',
        Title.create('Test Title'),
        Content.create('Test content'),
        Slug.create('test-article'),
      )
      articleRepository.findBySlug.mockResolvedValue(article)

      // Act
      const result = await service.findBySlug('test-article')

      // Assert
      expect(result).toBe(article)
      expect(articleRepository.findBySlug).toHaveBeenCalledWith('test-article')
    })

    it('findAll should return all articles', async () => {
      // Arrange
      const articles = [
        Article.create(
          'id-1',
          Title.create('Article 1'),
          Content.create('Content 1'),
          Slug.create('article-1'),
        ),
        Article.create(
          'id-2',
          Title.create('Article 2'),
          Content.create('Content 2'),
          Slug.create('article-2'),
        ),
      ]
      articleRepository.findAll.mockResolvedValue(articles)

      // Act
      const result = await service.findAll()

      // Assert
      expect(result).toEqual(articles)
      expect(result).toHaveLength(2)
    })
  })

  describe('delete', () => {
    it('should successfully delete an article', async () => {
      // Arrange
      articleRepository.delete.mockResolvedValue(true)

      // Act
      const result = await service.delete('test-id')

      // Assert
      expect(result).toBe(true)
      expect(articleRepository.delete).toHaveBeenCalledWith('test-id')
    })
  })
})
