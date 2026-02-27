import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { usersTable } from '../auth/users.schema'
import { conversationMessageTable } from '../chat/conversation-message.schema'

/**
 * Artifact table definition
 *
 * AI-generated artifacts (documents / code / images / sheets, etc.)
 * Uses (id, createdAt) composite primary key to support versioning
 */
export const artifactTable = pgTable(
  'artifact',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    messageId: text('message_id')
      .references(() => conversationMessageTable.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    kind: text('kind', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.createdAt] }),
    index('artifact_user_id_idx').on(table.userId),
    index('artifact_message_id_idx').on(table.messageId),
  ],
)

/**
 * Artifact database type
 */
export type ArtifactDatabase = typeof artifactTable.$inferSelect

/**
 * Insert Artifact type
 */
export type InsertArtifactDatabase = typeof artifactTable.$inferInsert
