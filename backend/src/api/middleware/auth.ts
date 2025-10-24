/**
 * Authentication Middleware (Phase 2.5: T040h)
 *
 * Validates JWT access tokens and attaches user data to request context.
 * Security requirement: FR-028
 */

import { Context } from 'hono';
import { verifyAccessToken, extractBearerToken, type AccessTokenPayload } from '../../lib/utils/jwt';

// =============================================================================
// Extended Context Type (with user data)
// =============================================================================

export interface AuthContext {
  user: AccessTokenPayload;
}

// =============================================================================
// Authentication Middleware
// =============================================================================

/**
 * Middleware to require authentication
 *
 * Usage:
 *   app.get('/protected', authMiddleware, async (c) => { ... })
 *
 * @param c - Hono context
 * @param next - Next middleware
 * @throws 401 Unauthorized if token is missing or invalid
 */
export async function authMiddleware(c: Context, next: Function) {
  // Extract token from Authorization header
  const authHeader = c.req.header('Authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Format: "Bearer <token>"',
      },
      401
    );
  }

  try {
    // Verify and decode token
    const payload = verifyAccessToken(token);

    // Attach user data to context for downstream handlers
    c.set('user', payload);

    // Proceed to next middleware/handler
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';

    return c.json(
      {
        error: 'Unauthorized',
        message,
      },
      401
    );
  }
}

/**
 * Optional authentication middleware
 *
 * Attaches user data if token is valid, but doesn't fail if missing.
 * Useful for endpoints that work differently for authenticated vs anonymous users.
 *
 * @param c - Hono context
 * @param next - Next middleware
 */
export async function optionalAuthMiddleware(c: Context, next: Function) {
  const authHeader = c.req.header('Authorization');
  const token = extractBearerToken(authHeader);

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      c.set('user', payload);
    } catch (error) {
      // Ignore invalid tokens in optional auth
      // User will be treated as anonymous
    }
  }

  await next();
}

/**
 * Helper to get authenticated user from context
 *
 * @param c - Hono context
 * @returns AccessTokenPayload | undefined
 *
 * Usage:
 *   const user = getAuthUser(c);
 *   if (!user) { throw new Error('Not authenticated'); }
 */
export function getAuthUser(c: Context): AccessTokenPayload | undefined {
  return c.get('user');
}

/**
 * Helper to require authenticated user (throws if not found)
 *
 * @param c - Hono context
 * @returns AccessTokenPayload
 * @throws Error if user not authenticated
 *
 * Usage in handlers:
 *   const user = requireAuthUser(c);
 *   console.log(user.userId, user.email, user.role);
 */
export function requireAuthUser(c: Context): AccessTokenPayload {
  const user = c.get('user');

  if (!user) {
    throw new Error('User not authenticated. This should not happen if authMiddleware is used.');
  }

  return user;
}
