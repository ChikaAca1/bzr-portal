import { router, protectedProcedure } from '../trpc/router';
import { RiskService } from '../../services/risk.service';
import {
  createRiskAssessmentSchema,
  updateRiskAssessmentSchema,
  calculateRiskSchema,
  validateRiskReductionSchema,
  listRisksByPositionSchema,
} from '../../lib/validators/risk.validator';
import { calculateRisk, validateRiskReduction } from '../../lib/utils/risk-calculator';
import { z } from 'zod';

/**
 * Risks tRPC Router
 *
 * Implements risks.contract.md endpoints:
 * - risks.create
 * - risks.getById
 * - risks.listByPosition
 * - risks.update
 * - risks.delete
 * - risks.calculateRisk (helper for frontend preview)
 * - risks.validateReduction (helper for frontend validation)
 */

export const risksRouter = router({
  /**
   * Create new risk assessment
   *
   * Validates E×P×F parameters, calculates Ri and R, enforces R < Ri rule.
   *
   * Input: { positionId, hazardId, ei, pi, fi, correctiveMeasures, e, p, f }
   * Output: Created risk assessment with calculated Ri, R, isHighRisk
   * Errors: BAD_REQUEST, UNPROCESSABLE_CONTENT (R >= Ri), NOT_FOUND, FORBIDDEN
   */
  create: protectedProcedure.input(createRiskAssessmentSchema).mutation(async ({ ctx, input }) => {
    const service = new RiskService(ctx.db, ctx.userId);
    // Convert deadline if it's a string
    const data = {
      ...input,
      deadline: input.deadline
        ? typeof input.deadline === 'string'
          ? new Date(input.deadline)
          : input.deadline
        : null,
    } as any;
    return service.create(data);
  }),

  /**
   * Get risk assessment by ID
   *
   * Input: { id: number }
   * Output: Risk assessment
   * Errors: NOT_FOUND, FORBIDDEN
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const service = new RiskService(ctx.db, ctx.userId);
      return service.getById(input.id);
    }),

  /**
   * List all risk assessments for a position
   *
   * Input: { positionId: number }
   * Output: RiskAssessment[] (ordered by high-risk first, then by R value)
   * Errors: NOT_FOUND (position), FORBIDDEN
   */
  listByPosition: protectedProcedure
    .input(listRisksByPositionSchema)
    .query(async ({ ctx, input }) => {
      const service = new RiskService(ctx.db, ctx.userId);
      return service.listByPosition(input.positionId);
    }),

  /**
   * Update risk assessment
   *
   * Recalculates Ri and R, re-validates reduction.
   *
   * Input: { id, ...updated fields }
   * Output: Updated risk assessment
   * Errors: NOT_FOUND, FORBIDDEN, BAD_REQUEST, UNPROCESSABLE_CONTENT
   */
  update: protectedProcedure
    .input(updateRiskAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const service = new RiskService(ctx.db, ctx.userId);
      // Convert deadline if it's a string
      const dataWithConvertedDeadline = {
        ...data,
        deadline: data.deadline
          ? typeof data.deadline === 'string'
            ? new Date(data.deadline)
            : data.deadline
          : null,
      } as any;
      return service.update(id, dataWithConvertedDeadline);
    }),

  /**
   * Soft delete risk assessment
   *
   * Input: { id: number }
   * Output: Deleted risk assessment
   * Errors: NOT_FOUND, FORBIDDEN
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const service = new RiskService(ctx.db, ctx.userId);
      return service.delete(input.id);
    }),

  /**
   * Calculate risk (helper for frontend real-time preview)
   *
   * Pure calculation function - does not persist to database.
   *
   * Input: { e, p, f }
   * Output: { risk: number, level: 'low' | 'medium' | 'high', isHighRisk: boolean }
   */
  calculateRisk: protectedProcedure.input(calculateRiskSchema).query(({ input }) => {
    const risk = calculateRisk(input.e, input.p, input.f);
    const level = risk <= 36 ? 'low' : risk <= 70 ? 'medium' : 'high';
    const isHighRisk = risk > 70;

    return { risk, level, isHighRisk };
  }),

  /**
   * Validate risk reduction (helper for frontend validation feedback)
   *
   * Checks R < Ri rule and provides errors/warnings.
   *
   * Input: { ei, pi, fi, e, p, f }
   * Output: { isValid, errors[], warnings[] }
   */
  validateReduction: protectedProcedure
    .input(validateRiskReductionSchema)
    .query(({ input }) => {
      const ri = calculateRisk(input.ei, input.pi, input.fi);
      const r = calculateRisk(input.e, input.p, input.f);

      return validateRiskReduction(ri, r);
    }),
});
