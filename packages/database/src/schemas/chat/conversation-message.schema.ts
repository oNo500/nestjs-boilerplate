import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { conversationTable } from './conversation.schema'

/**
 * ConversationMessage table definition
 *
 * Message records within a conversation
 */
export const conversationMessageTable = pgTable(
  'conversation_message',
  {
    id: text('id').primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversationTable.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant'
    parts: jsonb('parts').notNull(),
    attachments: jsonb('attachments'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('conversation_message_conversation_id_idx').on(table.conversationId),
  ],
)

/**
 * ConversationMessage database type
 */
export type ConversationMessageDatabase = typeof conversationMessageTable.$inferSelect

/**
 * Insert ConversationMessage type
 */
export type InsertConversationMessageDatabase = typeof conversationMessageTable.$inferInsert
