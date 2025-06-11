import {
  AnyPgColumn,
  index,
  integer,
  pgEnum,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('roles', ['guest', 'user', 'admin']);
export const users = pgTable(
  'users',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    firstName: varchar('first_name', { length: 256 }),
    lastName: varchar('last_name', { length: 256 }),
    email: varchar().notNull(),
    // references：创建外键关联
    invitee: integer().references((): AnyPgColumn => users.id),
    role: rolesEnum().default('guest'),
  },
  // 创建了一个名为 email_idx 的唯一索引（unique index）
  (table) => [uniqueIndex('email_idx').on(table.email)],
);

export const posts = pgTable(
  'posts',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: varchar().$default(() => generateUniqueString(16)),
    title: varchar({ length: 256 }),
    //   postId: integer().references((): AnyPgColumn => posts.id),
    ownerId: integer().references(() => users.id),
  },
  (table) => [
    // 唯一索引 & 普通索引
    // 普通索引，仅用来加快查询速度
    uniqueIndex('slug_idx').on(table.slug),
    index('title_idx').on(table.title),
  ],
);

export const comments = pgTable('comments', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  text: varchar({ length: 256 }),
  postId: integer().references(() => posts.id), // { onDelete: 'cascade' }
  ownerId: integer().references(() => users.id),
});

function generateUniqueString(length: number = 12): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uniqueString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueString += characters[randomIndex];
  }

  return uniqueString;
}
