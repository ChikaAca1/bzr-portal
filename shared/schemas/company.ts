/**
 * Company Validation Schema (T028)
 *
 * Shared Zod schema for Company entity with Serbian PIB validation.
 * Maps to FR-001 requirements and data-model.md companies table.
 */

import { z } from 'zod';

// =============================================================================
// PIB Validation (Serbian Tax ID)
// =============================================================================

/**
 * Validate Serbian PIB (9-digit tax ID with modulo-11 checksum)
 *
 * Algorithm:
 * 1. First 8 digits are base number
 * 2. 9th digit is checksum calculated as: 11 - ((d1*7 + d2*6 + ... + d8*2) mod 11)
 * 3. If result is 10, PIB is invalid
 * 4. If result is 11, checksum is 0
 *
 * Example valid PIB: 106006801
 */
export function validatePIB(pib: string): boolean {
  // Check format: exactly 9 digits
  if (!/^\d{9}$/.test(pib)) {
    return false;
  }

  // Extract digits
  const digits = pib.split('').map(Number);
  const checksum = digits[8];

  // Calculate expected checksum
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * (7 - i);
  }

  const remainder = sum % 11;
  let expectedChecksum = 11 - remainder;

  // Special cases
  if (expectedChecksum === 10) {
    return false; // Invalid PIB
  }
  if (expectedChecksum === 11) {
    expectedChecksum = 0;
  }

  return checksum === expectedChecksum;
}

// =============================================================================
// Zod Schemas
// =============================================================================

/**
 * PIB validation schema
 */
export const pibSchema = z
  .string()
  .length(9, 'PIB мора имати тачно 9 цифара')
  .regex(/^\d{9}$/, 'PIB може садржати само цифре')
  .refine(validatePIB, {
    message: 'Неважећи PIB (провера контролне суме)',
  });

/**
 * Activity code validation (4-digit Serbian classification)
 */
export const activityCodeSchema = z
  .string()
  .length(4, 'Шифра делатности мора имати тачно 4 цифре')
  .regex(/^\d{4}$/, 'Шифра делатности може садржати само цифре');

/**
 * Company creation schema (POST /api/companies)
 */
export const createCompanySchema = z.object({
  // Required fields
  name: z
    .string()
    .min(3, 'Назив мора имати минимум 3 карактера')
    .max(255, 'Назив не може бити дужи од 255 карактера'),

  pib: pibSchema,

  activityCode: activityCodeSchema,

  address: z
    .string()
    .min(5, 'Адреса мора имати минимум 5 карактера')
    .max(500, 'Адреса не може бити дужа од 500 карактера'),

  director: z
    .string()
    .min(3, 'Име директора мора имати минимум 3 карактера')
    .max(255, 'Име директора не може бити дуже од 255 карактера'),

  bzrResponsiblePerson: z
    .string()
    .min(3, 'Име лица задуженог за БЗР мора имати минимум 3 карактера')
    .max(255, 'Име не може бити дуже од 255 карактера'),

  // Optional fields
  maticniBroj: z
    .string()
    .length(8, 'Матични број мора имати тачно 8 цифара')
    .regex(/^\d{8}$/, 'Матични број може садржати само цифре')
    .optional(),

  activityDescription: z.string().max(1000).optional(),

  city: z.string().max(100).optional(),

  postalCode: z
    .string()
    .max(10)
    .regex(/^\d{5}$/, 'Поштански број мора имати 5 цифара')
    .optional(),

  phone: z.string().max(50).optional(),

  email: z.string().email('Неважећа емаил адреса').max(255).optional(),

  directorJmbg: z
    .string()
    .length(13, 'ЈМБГ мора имати тачно 13 цифара')
    .regex(/^\d{13}$/, 'ЈМБГ може садржати само цифре')
    .optional(),

  bzrResponsibleJmbg: z
    .string()
    .length(13, 'ЈМБГ мора имати тачно 13 цифара')
    .regex(/^\d{13}$/, 'ЈМБГ може садржати само цифре')
    .optional(),

  employeeCount: z.string().max(10).optional(),

  organizationChart: z.string().url('Неважећа URL адреса').optional(),
});

/**
 * Company update schema (PUT /api/companies/:id)
 */
export const updateCompanySchema = createCompanySchema.partial();

/**
 * Company response schema
 */
export const companySchema = z.object({
  id: z.number(),
  userId: z.string(),
  name: z.string(),
  pib: z.string(),
  maticniBroj: z.string().nullable(),
  activityCode: z.string(),
  activityDescription: z.string().nullable(),
  address: z.string(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  director: z.string(),
  directorJmbg: z.string().nullable(),
  bzrResponsiblePerson: z.string(),
  bzrResponsibleJmbg: z.string().nullable(),
  employeeCount: z.string().nullable(),
  organizationChart: z.string().nullable(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type Company = z.infer<typeof companySchema>;
