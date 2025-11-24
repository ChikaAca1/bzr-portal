/**
 * tRPC App Router
 *
 * Assembles all feature routers into the main app router.
 * Builder functions are exported from ./builder.ts to avoid circular dependencies.
 */

import { router, publicProcedure } from './builder';
import { authRouter } from '../routes/auth';
import { companiesRouter } from '../routes/companies';
import { positionsRouter } from '../routes/positions';
import { workersRouter } from '../routes/workers';
import { risksRouter } from '../routes/risks';
import { documentsRouter } from '../routes/documents';

// Re-export builder functions for convenience
export { router, publicProcedure, protectedProcedure } from './builder';

/**
 * App Router
 *
 * Combines all feature routers.
 */
export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),

  // Feature routers (Phase 3 MVP)
  auth: authRouter,
  companies: companiesRouter,
  positions: positionsRouter,
  workers: workersRouter,
  risks: risksRouter,
  documents: documentsRouter,
});

export type AppRouter = typeof appRouter;
