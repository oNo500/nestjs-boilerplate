import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

import { usersTable } from './users';
import { genderEnum } from './_enums';

export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull(),
  gender: genderEnum('gender').default('UNKNOWN').notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).unique(),
  profilePicture: text('profile_picture'),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  address: text('address'),

  // Foreign key for one-to-one relationship
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .unique(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
