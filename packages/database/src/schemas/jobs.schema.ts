import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Jobs table definition
 *
 * Stores async task status, used for the 202 Accepted pattern
 */
export const jobsTable = pgTable(
  'jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Task type (e.g. 'ship_order')
    type: text('type').notNull(),

    // Task status
    status: text('status', {
      enum: ['pending', 'running', 'succeeded', 'failed', 'cancelled'],
    })
      .notNull()
      .default('pending'),

    // Task input parameters
    payload: jsonb('payload').notNull().default({}),

    // Success result (nullable)
    result: jsonb('result'),

    // Failure details (nullable)
    error: jsonb('error').$type<{ code: string; message: string } | null>(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },

  (table) => [
    index('jobs_status_idx').on(table.status),
    index('jobs_type_idx').on(table.type),
  ],
)

export type JobDatabase = typeof jobsTable.$inferSelect
export type InsertJobDatabase = typeof jobsTable.$inferInsert
