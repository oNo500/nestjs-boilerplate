import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { genderEnum } from './_enums';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  gender: genderEnum('gender').default('UNKNOWN').notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).unique(),
  profilePicture: text('profile_picture'),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  address: text('address'),

  // Foreign key for one-to-one relationship
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
