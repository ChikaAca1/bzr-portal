import { initTRPC } from '@trpc/server';
import { type TRPCContext } from './context';
import { handleTRPCError } from '../middleware/error-handler';
import superjson from 'superjson';

/**
 * tRPC Builder (separated to avoid circular dependencies)
 *
 * This file exports only the builder functions (router, publicProcedure, protectedProcedure)
 * while router.ts assembles the actual app router.
 */

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause,
      },
    };
  },
});

/**
 * Base router builder
 */
export const router = t.router;

/**
 * Public procedure (no authentication required)
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure (requires authentication)
 */
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userId) {
    throw handleTRPCError(new Error('Unauthorized'));
  }

  return opts.next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Type narrowing
    },
  });
});
