import { index, integer, jsonb, numeric, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

/**
 * Orders table definition
 *
 * Stores order data
 * The version field is used for optimistic locking concurrency control
 */
export const ordersTable = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Buyer ID
    userId: text('user_id').notNull(),

    // Order status (enum)
    status: text('status', {
      enum: ['pending_payment', 'paid', 'shipping', 'completed', 'cancelled'],
    })
      .notNull()
      .default('pending_payment'),

    // Order items (embedded JSON, avoids multi-table JOINs)
    items: jsonb('items')
      .$type<Array<{ productId: string; quantity: number; unitPrice: string }>>()
      .notNull()
      .default([]),

    // Order total amount
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),

    // Currency unit
    currency: varchar('currency', { length: 3 }).notNull().default('CNY'),

    // Optimistic lock version number
    version: integer('version').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },

  (table) => [
    index('orders_user_id_idx').on(table.userId),
    index('orders_status_idx').on(table.status),
  ],
)

export type OrderDatabase = typeof ordersTable.$inferSelect
export type InsertOrderDatabase = typeof ordersTable.$inferInsert
