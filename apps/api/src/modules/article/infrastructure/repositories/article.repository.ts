import { Inject, Injectable } from '@nestjs/common'
import { articlesTable } from '@workspace/database'
import { and, count, eq, gt, or, sql } from 'drizzle-orm'

import { DB_TOKEN } from '@/app/database/db.port'
import { Article } from '@/modules/article/domain/aggregates/article.aggregate'
import { ArticleStatus } from '@/modules/article/domain/enums/article-status.enum'
import { Content } from '@/modules/article/domain/value-objects/content.vo'
import { Slug } from '@/modules/article/domain/value-objects/slug.vo'
import { Tags } from '@/modules/article/domain/value-objects/tags.vo'
import { Title } from '@/modules/article/domain/value-objects/title.vo'

import type { DrizzleDb } from '@/app/database/db.port'
import type { ArticleCursorQuery, ArticleCursorResult, ArticleListQuery, ArticleListResult, ArticleRepository } from '@/modules/article/application/ports/article.repository.port'
import type { ArticleCategory } from '@/modules/article/domain/aggregates/article.aggregate'
import type { ArticleDatabase, InsertArticleDatabase } from '@workspace/database'

/**
 * Drizzle ORM implementation of ArticleRepository
 *
 * Implements the ArticleRepository interface using Drizzle ORM.
 * Responsible for mapping between domain models and database records.
 */
@Injectable()
export class ArticleRepositoryImpl implements ArticleRepository {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDb) {}

  async findAll(): Promise<Article[]> {
    const rows = await this.db
      .select()
      .from(articlesTable)
      .orderBy(articlesTable.createdAt)

    return rows.map((row) => this.toDomain(row))
  }

  async findCursor(query: ArticleCursorQuery): Promise<ArticleCursorResult> {
    const { pageSize, cursor } = query

    let whereClause = undefined
    if (cursor) {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString()) as {
        createdAt: string
        id: string
      }
      whereClause = or(
        gt(articlesTable.createdAt, new Date(decoded.createdAt)),
        and(
          eq(articlesTable.createdAt, new Date(decoded.createdAt)),
          gt(articlesTable.id, decoded.id),
        ),
      )
    }

    const rows = await this.db
      .select()
      .from(articlesTable)
      .where(whereClause)
      .orderBy(articlesTable.createdAt, articlesTable.id)
      .limit(pageSize + 1)

    const hasMore = rows.length > pageSize
    const data = hasMore ? rows.slice(0, pageSize) : rows

    let nextCursor: string | null = null
    if (hasMore) {
      const last = data.at(-1)!
      nextCursor = Buffer.from(
        JSON.stringify({ createdAt: last.createdAt.toISOString(), id: last.id }),
      ).toString('base64')
    }

    return {
      data: data.map((row) => this.toDomain(row)),
      nextCursor,
      hasMore,
    }
  }

  async findPaginated(query: ArticleListQuery): Promise<ArticleListResult> {
    const { page, pageSize, q } = query
    const offset = (page - 1) * pageSize

    const whereClause = q
      ? sql`${articlesTable.searchVector} @@ plainto_tsquery('english', ${q})`
      : undefined

    const [rows, [countRow]] = await Promise.all([
      this.db
        .select()
        .from(articlesTable)
        .where(whereClause)
        .orderBy(
          q
            ? sql`ts_rank(${articlesTable.searchVector}, plainto_tsquery('english', ${q})) DESC`
            : articlesTable.createdAt,
        )
        .limit(pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(articlesTable).where(whereClause),
    ])

    return {
      data: rows.map((row) => this.toDomain(row)),
      total: countRow?.count ?? 0,
    }
  }

  async findById(id: string): Promise<Article | null> {
    const [row] = await this.db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.id, id))

    return row ? this.toDomain(row) : null
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const [row] = await this.db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.slug, slug))

    return row ? this.toDomain(row) : null
  }

  async save(article: Article): Promise<void> {
    const data = this.toPersistence(article)

    await this.db
      .insert(articlesTable)
      .values(data)
      .onConflictDoUpdate({
        target: articlesTable.id,
        set: data,
      })
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(articlesTable)
      .where(eq(articlesTable.id, id))
      .returning()

    return result.length > 0
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: articlesTable.id })
      .from(articlesTable)
      .where(eq(articlesTable.slug, slug))

    return Boolean(row)
  }

  // ========== Domain model <-> Database record mapping ==========

  /**
   * Database record -> Domain model
   */
  private toDomain(row: ArticleDatabase): Article {
    return Article.reconstitute(
      row.id,
      Title.create(row.title),
      Content.create(row.content),
      Slug.create(row.slug),
      row.status as ArticleStatus,
      Tags.create(row.tags),
      row.category as ArticleCategory,
      row.author,
      row.viewCount,
      row.isPinned,
      row.createdAt,
      row.updatedAt,
      row.publishedAt,
    )
  }

  /**
   * Domain model -> Database record
   */
  private toPersistence(article: Article): Omit<InsertArticleDatabase, 'searchVector'> & { searchVector: ReturnType<typeof sql> } {
    const title = article.title.value
    const content = article.content.value
    return {
      id: article.id,
      title,
      content,
      slug: article.slug.value,
      status: article.status,
      tags: [...article.tags.value],
      category: article.category,
      author: article.author,
      viewCount: article.viewCount,
      isPinned: article.isPinned,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      searchVector: sql`to_tsvector('english', ${title} || ' ' || ${content})`,
    }
  }
}
