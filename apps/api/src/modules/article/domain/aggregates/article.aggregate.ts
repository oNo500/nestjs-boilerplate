import { ArticleStatus } from '@/modules/article/domain/enums/article-status.enum'
import { ArticleArchivedEvent } from '@/modules/article/domain/events/article-archived.event'
import { ArticleCreatedEvent } from '@/modules/article/domain/events/article-created.event'
import { ArticlePublishedEvent } from '@/modules/article/domain/events/article-published.event'
import { ArticleUpdatedEvent } from '@/modules/article/domain/events/article-updated.event'
import { Tags } from '@/modules/article/domain/value-objects/tags.vo'
import { BaseAggregateRoot } from '@/shared-kernel/domain/base-aggregate-root'

import type { Content } from '@/modules/article/domain/value-objects/content.vo'
import type { Slug } from '@/modules/article/domain/value-objects/slug.vo'
import type { Title } from '@/modules/article/domain/value-objects/title.vo'

export type ArticleCategory = 'tech' | 'design' | 'product' | 'other'

export class Article extends BaseAggregateRoot {
  readonly #id: string
  #title: Title
  #content: Content
  readonly #slug: Slug
  #status: ArticleStatus
  #tags: Tags
  #category: ArticleCategory
  #author: string
  #viewCount: number
  #isPinned: boolean
  readonly #createdAt: Date
  #updatedAt: Date
  #publishedAt: Date | null

  private constructor(
    id: string,
    title: Title,
    content: Content,
    slug: Slug,
    status: ArticleStatus,
    tags: Tags,
    category: ArticleCategory,
    author: string,
    viewCount: number,
    isPinned: boolean,
    createdAt: Date,
    updatedAt: Date,
    publishedAt: Date | null,
  ) {
    super()
    this.#id = id
    this.#title = title
    this.#content = content
    this.#slug = slug
    this.#status = status
    this.#tags = tags
    this.#category = category
    this.#author = author
    this.#viewCount = viewCount
    this.#isPinned = isPinned
    this.#createdAt = createdAt
    this.#updatedAt = updatedAt
    this.#publishedAt = publishedAt
  }

  /** Initial status is DRAFT, viewCount=0 */
  static create(
    id: string,
    title: Title,
    content: Content,
    slug: Slug,
    category: ArticleCategory = 'other',
    author = '',
    isPinned = false,
  ): Article {
    const now = new Date()

    const article = new Article(
      id,
      title,
      content,
      slug,
      ArticleStatus.DRAFT,
      Tags.empty(),
      category,
      author,
      0,
      isPinned,
      now,
      now,
      null,
    )

    article.addDomainEvent(
      new ArticleCreatedEvent(id, title.value),
    )

    return article
  }

  static reconstitute(
    id: string,
    title: Title,
    content: Content,
    slug: Slug,
    status: ArticleStatus,
    tags: Tags,
    category: ArticleCategory,
    author: string,
    viewCount: number,
    isPinned: boolean,
    createdAt: Date,
    updatedAt: Date,
    publishedAt: Date | null,
  ): Article {
    return new Article(
      id,
      title,
      content,
      slug,
      status,
      tags,
      category,
      author,
      viewCount,
      isPinned,
      createdAt,
      updatedAt,
      publishedAt,
    )
  }

  // ========== Getters ==========

  get id(): string {
    return this.#id
  }

  get title(): Title {
    return this.#title
  }

  get content(): Content {
    return this.#content
  }

  get slug(): Slug {
    return this.#slug
  }

  get status(): ArticleStatus {
    return this.#status
  }

  get tags(): Tags {
    return this.#tags
  }

  get category(): ArticleCategory {
    return this.#category
  }

  get author(): string {
    return this.#author
  }

  get viewCount(): number {
    return this.#viewCount
  }

  get isPinned(): boolean {
    return this.#isPinned
  }

  get createdAt(): Date {
    return this.#createdAt
  }

  get updatedAt(): Date {
    return this.#updatedAt
  }

  get publishedAt(): Date | null {
    return this.#publishedAt
  }

  // ========== Business methods ==========

  /** Only DRAFT articles can be published; content must be >= 50 characters */
  publish(): void {
    if (this.#status !== ArticleStatus.DRAFT) {
      throw new Error('Only draft articles can be published')
    }

    if (!this.#content.isPublishable()) {
      throw new Error('Article content is less than 50 characters and cannot be published')
    }

    this.#status = ArticleStatus.PUBLISHED
    this.#publishedAt = new Date()
    this.#updatedAt = new Date()

    this.addDomainEvent(
      new ArticlePublishedEvent(
        this.#id,
        this.#title.value,
        this.#slug.value,
      ),
    )
  }

  /** Only PUBLISHED articles can be archived */
  archive(): void {
    if (this.#status !== ArticleStatus.PUBLISHED) {
      throw new Error('Only published articles can be archived')
    }

    this.#status = ArticleStatus.ARCHIVED
    this.#updatedAt = new Date()

    this.addDomainEvent(
      new ArticleArchivedEvent(this.#id),
    )
  }

  /** Only DRAFT articles can be edited */
  update(title: Title, content: Content): void {
    if (this.#status !== ArticleStatus.DRAFT) {
      throw new Error('Only draft articles can be edited')
    }

    this.#title = title
    this.#content = content
    this.#updatedAt = new Date()

    this.addDomainEvent(
      new ArticleUpdatedEvent(this.#id),
    )
  }

  addTag(tag: string): void {
    this.#tags = this.#tags.add(tag)
    this.#updatedAt = new Date()
  }

  removeTag(tag: string): void {
    this.#tags = this.#tags.remove(tag)
    this.#updatedAt = new Date()
  }

  updateMeta(category: ArticleCategory, author: string): void {
    this.#category = category
    this.#author = author
    this.#updatedAt = new Date()
  }

  pin(): void {
    this.#isPinned = true
    this.#updatedAt = new Date()
  }

  unpin(): void {
    this.#isPinned = false
    this.#updatedAt = new Date()
  }

  canEdit(): boolean {
    return this.#status === ArticleStatus.DRAFT
  }

  isPublished(): boolean {
    return this.#status === ArticleStatus.PUBLISHED
  }

  isArchived(): boolean {
    return this.#status === ArticleStatus.ARCHIVED
  }
}
