/**
 * RiskAssessment Validation Schema (T030)
 *
 * Shared Zod schema for RiskAssessment entity with E×P×F validation.
 * Maps to FR-004, FR-005, FR-006, FR-007 requirements.
 */

import { z } from 'zod';

// =============================================================================
// E×P×F Factor Validation
// =============================================================================

/**
 * E (Consequences), P (Probability), F (Frequency) must be 1-6
 */
const epfFactorSchema = z
  .number()
  .int()
  .min(1, 'Вредност мора бити између 1 и 6')
  .max(6, 'Вредност мора бити између 1 и 6');

// =============================================================================
// Risk Level Enum
// =============================================================================

export const riskLevelEnum = z.enum(['low', 'medium', 'high']);

export type RiskLevel = z.infer<typeof riskLevelEnum>;

// =============================================================================
// Zod Schemas
// =============================================================================

/**
 * Risk assessment creation schema (POST /api/risks)
 */
export const createRiskAssessmentSchema = z
  .object({
    // Foreign keys
    positionId: z.number().int().positive('ID радног места мора бити позитиван број'),
    hazardId: z.number().int().positive('ID опасности мора бити позитиван број'),

    // Initial risk factors (E×P×F)
    initialE: epfFactorSchema,
    initialP: epfFactorSchema,
    initialF: epfFactorSchema,

    // Corrective measures
    correctiveMeasures: z
      .string()
      .min(10, 'Корективне мере морају имати минимум 10 карактера')
      .max(5000, 'Корективне мере не могу бити дуже од 5000 карактера'),

    // Residual risk factors (after measures)
    residualE: epfFactorSchema,
    residualP: epfFactorSchema,
    residualF: epfFactorSchema,

    // Optional: responsible person
    responsiblePerson: z
      .string()
      .max(255, 'Одговорно лице не може бити дуже од 255 карактера')
      .optional(),
  })
  .refine(
    (data) => {
      // Validation rule: Residual risk (R) must be less than initial risk (Ri)
      const initialRi = data.initialE * data.initialP * data.initialF;
      const residualR = data.residualE * data.residualP * data.residualF;
      return residualR < initialRi;
    },
    {
      message: 'Резидуални ризик (R) мора бити мањи од почетног ризика (Ri)',
      path: ['residualR'],
    }
  )
  .refine(
    (data) => {
      // Validation rule: High initial risk (>70) must be reduced to acceptable level (≤70)
      const initialRi = data.initialE * data.initialP * data.initialF;
      const residualR = data.residualE * data.residualP * data.residualF;

      if (initialRi > 70) {
        return residualR <= 70;
      }
      return true;
    },
    {
      message: 'Висок почетни ризик (>70) мора бити сведен на прихватљив ниво (≤70)',
      path: ['residualR'],
    }
  );

/**
 * Risk assessment update schema (PUT /api/risks/:id)
 */
export const updateRiskAssessmentSchema = createRiskAssessmentSchema.omit({
  positionId: true,
  hazardId: true,
}).partial();

/**
 * Risk assessment response schema
 */
export const riskAssessmentSchema = z.object({
  id: z.number(),
  positionId: z.number(),
  hazardId: z.number(),

  // Initial risk
  initialE: z.number(),
  initialP: z.number(),
  initialF: z.number(),
  initialRi: z.number(), // Computed: E×P×F

  // Corrective measures
  correctiveMeasures: z.string(),

  // Residual risk
  residualE: z.number(),
  residualP: z.number(),
  residualF: z.number(),
  residualR: z.number(), // Computed: E×P×F

  // Metadata
  responsiblePerson: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Risk assessment with hazard details (for display)
 */
export const riskAssessmentWithHazardSchema = riskAssessmentSchema.extend({
  hazard: z.object({
    id: z.number(),
    hazardCode: z.string(),
    hazardCategory: z.string(),
    hazardNameSr: z.string(),
    hazardNameEn: z.string().nullable(),
  }),
});

/**
 * Bulk risk assessment creation (multiple hazards for one position)
 */
export const bulkCreateRiskAssessmentsSchema = z.object({
  positionId: z.number().int().positive(),
  assessments: z.array(
    z.object({
      hazardId: z.number().int().positive(),
      initialE: epfFactorSchema,
      initialP: epfFactorSchema,
      initialF: epfFactorSchema,
      correctiveMeasures: z.string().min(10).max(5000),
      residualE: epfFactorSchema,
      residualP: epfFactorSchema,
      residualF: epfFactorSchema,
      responsiblePerson: z.string().max(255).optional(),
    })
  ),
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate risk level from risk value
 */
export function getRiskLevel(risk: number): RiskLevel {
  if (risk <= 36) return 'low';
  if (risk <= 70) return 'medium';
  return 'high';
}

/**
 * Get Serbian label for risk level
 */
export function getRiskLabelSr(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'Низак ризик';
    case 'medium':
      return 'Средњи ризик';
    case 'high':
      return 'Повећан ризик';
  }
}

/**
 * Get color for risk level (for UI)
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'green';
    case 'medium':
      return 'yellow';
    case 'high':
      return 'red';
  }
}

// =============================================================================
// TypeScript Types
// =============================================================================

export type CreateRiskAssessmentInput = z.infer<typeof createRiskAssessmentSchema>;
export type UpdateRiskAssessmentInput = z.infer<typeof updateRiskAssessmentSchema>;
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
export type RiskAssessmentWithHazard = z.infer<typeof riskAssessmentWithHazardSchema>;
export type BulkCreateRiskAssessmentsInput = z.infer<typeof bulkCreateRiskAssessmentsSchema>;
