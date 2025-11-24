import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Email Verification Tokens Table
 *
 * Stores tokens for email verification and password reset.
 * Tokens expire after 24 hours (email verification) or 1 hour (password reset).
 */
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: serial('id').primaryKey(),

  // User reference
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  // Token data (64-char hex string)
  token: varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),

  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
