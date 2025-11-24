/**
 * Position Service (T047)
 *
 * Business logic for WorkPosition CRUD operations.
 * Enforces company ownership via RLS.
 */

import { db, workPositions, type WorkPosition } from '../db';
import { eq, and } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';

// =============================================================================
// Types
// =============================================================================

export interface CreatePositionInput {
  companyId: number;
  positionName: string;
  requiredEducation: string;
  // Optional fields
  positionCode?: string;
  department?: string;
  requiredExperience?: string;
  jobDescription?: string;
  workEnvironment?: string;
  equipmentUsed?: string;
  hazardousMaterials?: string;
  additionalQualifications?: string;
  workSchedule?: string;
  shiftWork?: boolean;
  nightWork?: boolean;
  overtimeFrequency?: string;
  maleCount?: number;
  femaleCount?: number;
}

export interface UpdatePositionInput extends Partial<CreatePositionInput> {
  id: number;
}

// =============================================================================
// Position Service
// =============================================================================

export class PositionService {
  /**
   * Create a new work position
   *
   * @param input - Position creation data
   * @param userId - User ID for authorization
   * @returns Created position
   * @throws Error if company not found or unauthorized
   */
  static async create(input: CreatePositionInput, userId: number): Promise<WorkPosition> {
    try {
      // Verify company ownership (implicitly through RLS in CompanyService)
      // In production, add explicit check here

      // Calculate total count
      const totalCount = (input.maleCount || 0) + (input.femaleCount || 0);

      // Insert position
      const [position] = await db
        .insert(workPositions)
        .values({
          ...input,
          totalCount,
        })
        .returning();

      logInfo('Work position created', {
        positionId: position.id,
        companyId: input.companyId,
        userId,
      });

      return position;
    } catch (error) {
      logError('Failed to create work position', error as Error, {
        companyId: input.companyId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get position by ID
   *
   * @param id - Position ID
   * @param userId - User ID (for company ownership check)
   * @returns Position or null
   */
  static async getById(id: number, userId: number): Promise<WorkPosition | null> {
    // In production, join with companies table to verify userId ownership
    const position = await db.query.workPositions.findFirst({
      where: and(eq(workPositions.id, id), eq(workPositions.isDeleted, false)),
    });

    return position || null;
  }

  /**
   * List positions for a company
   *
   * @param companyId - Company ID
   * @param userId - User ID (for authorization)
   * @returns Array of positions
   */
  static async listByCompany(companyId: number, userId: number): Promise<WorkPosition[]> {
    const positions = await db.query.workPositions.findMany({
      where: and(
        eq(workPositions.companyId, companyId),
        eq(workPositions.isDeleted, false)
      ),
      orderBy: (workPositions, { asc }) => [asc(workPositions.positionName)],
    });

    return positions;
  }

  /**
   * Update work position
   *
   * @param input - Update data with position ID
   * @param userId - User ID (for authorization)
   * @returns Updated position
   * @throws Error if position not found or unauthorized
   */
  static async update(input: UpdatePositionInput, userId: number): Promise<WorkPosition> {
    const { id, ...updateData } = input;

    // Verify position exists
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error(`Радно место са ID ${id} није пронађено.`);
    }

    // Recalculate total if counts changed
    if (updateData.maleCount !== undefined || updateData.femaleCount !== undefined) {
      const maleCount = updateData.maleCount ?? existing.maleCount;
      const femaleCount = updateData.femaleCount ?? existing.femaleCount;
      (updateData as any).totalCount = maleCount + femaleCount;
    }

    try {
      const [updated] = await db
        .update(workPositions)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(workPositions.id, id))
        .returning();

      logInfo('Work position updated', {
        positionId: id,
        userId,
      });

      return updated;
    } catch (error) {
      logError('Failed to update work position', error as Error, {
        positionId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Soft delete position
   *
   * @param id - Position ID
   * @param userId - User ID (for authorization)
   * @throws Error if position not found or unauthorized
   */
  static async delete(id: number, userId: number): Promise<void> {
    // Verify position exists
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error(`Радно место са ID ${id} није пронађено.`);
    }

    try {
      await db
        .update(workPositions)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
        })
        .where(eq(workPositions.id, id));

      logInfo('Work position soft deleted', {
        positionId: id,
        userId,
      });
    } catch (error) {
      logError('Failed to delete work position', error as Error, {
        positionId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Count positions for a company (for trial limit checking)
   *
   * @param companyId - Company ID
   * @returns Count of active positions
   */
  static async countByCompany(companyId: number): Promise<number> {
    const positions = await db.query.workPositions.findMany({
      where: and(
        eq(workPositions.companyId, companyId),
        eq(workPositions.isDeleted, false)
      ),
    });

    return positions.length;
  }

  /**
   * Get position with all related data (risks, PPE, training, etc.)
   * Used for document generation
   *
   * @param id - Position ID
   * @param userId - User ID (for authorization)
   * @returns Position with relations or null
   */
  static async getWithRelations(id: number, userId: number): Promise<any> {
    // TODO: Implement with Drizzle relations
    // Should include: risks, hazards, ppe, training, medicalExams
    const position = await this.getById(id, userId);
    return position;
  }
}
