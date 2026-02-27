import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { usersTable } from './users.schema'

/**
 * Authentication provider types
 */
export type AuthProvider
  = | 'email'
    | 'google'
    | 'github'
    | 'phone'
    | 'saml'
    | 'oidc'

/**
 * Auth Accounts table definition
 *
 * Unified authentication account management, compatible with Better Auth:
 * - email: local email/password authentication
 * - google/github: OAuth third-party login
 * - phone: phone number authentication
 * - saml/oidc: enterprise SSO
 *
 * Design characteristics:
 * - A user can have multiple authentication accounts
 * - providerId + accountId combination is unique
 * - Supports OAuth token storage (for proxying calls to third-party APIs)
 * - password only has a value for local auth; NULL for OAuth
 */
export const accountsTable = pgTable(
  'accounts',
  {
    // Primary key (text, generated using nanoid)
    id: text('id').primaryKey(),

    // Associated user (foreign key)
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

    // Required fields by Better Auth
    accountId: text('account_id').notNull(), // OAuth OpenID or internal ID
    providerId: text('provider_id').notNull(), // email, google, github, phone, saml, oidc

    // OAuth tokens (optional, for proxying calls to third-party APIs)
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),

    // Local auth credentials: password hash (NULL for OAuth)
    password: text('password'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Unique index: accounts cannot be duplicated under the same provider
    uniqueIndex('accounts_provider_account_idx').on(
      table.providerId,
      table.accountId,
    ),
    // Index: query by user ID
    index('accounts_userId_idx').on(table.userId),
  ],
)

/**
 * AuthAccount database type (inferred from table definition)
 */
export type AccountDatabase = typeof accountsTable.$inferSelect

/**
 * Insert AuthAccount type (inferred from table definition)
 */
export type InsertAccountDatabase = typeof accountsTable.$inferInsert
