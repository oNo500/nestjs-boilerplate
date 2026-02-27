import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const auditLogsTable = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    action: text('action').notNull(),

    actorId: text('actor_id'),
    actorEmail: text('actor_email'),

    resourceType: text('resource_type'),
    resourceId: text('resource_id'),

    detail: jsonb('detail'),

    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    requestId: text('request_id'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_actor_id_idx').on(table.actorId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_created_at_idx').on(table.createdAt),
  ],
)

export type AuditLog = typeof auditLogsTable.$inferSelect
export type InsertAuditLog = typeof auditLogsTable.$inferInsert
