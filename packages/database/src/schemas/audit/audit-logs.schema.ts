import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const auditLogsTable = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    action: text('action').notNull(),

    actorId: text('actor_id'),
    actorEmail: text('actor_email'),
    actorName: text('actor_name'),

    resourceType: text('resource_type'),
    resourceId: text('resource_id'),

    // Snapshot of entity state before/after the action (null for create/delete respectively)
    before: jsonb('before'),
    after: jsonb('after'),

    detail: jsonb('detail'),

    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    requestId: text('request_id'),

    // When the domain event actually occurred (may differ from DB write time)
    occurredAt: timestamp('occurred_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_actor_id_idx').on(table.actorId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_resource_idx').on(table.resourceType, table.resourceId),
    index('audit_logs_occurred_at_idx').on(table.occurredAt),
    index('audit_logs_created_at_idx').on(table.createdAt),
  ],
)

export type AuditLog = typeof auditLogsTable.$inferSelect
export type InsertAuditLog = typeof auditLogsTable.$inferInsert
