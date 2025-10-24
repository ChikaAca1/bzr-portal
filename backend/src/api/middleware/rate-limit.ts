/**
 * Rate Limiting Middleware (T022)
 *
 * Implements token bucket rate limiting to prevent API abuse.
 * Requirements: SC-004 (100 concurrent users)
 *
 * Strategy:
 * - In-memory rate limiting (sufficient for MVP, consider Redis for production scale)
 * - Per-IP and per-user rate limits
 * - Different limits for authenticated vs anonymous requests
 */

import { Context } from 'hono';
import { requireAuthUser } from './auth';
import { logWarn } from '../../lib/logger';

// =============================================================================
// Configuration
// =============================================================================

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // requests
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute

// Anonymous users: stricter limits
const ANON_RATE_LIMIT_MAX = 20; // 20 requests per minute
const AUTH_RATE_LIMIT_MAX = 100; // 100 requests per minute for authenticated users

// =============================================================================
// In-Memory Store
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp in ms
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// =============================================================================
// Rate Limit Logic
// =============================================================================

/**
 * Check rate limit for a given key
 *
 * @param key - Unique identifier (IP or userId)
 * @param maxRequests - Maximum requests allowed in window
 * @returns Object with allowed status and remaining requests
 */
function checkRateLimit(key: string, maxRequests: number): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No existing entry or window expired
  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// =============================================================================
// Middleware
// =============================================================================

/**
 * Rate limiting middleware
 *
 * Usage: app.use('*', rateLimitMiddleware)
 *
 * Response headers:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining in window
 * - X-RateLimit-Reset: Timestamp when limit resets
 */
export async function rateLimitMiddleware(c: Context, next: Function) {
  const user = c.get('user'); // May be undefined if not authenticated
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  // Determine rate limit key and max requests
  let key: string;
  let maxRequests: number;

  if (user) {
    // Authenticated user: rate limit by userId
    key = `user:${user.userId}`;
    maxRequests = AUTH_RATE_LIMIT_MAX;
  } else {
    // Anonymous: rate limit by IP
    key = `ip:${ip}`;
    maxRequests = ANON_RATE_LIMIT_MAX;
  }

  // Check rate limit
  const { allowed, remaining, resetAt } = checkRateLimit(key, maxRequests);

  // Set rate limit headers
  c.header('X-RateLimit-Limit', maxRequests.toString());
  c.header('X-RateLimit-Remaining', remaining.toString());
  c.header('X-RateLimit-Reset', Math.floor(resetAt / 1000).toString());

  // Enforce limit
  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);

    logWarn('Rate limit exceeded', {
      key,
      ip,
      userId: user?.userId,
      retryAfter,
    });

    return c.json(
      {
        error: 'Too Many Requests',
        message: 'Превише захтева. Покушајте поново касније.',
        retryAfter,
      },
      429
    );
  }

  await next();
}

/**
 * Strict rate limit for expensive operations (document generation)
 *
 * Limit: 5 requests per minute per user
 */
export async function strictRateLimitMiddleware(c: Context, next: Function) {
  const user = requireAuthUser(c);
  const key = `strict:user:${user.userId}`;
  const maxRequests = 5;

  const { allowed, remaining, resetAt } = checkRateLimit(key, maxRequests);

  c.header('X-RateLimit-Limit', maxRequests.toString());
  c.header('X-RateLimit-Remaining', remaining.toString());
  c.header('X-RateLimit-Reset', Math.floor(resetAt / 1000).toString());

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);

    logWarn('Strict rate limit exceeded', {
      userId: user.userId,
      retryAfter,
    });

    return c.json(
      {
        error: 'Too Many Requests',
        message: 'Превише захтева за генерисање докумената. Покушајте поново за ${retryAfter} секунди.',
        retryAfter,
      },
      429
    );
  }

  await next();
}
