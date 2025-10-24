import { z } from 'zod';

/**
 * Risk Assessment Validation Schema
 *
 * Maps to FR-004, FR-005, FR-006, FR-007 requirements and risks.contract.md
 *
 * Business Rules:
 * - E, P, F values must be integers 1-6
 * - Ri (initial risk) = Ei × Pi × Fi
 * - R (residual risk) = E × P × F
 * - R MUST be < Ri (mandatory risk reduction)
 * - If R > 70 OR Ri > 70: flag as high risk (повећан ризик)
 */

const epfValueSchema = z
  .number()
  .int('Вредност мора бити цео број')
  .min(1, 'Минимална вредност је 1')
  .max(6, 'Максимална вредност је 6');

export const createRiskAssessmentSchema = z
  .object({
    // Required fields
    positionId: z.number().int().positive('ID радног места је обавезан'),

    hazardId: z.number().int().positive('ID опасности је обавезан'),

    // Initial risk assessment (before mitigation)
    ei: epfValueSchema,
    pi: epfValueSchema,
    fi: epfValueSchema,

    // Corrective measures
    correctiveMeasures: z
      .string()
      .min(10, 'Корективне мере морају имати најмање 10 карактера')
      .max(5000, 'Корективне мере могу имати максимално 5000 карактера'),

    // Residual risk assessment (after mitigation)
    e: epfValueSchema,
    p: epfValueSchema,
    f: epfValueSchema,

    // Optional fields
    responsiblePerson: z.string().max(255).optional(),
    deadline: z.string().datetime().optional().or(z.date().optional()),
  })
  .refine(
    (data) => {
      // Calculate Ri and R
      const ri = data.ei * data.pi * data.fi;
      const r = data.e * data.p * data.f;

      // FR-006: R MUST be < Ri
      return r < ri;
    },
    {
      message:
        'Резидуални ризик (R) мора бити мањи од иницијалног ризика (Ri). Корективне мере нису ефикасне.',
      path: ['e'], // Show error on residual E field
    }
  );

export const updateRiskAssessmentSchema = z
  .object({
    id: z.number().int().positive(),
    positionId: z.number().int().positive().optional(),
    hazardId: z.number().int().positive().optional(),
    ei: epfValueSchema.optional(),
    pi: epfValueSchema.optional(),
    fi: epfValueSchema.optional(),
    correctiveMeasures: z.string().optional(),
    e: epfValueSchema.optional(),
    p: epfValueSchema.optional(),
    f: epfValueSchema.optional(),
    responsiblePerson: z.string().max(255).optional(),
    deadline: z.string().datetime().optional().or(z.date().optional()),
  })
  .refine(
    (data) => {
      if (!data.ei || !data.pi || !data.fi || !data.e || !data.p || !data.f) {
        return true;
      }
      const ri = data.ei * data.pi * data.fi;
      const r = data.e * data.p * data.f;
      return r < ri;
    },
    {
      message: 'Резидуални ризик (R) мора бити мањи од иницијалног ризика (Ri)',
      path: ['e'],
    }
  );

export const calculateRiskSchema = z.object({
  e: epfValueSchema,
  p: epfValueSchema,
  f: epfValueSchema,
});

export const validateRiskReductionSchema = z.object({
  ei: epfValueSchema,
  pi: epfValueSchema,
  fi: epfValueSchema,
  e: epfValueSchema,
  p: epfValueSchema,
  f: epfValueSchema,
});

export const listRisksByPositionSchema = z.object({
  positionId: z.number().int().positive(),
});

export type CreateRiskAssessmentInput = z.infer<typeof createRiskAssessmentSchema>;
export type UpdateRiskAssessmentInput = z.infer<typeof updateRiskAssessmentSchema>;
export type CalculateRiskInput = z.infer<typeof calculateRiskSchema>;
export type ValidateRiskReductionInput = z.infer<typeof validateRiskReductionSchema>;
export type ListRisksByPositionInput = z.infer<typeof listRisksByPositionSchema>;
