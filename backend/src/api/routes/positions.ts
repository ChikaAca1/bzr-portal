import { router, protectedProcedure } from '../trpc/router';
import { PositionService } from '../../services/position.service';
import {
  createPositionSchema,
  updatePositionSchema,
  listPositionsByCompanySchema,
} from '../../lib/validators/position.validator';
import { z } from 'zod';

/**
 * Positions tRPC Router
 *
 * Implements positions.contract.md endpoints:
 * - positions.create
 * - positions.getById
 * - positions.listByCompany (with pagination and search)
 * - positions.update
 * - positions.delete
 */

export const positionsRouter = router({
  /**
   * Create new work position
   *
   * Input: Position data
   * Output: Created position
   * Errors: BAD_REQUEST, NOT_FOUND (company), FORBIDDEN
   */
  create: protectedProcedure.input(createPositionSchema).mutation(async ({ ctx, input }) => {
    const service = new PositionService(ctx.db, ctx.userId);
    return service.create(input as any);
  }),

  /**
   * Get position by ID
   *
   * Input: { id: number }
   * Output: Position
   * Errors: NOT_FOUND, FORBIDDEN
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const service = new PositionService(ctx.db, ctx.userId);
      return service.getById(input.id);
    }),

  /**
   * List positions by company (with pagination and search)
   *
   * Input: { companyId, page?, pageSize?, search? }
   * Output: { positions, total, page, pageSize, totalPages }
   * Errors: NOT_FOUND (company), FORBIDDEN
   */
  listByCompany: protectedProcedure
    .input(listPositionsByCompanySchema)
    .query(async ({ ctx, input }) => {
      const service = new PositionService(ctx.db, ctx.userId);
      return service.listByCompany(input.companyId, input.page, input.pageSize, input.search);
    }),

  /**
   * Update position
   *
   * Input: { id, ...updated fields }
   * Output: Updated position
   * Errors: NOT_FOUND, FORBIDDEN, BAD_REQUEST
   */
  update: protectedProcedure.input(updatePositionSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const service = new PositionService(ctx.db, ctx.userId);
    return service.update(id, data as any);
  }),

  /**
   * Soft delete position
   *
   * Input: { id: number }
   * Output: Deleted position
   * Errors: NOT_FOUND, FORBIDDEN
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const service = new PositionService(ctx.db, ctx.userId);
      return service.delete(input.id);
    }),
});
