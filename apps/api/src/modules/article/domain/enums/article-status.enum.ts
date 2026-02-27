/**
 * Article status
 *
 * Defines the lifecycle states of an article:
 * - DRAFT: Draft; initial state; editable
 * - PUBLISHED: Published; publicly visible; not editable
 * - ARCHIVED: Archived; no longer displayed; not editable
 */
export const ArticleStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus]
