import { sessionsTable, usersTable } from '@repo/db';
import { InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;

export interface AuthTokensInterface {
  accessToken: string;
  refreshToken: string;
}
