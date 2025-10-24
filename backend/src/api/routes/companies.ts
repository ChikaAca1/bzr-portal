import { router, protectedProcedure } from '../trpc/builder';
import { CompanyService } from '../../services/CompanyService';
import { createCompanySchema, updateCompanySchema } from '../../schemas/company';
import { z } from 'zod';

/**
 * Companies tRPC Router
 *
 * Implements companies.contract.md endpoints:
 * - companies.create
 * - companies.getById
 * - companies.list
 * - companies.update
 * - companies.delete
 */

export const companiesRouter = router({
  /**
   * Create new company
   *
   * Input: Company data (validated by createCompanySchema)
   * Output: Created company
   * Errors: BAD_REQUEST (validation), CONFLICT (duplicate PIB)
   */
  create: protectedProcedure.input(createCompanySchema).mutation(async ({ ctx, input }) => {
    if (!ctx.userId) throw new Error('Unauthorized');
    return CompanyService.create({ ...input, userId: ctx.userId });
  }),

  /**
   * Get company by ID
   *
   * Input: { id: number }
   * Output: Company
   * Errors: NOT_FOUND, FORBIDDEN
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      return CompanyService.getById(input.id, ctx.userId);
    }),

  /**
   * List all companies for current user
   *
   * Input: none
   * Output: Company[]
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Unauthorized');
    return CompanyService.listByUser(ctx.userId);
  }),

  /**
   * Update company
   *
   * Input: { id: number, ...updated fields }
   * Output: Updated company
   * Errors: NOT_FOUND, FORBIDDEN, BAD_REQUEST
   */
  update: protectedProcedure.input(updateCompanySchema.extend({ id: z.number() })).mutation(async ({ ctx, input }) => {
    if (!ctx.userId) throw new Error('Unauthorized');
    return CompanyService.update({ ...input, userId: ctx.userId });
  }),

  /**
   * Soft delete company
   *
   * Input: { id: number }
   * Output: Deleted company
   * Errors: NOT_FOUND, FORBIDDEN
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      await CompanyService.delete(input.id, ctx.userId);
      return { success: true };
    }),
});
