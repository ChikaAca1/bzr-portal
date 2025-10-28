/**
 * Rate Limit Events Table (Phase 2: T021)
 *
 * Tracks daily quotas for resource-intensive operations like document generation.
 * Per spec.md:
 * - FR-053d: 5 documents/day per user (MVP constraint for Vercel Free 100 executions/day)
 * - Trial accounts: 5 documents total per FR-028b
 */

import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Event Types for Rate Limiting
 */
export type RateLimitEventType = 'document_generation' | 'excel_import' | 'ai_suggestion';

export const rateLimitEvents = pgTable('rate_limit_events', {
  id: serial('id').primaryKey(),

  // User tracking
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Event type (e.g., document_generation)
  eventType: varchar('event_type', { length: 50 }).notNull(),

  // Count of events in current window
  eventCount: integer('event_count').default(1).notNull(),

  // When the quota resets (24 hours from first event)
  resetAt: timestamp('reset_at').notNull(),

  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type RateLimitEvent = typeof rateLimitEvents.$inferSelect;
export type NewRateLimitEvent = typeof rateLimitEvents.$inferInsert;

/**
 * Daily quota limits per event type
 */
export const RATE_LIMIT_QUOTAS: Record<RateLimitEventType, number> = {
  document_generation: 5, // 5 documents per day per user (MVP)
  excel_import: 3, // 3 Excel imports per day
  ai_suggestion: 20, // 20 AI suggestion requests per day
};
