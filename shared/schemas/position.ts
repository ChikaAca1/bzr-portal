/**
 * WorkPosition Validation Schema (T029)
 *
 * Shared Zod schema for WorkPosition entity.
 * Maps to FR-002 requirements and data-model.md work_positions table.
 */

import { z } from 'zod';

// =============================================================================
// Zod Schemas
// =============================================================================

/**
 * Work position creation schema (POST /api/positions)
 */
export const createWorkPositionSchema = z.object({
  // Foreign key
  companyId: z.number().int().positive('ID компаније мора бити позитиван број'),

  // Required fields
  positionName: z
    .string()
    .min(3, 'Назив радног места мора имати минимум 3 карактера')
    .max(255, 'Назив не може бити дужи од 255 карактера'),

  requiredEducation: z
    .string()
    .min(1, 'Потребна стручна спрема је обавезна')
    .max(255, 'Стручна спрема не може бити дужа од 255 карактера'),

  // Optional fields
  positionCode: z.string().max(50, 'Шифра не може бити дужа од 50 карактера').optional(),

  department: z.string().max(255, 'Организациона целина не може бити дужа од 255 карактера').optional(),

  requiredExperience: z.string().max(255, 'Искуство не може бити дуже од 255 карактера').optional(),

  employeesMale: z
    .number()
    .int()
    .min(0, 'Број запослених мушкараца не може бити негативан')
    .default(0),

  employeesFemale: z
    .number()
    .int()
    .min(0, 'Број запослених жена не може бити негативан')
    .default(0),

  workHoursDaily: z
    .number()
    .min(1.0, 'Дневни радни сати морају бити најмање 1 сат')
    .max(12.0, 'Дневни радни сати не могу бити више од 12 сати')
    .default(8.0),

  workHoursWeekly: z
    .number()
    .min(5.0, 'Недељни радни сати морају бити најмање 5 сати')
    .max(60.0, 'Недељни радни сати не могу бити више од 60 сати (закон рада)')
    .default(40.0),

  shiftWork: z.boolean().default(false),

  nightWork: z.boolean().default(false),

  jobDescription: z.string().max(5000, 'Опис послова не може бити дужи од 5000 карактера').optional(),

  equipmentUsed: z
    .array(z.string().max(255))
    .max(50, 'Максимално 50 ставки опреме')
    .optional(),

  workspace: z.string().max(100, 'Радни простор не може бити дужи од 100 карактера').optional(),
});

/**
 * Work position update schema (PUT /api/positions/:id)
 */
export const updateWorkPositionSchema = createWorkPositionSchema.omit({ companyId: true }).partial();

/**
 * Work position response schema
 */
export const workPositionSchema = z.object({
  id: z.number(),
  companyId: z.number(),
  positionName: z.string(),
  positionCode: z.string().nullable(),
  department: z.string().nullable(),
  requiredEducation: z.string(),
  requiredExperience: z.string().nullable(),
  employeesMale: z.number(),
  employeesFemale: z.number(),
  employeesTotal: z.number(), // Computed field
  workHoursDaily: z.number(),
  workHoursWeekly: z.number(),
  shiftWork: z.boolean(),
  nightWork: z.boolean(),
  jobDescription: z.string().nullable(),
  equipmentUsed: z.array(z.string()).nullable(),
  workspace: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Work position with risk assessments (for document generation)
 */
export const workPositionWithRisksSchema = workPositionSchema.extend({
  riskAssessments: z.array(z.any()), // Will be RiskAssessment[] from risk.ts
  ppeItems: z.array(z.any()).optional(),
  trainingRequirements: z.array(z.any()).optional(),
  medicalExamRequirements: z.array(z.any()).optional(),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type CreateWorkPositionInput = z.infer<typeof createWorkPositionSchema>;
export type UpdateWorkPositionInput = z.infer<typeof updateWorkPositionSchema>;
export type WorkPosition = z.infer<typeof workPositionSchema>;
export type WorkPositionWithRisks = z.infer<typeof workPositionWithRisksSchema>;
