import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Todos table definition
 *
 * Stores todo items
 */
export const todosTable = pgTable('todos', {
  // Primary key
  id: uuid('id').primaryKey().defaultRandom(),

  // Title (required)
  title: text('title').notNull(),

  // Description (optional)
  description: text('description'),

  // Completion status
  isCompleted: boolean('is_completed').notNull().default(false),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

/**
 * Todo type (inferred from table)
 */
export type Todo = typeof todosTable.$inferSelect

/**
 * Insert Todo type (inferred from table)
 */
export type InsertTodo = typeof todosTable.$inferInsert
