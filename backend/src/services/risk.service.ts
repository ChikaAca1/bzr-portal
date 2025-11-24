import { eq, and } from 'drizzle-orm';
import {
  db,
  riskAssessments,
  workPositions,
  companies,
  type RiskAssessment,
  type NewRiskAssessment,
} from '../db';

type DB = typeof db;
import {
  calculateRisk,
  validateRiskReduction,
  type RiskValidationError,
} from '../lib/utils/risk-calculator';
import {
  throwNotFoundError,
  throwForbiddenError,
  throwBusinessLogicError,
} from '../api/middleware/error-handler';

/**
 * Risk Service
 *
 * Business logic for risk assessment management.
 * Implements E×P×F calculation methodology per FR-004, FR-005.
 * Enforces business rules per FR-006, FR-007.
 *
 * Maps to risks.contract.md requirements.
 */

export class RiskService {
  constructor(private db: DB, private userId: number) {}

  /**
   * Create new risk assessment
   *
   * Calculates Ri and R, validates reduction (R < Ri), flags high risk (R > 70).
   *
   * @param data - Risk assessment data (E, P, F values)
   * @returns Created risk assessment
   */
  async create(
    data: Omit<NewRiskAssessment, 'ri' | 'r' | 'isHighRisk'> & {
      deadline?: Date | string | null;
    }
  ): Promise<RiskAssessment> {
    // Verify position ownership
    await this.verifyPositionOwnership(data.positionId);

    // Calculate initial risk (Ri = Ei × Pi × Fi)
    const ri = calculateRisk(data.ei, data.pi, data.fi);

    // Calculate residual risk (R = E × P × F)
    const r = calculateRisk(data.e, data.p, data.f);

    // Validate risk reduction (FR-006)
    const validation = validateRiskReduction(ri, r);

    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err: RiskValidationError) => err.message)
        .join('; ');
      throwBusinessLogicError(errorMessage);
    }

    // Determine high risk flag (FR-007)
    const isHighRisk = r > 70 || ri > 70;

    // Convert deadline to Date if it's a string
    const deadline = data.deadline
      ? typeof data.deadline === 'string'
        ? new Date(data.deadline)
        : data.deadline
      : null;

    // Destructure to exclude deadline from spread
    const { deadline: _, ...dataWithoutDeadline } = data;

    // Create risk assessment
    const [risk] = await this.db
      .insert(riskAssessments)
      .values({
        ...dataWithoutDeadline,
        deadline,
        ri,
        r,
        isHighRisk,
      })
      .returning();

    if (!risk) {
      throw new Error('Failed to create risk assessment');
    }

    return risk;
  }

  /**
   * Get risk assessment by ID
   *
   * @param id - Risk assessment ID
   * @returns Risk assessment
   */
  async getById(id: number): Promise<RiskAssessment> {
    const [risk] = await this.db
      .select()
      .from(riskAssessments)
      .where(and(eq(riskAssessments.id, id), eq(riskAssessments.isDeleted, false)));

    if (!risk) {
      throwNotFoundError('Процена ризика');
    }

    // Verify ownership via position
    await this.verifyPositionOwnership(risk.positionId);

    return risk;
  }

  /**
   * List all risk assessments for a position
   *
   * @param positionId - Position ID
   * @returns List of risk assessments
   */
  async listByPosition(positionId: number): Promise<RiskAssessment[]> {
    // Verify position ownership
    await this.verifyPositionOwnership(positionId);

    return this.db
      .select()
      .from(riskAssessments)
      .where(
        and(eq(riskAssessments.positionId, positionId), eq(riskAssessments.isDeleted, false))
      )
      .orderBy(riskAssessments.isHighRisk, riskAssessments.r);
  }

  /**
   * Update risk assessment
   *
   * Recalculates Ri and R, re-validates reduction.
   *
   * @param id - Risk assessment ID
   * @param data - Updated risk data
   * @returns Updated risk assessment
   */
  async update(
    id: number,
    data: Partial<
      Omit<NewRiskAssessment, 'ri' | 'r' | 'isHighRisk'> & {
        deadline?: Date | string | null;
      }
    >
  ): Promise<RiskAssessment> {
    // Get existing risk
    const existing = await this.getById(id);

    // Merge with updates
    const merged = { ...existing, ...data };

    // Recalculate Ri and R
    const ri = calculateRisk(merged.ei, merged.pi, merged.fi);
    const r = calculateRisk(merged.e, merged.p, merged.f);

    // Validate risk reduction
    const validation = validateRiskReduction(ri, r);

    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err: RiskValidationError) => err.message)
        .join('; ');
      throwBusinessLogicError(errorMessage);
    }

    // Determine high risk flag
    const isHighRisk = r > 70 || ri > 70;

    // Convert deadline if provided
    const deadline = data.deadline
      ? typeof data.deadline === 'string'
        ? new Date(data.deadline)
        : data.deadline
      : undefined;

    // Destructure to exclude deadline from spread
    const { deadline: _, ...dataWithoutDeadline } = data;

    // Update - only include deadline if it was provided
    const updateData: any = {
      ...dataWithoutDeadline,
      ri,
      r,
      isHighRisk,
      updatedAt: new Date(),
    };

    if (deadline !== undefined) {
      updateData.deadline = deadline;
    }

    const [updated] = await this.db
      .update(riskAssessments)
      .set(updateData)
      .where(eq(riskAssessments.id, id))
      .returning();

    if (!updated) {
      throw new Error('Failed to update risk assessment');
    }

    return updated;
  }

  /**
   * Soft delete risk assessment
   *
   * @param id - Risk assessment ID
   * @returns Deleted risk assessment
   */
  async delete(id: number): Promise<RiskAssessment> {
    // Verify ownership
    await this.getById(id);

    const [deleted] = await this.db
      .update(riskAssessments)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(riskAssessments.id, id))
      .returning();

    if (!deleted) {
      throw new Error('Failed to delete risk assessment');
    }

    return deleted;
  }

  /**
   * Validate risk reduction (helper for frontend preview)
   *
   * Returns validation result without creating assessment.
   *
   * @param ei, pi, fi - Initial risk parameters
   * @param e, p, f - Residual risk parameters
   * @returns Validation result with errors and warnings
   */
  validateReduction(ei: number, pi: number, fi: number, e: number, p: number, f: number) {
    const ri = calculateRisk(ei, pi, fi);
    const r = calculateRisk(e, p, f);

    return validateRiskReduction(ri, r);
  }

  /**
   * Verify position ownership (row-level security)
   *
   * @param positionId - Position ID
   * @throws FORBIDDEN if user doesn't own position's company
   */
  private async verifyPositionOwnership(positionId: number): Promise<void> {
    const [position] = await this.db
      .select({
        id: workPositions.id,
        companyId: workPositions.companyId,
        userId: companies.userId,
      })
      .from(workPositions)
      .innerJoin(companies, eq(workPositions.companyId, companies.id))
      .where(and(eq(workPositions.id, positionId), eq(workPositions.isDeleted, false)));

    if (!position) {
      throwNotFoundError('Радно место');
    }

    if (position.userId !== this.userId) {
      throwForbiddenError();
    }
  }
}

