import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Password Reset Tokens Table (T026)
 *
 * Stores one-time tokens for password reset flow.
 * Tokens expire after 60 minutes for security (FR-028k).
 *
 * Flow:
 * 1. User requests reset → Generate token → Send email
 * 2. User clicks link with token → Validate token
 * 3. User sets new password → Invalidate token + all sessions
 */
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),

  // User reference
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  // Token data (64-char hex string, single-use)
  token: varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(), // Valid for 60 minutes

  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
