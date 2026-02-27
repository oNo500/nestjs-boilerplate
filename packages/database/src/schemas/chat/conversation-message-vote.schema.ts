import {
  boolean,
  pgTable,
  primaryKey,
  text,
  uuid,
} from 'drizzle-orm/pg-core'

import { conversationTable } from './conversation.schema'
import { conversationMessageTable } from './conversation-message.schema'

/**
 * ConversationMessageVote table definition
 *
 * Message vote records, composite primary key (conversationId, messageId)
 */
export const conversationMessageVoteTable = pgTable(
  'conversation_message_vote',
  {
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversationTable.id, { onDelete: 'cascade' }),
    messageId: text('message_id')
      .notNull()
      .references(() => conversationMessageTable.id, { onDelete: 'cascade' }),
    isUpvoted: boolean('is_upvoted').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.messageId] }),
  ],
)

/**
 * ConversationMessageVote database type
 */
export type ConversationMessageVoteDatabase = typeof conversationMessageVoteTable.$inferSelect

/**
 * Insert ConversationMessageVote type
 */
export type InsertConversationMessageVoteDatabase = typeof conversationMessageVoteTable.$inferInsert
