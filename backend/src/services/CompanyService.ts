/**
 * Company Service (T046)
 *
 * Business logic for Company CRUD operations with RLS enforcement.
 * Implements trial account limits via middleware.
 */

import { db, companies, type Company, type NewCompany } from '../db';
import { eq, and } from 'drizzle-orm';
import { validatePIBOrThrow, validateActivityCodeOrThrow } from '../lib/validators';
import { logInfo, logError } from '../lib/logger';

// =============================================================================
// Types
// =============================================================================

export interface CreateCompanyInput {
  userId: string;
  name: string;
  pib: string;
  activityCode: string;
  address: string;
  director: string;
  bzrResponsiblePerson: string;
  // Optional fields
  maticniBroj?: string;
  activityDescription?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  directorJmbg?: string;
  bzrResponsibleJmbg?: string;
  employeeCount?: string;
  organizationChart?: string;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: number;
}

// =============================================================================
// Company Service
// =============================================================================

export class CompanyService {
  /**
   * Create a new company
   *
   * Validates PIB and activity code before insertion.
   * Enforces RLS via userId.
   *
   * @param input - Company creation data
   * @returns Created company
   * @throws Error if validation fails or PIB already exists
   */
  static async create(input: CreateCompanyInput): Promise<Company> {
    // Validate PIB and activity code
    validatePIBOrThrow(input.pib);
    validateActivityCodeOrThrow(input.activityCode);

    try {
      // Check if PIB already exists
      const existing = await db.query.companies.findFirst({
        where: and(eq(companies.pib, input.pib), eq(companies.isDeleted, false)),
      });

      if (existing) {
        throw new Error(`Компанија са ПИБ-ом ${input.pib} већ постоји.`);
      }

      // Insert company
      const [company] = await db.insert(companies).values(input).returning();

      logInfo('Company created', {
        companyId: company.id,
        userId: input.userId,
        pib: input.pib,
      });

      return company;
    } catch (error) {
      logError('Failed to create company', error as Error, {
        userId: input.userId,
        pib: input.pib,
      });
      throw error;
    }
  }

  /**
   * Get company by ID
   *
   * Enforces RLS: Only returns company if userId matches
   *
   * @param id - Company ID
   * @param userId - User ID (for RLS)
   * @returns Company or null
   */
  static async getById(id: number, userId: string): Promise<Company | null> {
    const company = await db.query.companies.findFirst({
      where: and(
        eq(companies.id, id),
        eq(companies.userId, userId),
        eq(companies.isDeleted, false)
      ),
    });

    return company || null;
  }

  /**
   * List all companies for a user
   *
   * @param userId - User ID (for RLS)
   * @returns Array of companies
   */
  static async listByUser(userId: string): Promise<Company[]> {
    const companyList = await db.query.companies.findMany({
      where: and(eq(companies.userId, userId), eq(companies.isDeleted, false)),
      orderBy: (companies, { desc }) => [desc(companies.createdAt)],
    });

    return companyList;
  }

  /**
   * Update company
   *
   * Enforces RLS: Only updates if userId matches
   *
   * @param input - Update data with company ID
   * @returns Updated company
   * @throws Error if company not found or unauthorized
   */
  static async update(input: UpdateCompanyInput): Promise<Company> {
    const { id, ...updateData } = input;

    // Verify ownership
    const existing = await this.getById(id, input.userId!);
    if (!existing) {
      throw new Error(`Компанија са ID ${id} није пронађена или није доступна.`);
    }

    // Validate PIB if being updated
    if (updateData.pib) {
      validatePIBOrThrow(updateData.pib);
    }

    // Validate activity code if being updated
    if (updateData.activityCode) {
      validateActivityCodeOrThrow(updateData.activityCode);
    }

    try {
      const [updated] = await db
        .update(companies)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(companies.id, id), eq(companies.userId, input.userId!)))
        .returning();

      logInfo('Company updated', {
        companyId: id,
        userId: input.userId,
      });

      return updated;
    } catch (error) {
      logError('Failed to update company', error as Error, {
        companyId: id,
        userId: input.userId,
      });
      throw error;
    }
  }

  /**
   * Soft delete company
   *
   * Sets isDeleted flag instead of removing from database.
   * Cascades to related work positions.
   *
   * @param id - Company ID
   * @param userId - User ID (for RLS)
   * @throws Error if company not found or unauthorized
   */
  static async delete(id: number, userId: string): Promise<void> {
    // Verify ownership
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error(`Компанија са ID ${id} није пронађена или није доступна.`);
    }

    try {
      await db
        .update(companies)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
        })
        .where(and(eq(companies.id, id), eq(companies.userId, userId)));

      logInfo('Company soft deleted', {
        companyId: id,
        userId,
      });
    } catch (error) {
      logError('Failed to delete company', error as Error, {
        companyId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Count companies for a user (for trial limit checking)
   *
   * @param userId - User ID
   * @returns Count of active companies
   */
  static async countByUser(userId: string): Promise<number> {
    const result = await db.query.companies.findMany({
      where: and(eq(companies.userId, userId), eq(companies.isDeleted, false)),
    });

    return result.length;
  }
}
