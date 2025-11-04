import { Context, Next } from 'hono';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import type { AccessTokenPayload } from '../../lib/utils/jwt';

/**
 * Row-Level Security (RLS) Middleware
 *
 * Sets PostgreSQL session variable app.current_company_id for RLS policy enforcement.
 * Per FR-053c: Defense-in-depth approach using both application-layer and database-layer isolation.
 *
 * How it works:
 * 1. Extract company_id from authenticated user (JWT payload)
 * 2. Execute `SET LOCAL app.current_company_id = $1` at transaction start
 * 3. PostgreSQL RLS policies automatically filter queries using current_setting('app.current_company_id')
 * 4. SET LOCAL is transaction-scoped (automatically cleared after commit/rollback)
 *
 * Security Properties:
 * - Admin users (companyId = null) can access all data (BYPASSRLS)
 * - Regular users can only access data from their company
 * - Defense-in-depth: Works alongside application-layer RLS filters (src/lib/utils/rls.ts)
 * - Prevents SQL injection attacks from bypassing company isolation
 *
 * @see specs/main/spec.md FR-053c
 * @see specs/main/tasks.md T047
 */

export interface RLSContext extends Context {
  get: {
    (key: 'user'): AccessTokenPayload;
  };
}

/**
 * RLS Middleware - Sets PostgreSQL session variable for multi-tenant isolation
 *
 * Prerequisites:
 * - Must run AFTER auth middleware (requires authenticated user in context)
 * - Database must have RLS policies enabled on multi-tenant tables
 * - RLS policies must use: company_id = current_setting('app.current_company_id')::integer
 *
 * @example
 * // Apply middleware after auth
 * app.use('*', authMiddleware);
 * app.use('*', rlsMiddleware);
 *
 * // Now all queries are automatically filtered by company_id
 * app.get('/api/positions', async (c) => {
 *   // This query is automatically filtered by RLS policies
 *   const positions = await db.select().from(workPositions);
 *   return c.json(positions);
 * });
 */
export async function rlsMiddleware(c: RLSContext, next: Next) {
  try {
    // Get authenticated user from context (set by auth middleware)
    const user = c.get('user');

    if (!user) {
      // Auth middleware should have blocked this, but defensive check
      console.warn('⚠️  RLS middleware: No user in context (auth middleware may not be configured)');
      return await next();
    }

    // Admin users with companyId=null have unrestricted access (BYPASSRLS)
    if (user.role === 'admin' && user.companyId === null) {
      console.log('🔓 RLS: Admin user detected, bypassing RLS');
      return await next();
    }

    // Regular users must have companyId
    if (!user.companyId) {
      console.error('❌ RLS: User has no company_id assigned', { userId: user.userId, email: user.email });
      return c.json(
        {
          success: false,
          error: 'Корисник нема додељену компанију (User has no company assigned)',
        },
        403
      );
    }

    // Set PostgreSQL session variable for RLS policy enforcement
    // SET LOCAL is transaction-scoped (cleared after commit/rollback)
    await db.execute(
      sql`SET LOCAL app.current_company_id = ${user.companyId.toString()}`
    );

    console.log(`🔒 RLS: Set company_id=${user.companyId} for user=${user.email}`);

    // Continue with request
    return await next();
  } catch (error) {
    console.error('❌ RLS middleware error:', error);

    // Don't expose internal error details to client
    return c.json(
      {
        success: false,
        error: 'Грешка при провери сигурносних политика (Security policy error)',
      },
      500
    );
  }
}

/**
 * Reset RLS session variable (useful for testing or cleanup)
 *
 * Normally not needed in production (SET LOCAL auto-clears per transaction),
 * but useful for test cleanup or manual session management.
 *
 * @example
 * afterEach(async () => {
 *   await resetRLS();
 * });
 */
export async function resetRLS(): Promise<void> {
  try {
    await db.execute(sql`RESET app.current_company_id`);
    console.log('🔄 RLS: Session variable reset');
  } catch (error) {
    console.error('❌ RLS reset error:', error);
  }
}

/**
 * Get current RLS company_id from session (for debugging)
 *
 * @returns Current company_id set in PostgreSQL session, or null if not set
 *
 * @example
 * const companyId = await getCurrentRLSCompanyId();
 * console.log('Current RLS company_id:', companyId);
 */
export async function getCurrentRLSCompanyId(): Promise<number | null> {
  try {
    const result = await db.execute<{ current_setting: string }>(
      sql`SELECT current_setting('app.current_company_id', true) as current_setting`
    );

    const value = result.rows[0]?.current_setting;

    if (!value || value === '') {
      return null;
    }

    return parseInt(value, 10);
  } catch (error) {
    console.error('❌ Error getting RLS company_id:', error);
    return null;
  }
}
