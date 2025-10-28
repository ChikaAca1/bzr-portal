/**
 * Rate Limiting Service (Phase 2: T022)
 *
 * Implements daily quota tracking for resource-intensive operations.
 * Per spec.md:
 * - FR-053d: 5 documents/day per user (Vercel Free 100 executions/day constraint)
 * - Trial accounts: Additional limits in trial-limits middleware
 *
 * Architecture:
 * - Database-backed (no Redis needed for MVP)
 * - Daily quota windows (reset at midnight UTC or 24h from first event)
 * - Supports multiple event types (document_generation, excel_import, ai_suggestion)
 */

import { db } from '../db';
import { rateLimitEvents, RATE_LIMIT_QUOTAS, type RateLimitEventType } from '../db/schema/rate-limits';
import { eq, and } from 'drizzle-orm';

/**
 * Quota check result
 */
export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
  message?: string;
}

/**
 * Check if user has quota remaining for an event type
 *
 * @param userId User ID
 * @param eventType Event type to check
 * @returns QuotaCheckResult with allowed status and remaining quota
 *
 * @example
 * ```ts
 * const quota = await rateLimitService.checkQuota(123, 'document_generation');
 * if (!quota.allowed) {
 *   throw new Error(`Quota exceeded: ${quota.message}`);
 * }
 * console.log(`Remaining: ${quota.remaining}/${quota.limit}`);
 * ```
 */
export async function checkQuota(
  userId: number,
  eventType: RateLimitEventType
): Promise<QuotaCheckResult> {
  const now = new Date();
  const limit = RATE_LIMIT_QUOTAS[eventType];

  // Find active rate limit entry for this user and event type
  const [entry] = await db
    .select()
    .from(rateLimitEvents)
    .where(
      and(
        eq(rateLimitEvents.userId, userId),
        eq(rateLimitEvents.eventType, eventType)
      )
    )
    .orderBy(rateLimitEvents.createdAt)
    .limit(1);

  // No existing entry or quota window expired
  if (!entry || now > entry.resetAt) {
    return {
      allowed: true,
      remaining: limit - 1, // Assume this request will be consumed
      limit,
      resetAt: calculateResetTime(now),
    };
  }

  // Check if quota exceeded
  if (entry.eventCount >= limit) {
    const remainingSeconds = Math.ceil((entry.resetAt.getTime() - now.getTime()) / 1000);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);

    return {
      allowed: false,
      remaining: 0,
      limit,
      resetAt: entry.resetAt,
      message: `Дневна квота искоришћена (${limit}/${limit}). Покушајте поново за ${hours}h ${minutes}m.`,
    };
  }

  // Quota available
  return {
    allowed: true,
    remaining: limit - entry.eventCount - 1, // -1 for current request
    limit,
    resetAt: entry.resetAt,
  };
}

/**
 * Increment quota usage for an event type
 *
 * @param userId User ID
 * @param eventType Event type
 * @returns Updated event count
 *
 * @example
 * ```ts
 * // Before generating document, check and increment quota
 * const quota = await rateLimitService.checkQuota(userId, 'document_generation');
 * if (!quota.allowed) throw new Error('Quota exceeded');
 *
 * await rateLimitService.incrementQuota(userId, 'document_generation');
 * // Generate document...
 * ```
 */
export async function incrementQuota(
  userId: number,
  eventType: RateLimitEventType
): Promise<number> {
  const now = new Date();

  // Find active entry
  const [entry] = await db
    .select()
    .from(rateLimitEvents)
    .where(
      and(
        eq(rateLimitEvents.userId, userId),
        eq(rateLimitEvents.eventType, eventType)
      )
    )
    .orderBy(rateLimitEvents.createdAt)
    .limit(1);

  // No existing entry or quota window expired - create new
  if (!entry || now > entry.resetAt) {
    const [newEntry] = await db
      .insert(rateLimitEvents)
      .values({
        userId,
        eventType,
        eventCount: 1,
        resetAt: calculateResetTime(now),
      })
      .returning();

    return newEntry.eventCount;
  }

  // Increment existing entry
  const [updated] = await db
    .update(rateLimitEvents)
    .set({
      eventCount: entry.eventCount + 1,
      updatedAt: now,
    })
    .where(eq(rateLimitEvents.id, entry.id))
    .returning();

  return updated.eventCount;
}

/**
 * Reset quota for a user (admin function)
 *
 * @param userId User ID
 * @param eventType Event type (or null for all types)
 * @returns Number of entries deleted
 */
export async function resetQuota(
  userId: number,
  eventType?: RateLimitEventType
): Promise<number> {
  if (eventType) {
    const result = await db
      .delete(rateLimitEvents)
      .where(
        and(
          eq(rateLimitEvents.userId, userId),
          eq(rateLimitEvents.eventType, eventType)
        )
      )
      .returning();

    return result.length;
  } else {
    const result = await db
      .delete(rateLimitEvents)
      .where(eq(rateLimitEvents.userId, userId))
      .returning();

    return result.length;
  }
}

/**
 * Get quota status for a user (all event types)
 *
 * @param userId User ID
 * @returns Array of quota statuses
 *
 * @example
 * ```ts
 * const quotas = await rateLimitService.getUserQuotas(userId);
 * quotas.forEach(q => {
 *   console.log(`${q.eventType}: ${q.remaining}/${q.limit} remaining`);
 * });
 * ```
 */
export async function getUserQuotas(userId: number): Promise<QuotaCheckResult[]> {
  const eventTypes: RateLimitEventType[] = ['document_generation', 'excel_import', 'ai_suggestion'];

  const results = await Promise.all(
    eventTypes.map((eventType) => checkQuota(userId, eventType))
  );

  return results.map((result, index) => ({
    ...result,
    eventType: eventTypes[index],
  })) as QuotaCheckResult[];
}

/**
 * Calculate quota reset time (24 hours from now)
 *
 * @param from Starting date (default: now)
 * @returns Reset time (24 hours from starting date)
 */
function calculateResetTime(from: Date = new Date()): Date {
  const reset = new Date(from);
  reset.setHours(reset.getHours() + 24);
  return reset;
}

/**
 * Clean up expired quota entries (cron job function)
 *
 * @returns Number of entries deleted
 *
 * @example
 * ```ts
 * // Run daily via cron
 * const deleted = await rateLimitService.cleanupExpiredQuotas();
 * console.log(`Cleaned up ${deleted} expired quota entries`);
 * ```
 */
export async function cleanupExpiredQuotas(): Promise<number> {
  const now = new Date();

  const result = await db
    .delete(rateLimitEvents)
    .where(eq(rateLimitEvents.resetAt, now)) // resetAt < now
    .returning();

  return result.length;
}

export const rateLimitService = {
  checkQuota,
  incrementQuota,
  resetQuota,
  getUserQuotas,
  cleanupExpiredQuotas,
};
