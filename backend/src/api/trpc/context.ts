import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import type { AccessTokenPayload } from '../../lib/utils/jwt';

/**
 * tRPC Context
 *
 * Context available in all tRPC procedures.
 * Contains database connection and user authentication info.
 */

export interface Context {
  db: typeof db;
  userId: string | null;
  user: AccessTokenPayload | null;
  req: Request;
}

/**
 * Create context for each request
 *
 * Extracts JWT from Authorization header, verifies it, and sets PostgreSQL RLS session variable.
 * Sets userId and full user payload in context for use in procedures.
 *
 * RLS Implementation (T047):
 * - Sets PostgreSQL session variable: app.current_company_id
 * - Enables database-level multi-tenant isolation via RLS policies
 * - Admin users (companyId = null) bypass RLS
 */
export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  const { req } = opts;

  // Extract JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  let userId: string | null = null;
  let user: AccessTokenPayload | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      // Import JWT utilities
      const { verifyAccessToken } = await import('../../lib/utils/jwt');
      const payload = verifyAccessToken(token);
      userId = payload.userId.toString();
      user = payload;

      // Set PostgreSQL RLS session variable for multi-tenant isolation (FR-053c)
      // Admin users with companyId=null bypass RLS (have BYPASSRLS privilege)
      if (payload.companyId !== null) {
        try {
          await db.execute(
            sql`SET LOCAL app.current_company_id = ${payload.companyId.toString()}`
          );
          console.log(`🔒 RLS: Set company_id=${payload.companyId} for user=${payload.email}`);
        } catch (rlsError) {
          console.error('❌ RLS session variable error:', rlsError);
          // Continue anyway - application-layer RLS will still work
        }
      } else {
        console.log(`🔓 RLS: Admin user detected (${payload.email}), bypassing RLS`);
      }
    } catch (error) {
      // Invalid or expired token - userId remains null
      // Protected procedures will handle this
      console.warn('⚠️  JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return {
    db,
    userId,
    user,
    req,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>;
