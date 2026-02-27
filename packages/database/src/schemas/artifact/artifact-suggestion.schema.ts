import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { usersTable } from '../auth/users.schema'

/**
 * ArtifactSuggestion table definition
 *
 * Modification suggestions for an Artifact
 */
export const artifactSuggestionTable = pgTable(
  'artifact_suggestion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    artifactId: uuid('artifact_id').notNull(),
    artifactCreatedAt: timestamp('artifact_created_at', { withTimezone: true })
      .notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    originalText: text('original_text').notNull(),
    suggestedText: text('suggested_text').notNull(),
    description: text('description'),
    isResolved: boolean('is_resolved').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('artifact_suggestion_artifact_idx').on(
      table.artifactId,
      table.artifactCreatedAt,
    ),
    index('artifact_suggestion_user_id_idx').on(table.userId),
  ],
)

/**
 * ArtifactSuggestion database type
 */
export type ArtifactSuggestionDatabase = typeof artifactSuggestionTable.$inferSelect

/**
 * Insert ArtifactSuggestion type
 */
export type InsertArtifactSuggestionDatabase = typeof artifactSuggestionTable.$inferInsert
