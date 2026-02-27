import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { usersTable } from '../auth/users.schema'

/**
 * Conversation table definition
 *
 * The conversation entity, associating users and messages
 */
export const conversationTable = pgTable(
  'conversation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    visibility: text('visibility', { enum: ['public', 'private'] })
      .notNull()
      .default('private'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('conversation_user_id_idx').on(table.userId),
  ],
)

/**
 * Conversation database type
 */
export type ConversationDatabase = typeof conversationTable.$inferSelect

/**
 * Insert Conversation type
 */
export type InsertConversationDatabase = typeof conversationTable.$inferInsert
