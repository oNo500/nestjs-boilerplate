import { boolean, customType, index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  },
})

/**
 * Articles table definition
 *
 * Stores article data
 */
export const articlesTable = pgTable(
  'articles',
  {
    // Primary key
    id: uuid('id').primaryKey().defaultRandom(),

    // Title (required)
    title: text('title').notNull(),

    // Content (required)
    content: text('content').notNull(),

    // Slug (required, unique)
    slug: text('slug').notNull().unique(),

    // Status (enum)
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),

    // Tags (JSONB array)
    tags: jsonb('tags').$type<string[]>().notNull().default([]),

    // Category (enum)
    category: text('category', { enum: ['tech', 'design', 'product', 'other'] })
      .notNull()
      .default('other'),

    // Author name (text, not a foreign key)
    author: text('author').notNull().default(''),

    // View count (read-only, maintained by the system)
    viewCount: integer('view_count').notNull().default(0),

    // Whether pinned
    isPinned: boolean('is_pinned').notNull().default(false),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    // Full-text search vector (maintained on insert/update)
    searchVector: tsvector('search_vector').notNull().default(''),
  },

  (table) => [
    // Index: query by slug
    index('articles_slug_idx').on(table.slug),
    // Index: query by status
    index('articles_status_idx').on(table.status),
    // GIN index for full-text search
    index('articles_search_vector_idx').using('gin', table.searchVector),
  ],
)

/**
 * Article database type (inferred from table definition)
 */
export type ArticleDatabase = typeof articlesTable.$inferSelect

/**
 * Insert Article type (inferred from table definition)
 */
export type InsertArticleDatabase = typeof articlesTable.$inferInsert
