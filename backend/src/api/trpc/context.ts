import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { db } from '../../db';

/**
 * tRPC Context
 *
 * Context available in all tRPC procedures.
 * Contains database connection and user authentication info.
 */

export interface Context {
  db: typeof db;
  userId: string | null;
  req: Request;
}

/**
 * Create context for each request
 *
 * Extracts JWT from Authorization header and verifies it.
 * Sets userId in context for use in procedures.
 */
export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  const { req } = opts;

  // Extract JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  let userId: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      // Import JWT utilities
      const { verifyAccessToken } = await import('../../lib/utils/jwt');
      const payload = verifyAccessToken(token);
      userId = payload.userId.toString();
    } catch (error) {
      // Invalid or expired token - userId remains null
      // Protected procedures will handle this
    }
  }

  return {
    db,
    userId,
    req,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>;
