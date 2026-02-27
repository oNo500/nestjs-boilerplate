import { relations } from 'drizzle-orm'

import {
  usersTable,
  profilesTable,
  accountsTable,
  sessionsTable,
  conversationTable,
  conversationMessageTable,
  conversationMessageVoteTable,
  conversationStreamTable,
  artifactTable,
  artifactSuggestionTable,
} from './schemas'

/**
 * Users table relations
 */
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  // 1:1 with profiles
  profile: one(profilesTable, {
    fields: [usersTable.id],
    references: [profilesTable.userId],
  }),
  // 1:N with auth_accounts
  accounts: many(accountsTable),
  // 1:N with auth_sessions
  sessions: many(sessionsTable),
  // 1:N with conversation
  conversations: many(conversationTable),
  // 1:N with artifact
  artifacts: many(artifactTable),
  // 1:N with artifact_suggestion
  artifactSuggestions: many(artifactSuggestionTable),
}))

/**
 * Profiles table relations
 */
export const profilesRelations = relations(profilesTable, ({ one }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [profilesTable.userId],
    references: [usersTable.id],
  }),
}))

/**
 * Auth Accounts table relations
 */
export const accountsRelations = relations(accountsTable, ({ one }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}))

/**
 * Auth Sessions table relations
 */
export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}))

// ==================== Conversation ====================

/**
 * Conversation table relations
 */
export const conversationRelations = relations(conversationTable, ({ one, many }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [conversationTable.userId],
    references: [usersTable.id],
  }),
  // 1:N with conversation_message
  messages: many(conversationMessageTable),
  // 1:N with conversation_message_vote
  votes: many(conversationMessageVoteTable),
  // 1:N with conversation_stream
  streams: many(conversationStreamTable),
}))

/**
 * ConversationMessage table relations
 */
export const conversationMessageRelations = relations(conversationMessageTable, ({ one, many }) => ({
  // N:1 with conversation
  conversation: one(conversationTable, {
    fields: [conversationMessageTable.conversationId],
    references: [conversationTable.id],
  }),
  // 1:N with conversation_message_vote
  votes: many(conversationMessageVoteTable),
  // 1:N with artifact
  artifacts: many(artifactTable),
}))

/**
 * ConversationMessageVote table relations
 */
export const conversationMessageVoteRelations = relations(conversationMessageVoteTable, ({ one }) => ({
  // N:1 with conversation
  conversation: one(conversationTable, {
    fields: [conversationMessageVoteTable.conversationId],
    references: [conversationTable.id],
  }),
  // N:1 with conversation_message
  message: one(conversationMessageTable, {
    fields: [conversationMessageVoteTable.messageId],
    references: [conversationMessageTable.id],
  }),
}))

/**
 * ConversationStream table relations
 */
export const conversationStreamRelations = relations(conversationStreamTable, ({ one }) => ({
  // N:1 with conversation
  conversation: one(conversationTable, {
    fields: [conversationStreamTable.conversationId],
    references: [conversationTable.id],
  }),
}))

// ==================== Artifact ====================

/**
 * Artifact table relations
 */
export const artifactRelations = relations(artifactTable, ({ one, many }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [artifactTable.userId],
    references: [usersTable.id],
  }),
  // N:1 with conversation_message (optional)
  message: one(conversationMessageTable, {
    fields: [artifactTable.messageId],
    references: [conversationMessageTable.id],
  }),
  // 1:N with artifact_suggestion
  suggestions: many(artifactSuggestionTable),
}))

/**
 * ArtifactSuggestion table relations
 */
export const artifactSuggestionRelations = relations(artifactSuggestionTable, ({ one }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [artifactSuggestionTable.userId],
    references: [usersTable.id],
  }),
  // N:1 with artifact (composite foreign key)
  artifact: one(artifactTable, {
    fields: [artifactSuggestionTable.artifactId, artifactSuggestionTable.artifactCreatedAt],
    references: [artifactTable.id, artifactTable.createdAt],
  }),
}))
