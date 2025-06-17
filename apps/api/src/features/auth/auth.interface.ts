import { passportTable, usersTable } from '@repo/db';
import { InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof usersTable>;
export type Passport = InferSelectModel<typeof passportTable>;
