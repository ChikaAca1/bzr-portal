import { z } from 'zod';
/**
 * Work Position Validation Schema
 *
 * Maps to FR-002 requirements and positions.contract.md
 */
export const createPositionSchema = z.object({
    // Required fields
    companyId: z.number().int().positive('ID предузећа је обавезан'),
    positionName: z
        .string()
        .min(2, 'Назив радног места мора имати најмање 2 карактера')
        .max(255, 'Назив радног места може имати максимално 255 карактера'),
    // Optional fields
    department: z.string().max(255).optional(),
    positionCode: z.string().max(50).optional(),
    jobDescription: z.string().max(5000).optional(),
    workEnvironment: z.string().max(2000).optional(),
    equipmentUsed: z.string().max(2000).optional(),
    hazardousMaterials: z.string().max(2000).optional(),
    requiredEducation: z.string().max(255).optional(),
    requiredExperience: z.string().max(255).optional(),
    additionalQualifications: z.string().max(2000).optional(),
    workSchedule: z.string().max(255).optional(),
    shiftWork: z.boolean().default(false),
    nightWork: z.boolean().default(false),
    overtimeFrequency: z.string().max(100).optional(),
    maleCount: z.number().int().min(0, 'Број мушкараца не може бити негативан').default(0),
    femaleCount: z.number().int().min(0, 'Број жена не може бити негативан').default(0),
    totalCount: z.number().int().min(0, 'Укупан број не може бити негативан').default(0),
});
export const updatePositionSchema = createPositionSchema.partial().extend({
    id: z.number().int().positive(),
});
export const listPositionsByCompanySchema = z.object({
    companyId: z.number().int().positive(),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    search: z.string().max(255).optional(),
});
