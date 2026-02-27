import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { conversationTable } from './conversation.schema'

/**
 * ConversationStream table definition
 *
 * Conversation stream status tracking
 */
export const conversationStreamTable = pgTable(
  'conversation_stream',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversationTable.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['pending', 'completed', 'failed'] })
      .notNull()
      .default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('conversation_stream_conversation_id_idx').on(table.conversationId),
  ],
)

/**
 * ConversationStream database type
 */
export type ConversationStreamDatabase = typeof conversationStreamTable.$inferSelect

/**
 * Insert ConversationStream type
 */
export type InsertConversationStreamDatabase = typeof conversationStreamTable.$inferInsert
