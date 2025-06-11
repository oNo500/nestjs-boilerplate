import { integer, timestamp, pgTable } from 'drizzle-orm/pg-core';

const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
};

// 例子
export const someTable = pgTable('some_table', {
  id: integer(),
  ...timestamps,
});
