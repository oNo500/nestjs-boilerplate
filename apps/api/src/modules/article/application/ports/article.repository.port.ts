import type { Article } from '@/modules/article/domain/aggregates/article.aggregate'

/**
 * Article list query parameters
 */
export interface ArticleListQuery {
  page: number
  pageSize: number
  q?: string
}

/**
 * Article list query result
 */
export interface ArticleListResult {
  data: Article[]
  total: number
}

/**
 * Cursor pagination query parameters
 * cursor is Base64({ createdAt: string, id: string })
 */
export interface ArticleCursorQuery {
  pageSize: number
  cursor?: string
}

/**
 * Cursor pagination query result
 */
export interface ArticleCursorResult {
  data: Article[]
  nextCursor: string | null
  hasMore: boolean
}

/**
 * Article Repository interface
 *
 * Defines the abstract interface for article data access.
 * Follows the Dependency Inversion Principle: the application layer defines
 * the interface and the infrastructure layer provides the implementation.
 */
export interface ArticleRepository {
  /**
   * Retrieve all articles (no pagination)
   */
  findAll(): Promise<Article[]>

  /**
   * Retrieve articles with offset pagination
   */
  findPaginated(query: ArticleListQuery): Promise<ArticleListResult>

  /**
   * Retrieve articles with cursor pagination
   */
  findCursor(query: ArticleCursorQuery): Promise<ArticleCursorResult>

  /**
   * Find an article by ID
   */
  findById(id: string): Promise<Article | null>

  /**
   * Find an article by slug
   */
  findBySlug(slug: string): Promise<Article | null>

  /**
   * Save an article (create or update)
   */
  save(article: Article): Promise<void>

  /**
   * Delete an article
   */
  delete(id: string): Promise<boolean>

  /**
   * Check whether a slug already exists
   */
  existsBySlug(slug: string): Promise<boolean>
}

/**
 * Repository injection token
 */
export const ARTICLE_REPOSITORY = Symbol('ARTICLE_REPOSITORY')
