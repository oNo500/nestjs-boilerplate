import { randomUUID } from 'node:crypto'

import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { ARTICLE_REPOSITORY } from '@/modules/article/application/ports/article.repository.port'
import { SLUG_GENERATOR } from '@/modules/article/application/ports/slug-generator.port'
import { Article } from '@/modules/article/domain/aggregates/article.aggregate'
import { Content } from '@/modules/article/domain/value-objects/content.vo'
import { Title } from '@/modules/article/domain/value-objects/title.vo'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'
import { DomainEventPublisher } from '@/shared-kernel/infrastructure/events/domain-event-publisher'

import type { ArticleCursorResult, ArticleRepository } from '@/modules/article/application/ports/article.repository.port'
import type { SlugGenerator } from '@/modules/article/application/ports/slug-generator.port'
import type { ArticleCategory } from '@/modules/article/domain/aggregates/article.aggregate'

/**
 * Thin coordinator: contains no business logic; all business logic resides in the aggregate root.
 */
@Injectable()
export class ArticleService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepository: ArticleRepository,
    @Inject(SLUG_GENERATOR)
    private readonly slugGenerator: SlugGenerator,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {}

  async create(
    title: string,
    content: string,
    category?: ArticleCategory,
    author?: string,
    isPinned?: boolean,
  ): Promise<Article> {
    const titleVo = Title.create(title)
    const contentVo = Content.create(content)

    const baseSlug = this.slugGenerator.generate(title)
    const slug = await this.slugGenerator.generateUnique(
      baseSlug.value,
      async (slugValue) => await this.articleRepository.existsBySlug(slugValue),
    )

    const article = Article.create(
      randomUUID(),
      titleVo,
      contentVo,
      slug,
      category,
      author,
      isPinned,
    )

    await this.articleRepository.save(article)
    await this.domainEventPublisher.publishEventsForAggregate(article)

    return article
  }

  async publish(id: string): Promise<Article> {
    const article = await this.articleRepository.findById(id)
    if (!article) {
      throw new NotFoundException({ code: ErrorCode.ARTICLE_NOT_FOUND, message: `Article ${id} not found` })
    }

    article.publish()

    await this.articleRepository.save(article)
    await this.domainEventPublisher.publishEventsForAggregate(article)

    return article
  }

  async archive(id: string): Promise<Article> {
    const article = await this.articleRepository.findById(id)
    if (!article) {
      throw new NotFoundException({ code: ErrorCode.ARTICLE_NOT_FOUND, message: `Article ${id} not found` })
    }

    article.archive()

    await this.articleRepository.save(article)
    await this.domainEventPublisher.publishEventsForAggregate(article)

    return article
  }

  /**
   * Only drafts allow editing title/content; other fields have no status restriction.
   */
  async update(
    id: string,
    title?: string,
    content?: string,
    category?: ArticleCategory,
    author?: string,
    isPinned?: boolean,
  ): Promise<Article> {
    const article = await this.articleRepository.findById(id)
    if (!article) {
      throw new NotFoundException({ code: ErrorCode.ARTICLE_NOT_FOUND, message: `Article ${id} not found` })
    }

    if (title !== undefined || content !== undefined) {
      const titleVo = Title.create(title ?? article.title.value)
      const contentVo = Content.create(content ?? article.content.value)
      article.update(titleVo, contentVo)
    }

    if (category !== undefined || author !== undefined) {
      article.updateMeta(
        category ?? article.category,
        author ?? article.author,
      )
    }
    if (isPinned !== undefined) {
      if (isPinned) {
        article.pin()
      } else {
        article.unpin()
      }
    }

    await this.articleRepository.save(article)
    await this.domainEventPublisher.publishEventsForAggregate(article)

    return article
  }

  async addTag(id: string, tag: string): Promise<Article> {
    const article = await this.articleRepository.findById(id)
    if (!article) {
      throw new NotFoundException({ code: ErrorCode.ARTICLE_NOT_FOUND, message: `Article ${id} not found` })
    }

    article.addTag(tag)

    await this.articleRepository.save(article)

    return article
  }

  async removeTag(id: string, tag: string): Promise<Article> {
    const article = await this.articleRepository.findById(id)
    if (!article) {
      throw new NotFoundException({ code: ErrorCode.ARTICLE_NOT_FOUND, message: `Article ${id} not found` })
    }

    article.removeTag(tag)

    await this.articleRepository.save(article)

    return article
  }

  async delete(id: string): Promise<boolean> {
    return await this.articleRepository.delete(id)
  }

  async findById(id: string): Promise<Article | null> {
    return await this.articleRepository.findById(id)
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return await this.articleRepository.findBySlug(slug)
  }

  async findAll(): Promise<Article[]> {
    return await this.articleRepository.findAll()
  }

  async findPaginated(page: number, pageSize: number, q?: string) {
    return await this.articleRepository.findPaginated({ page, pageSize, q })
  }

  async findCursor(pageSize: number, cursor?: string): Promise<ArticleCursorResult> {
    return await this.articleRepository.findCursor({ pageSize, cursor })
  }
}
