import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Sessions Table (Phase 2.5: T040c)
 *
 * Stores active user sessions for JWT refresh token rotation.
 * Implements secure session management per FR-028.
 *
 * Strategy:
 * - Access tokens: Short-lived (15min), stored in memory (httpOnly cookie)
 * - Refresh tokens: Long-lived (7 days), stored in DB for revocation
 */
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),

  // User reference
  userId: serial('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  // Token data
  refreshToken: varchar('refresh_token', { length: 512 }).notNull().unique(),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at').notNull(),

  // Session metadata
  userAgent: text('user_agent'), // Browser/client info
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6

  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
