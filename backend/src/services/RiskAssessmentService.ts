/**
 * Risk Assessment Service (T048)
 *
 * Business logic for RiskAssessment CRUD with E×P×F validation.
 * Enforces: R < Ri (residual risk must be lower than initial)
 */

import { db } from '../db';
import { riskAssessments } from '../db/schema/risk-assessments';
import { eq, and } from 'drizzle-orm';
import { calculateRisk, getRiskLevel, validateRiskReduction } from '../lib/utils/risk-calculator';
import { logInfo, logError, logBusinessEvent } from '../lib/logger';

// =============================================================================
// Types
// =============================================================================

export interface CreateRiskAssessmentInput {
  positionId: number;
  hazardId: number;
  // Initial risk factors (E×P×F)
  ei: number;
  pi: number;
  fi: number;
  // Corrective measures
  correctiveMeasures: string;
  // Residual risk factors (after measures)
  e: number;
  p: number;
  f: number;
  // Optional
  responsiblePerson?: string;
}

export interface UpdateRiskAssessmentInput extends Partial<CreateRiskAssessmentInput> {
  id: number;
}

export interface RiskAssessmentWithHazard {
  id: number;
  positionId: number;
  hazardId: number;
  ei: number;
  pi: number;
  fi: number;
  ri: number;
  correctiveMeasures: string;
  e: number;
  p: number;
  f: number;
  r: number;
  responsiblePerson: string | null;
  implementationDeadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  hazard: {
    id: number;
    code: string;
    nameSr: string;
    nameEn: string | null;
    category: string;
  };
}

// =============================================================================
// Risk Assessment Service
// =============================================================================

export class RiskAssessmentService {
  /**
   * Validate risk assessment data before save
   *
   * Enforces:
   * - E, P, F values must be 1-6
   * - R < Ri (residual risk must be lower than initial)
   * - High initial risk (>70) must be reduced to acceptable level (≤70)
   *
   * @param input - Risk assessment data
   * @throws Error if validation fails
   */
  private static validateRiskAssessment(input: CreateRiskAssessmentInput): void {
    // Validate E×P×F range (1-6)
    const factors = [
      { name: 'E (Последице)', value: input.ei },
      { name: 'P (Вероватноћа)', value: input.pi },
      { name: 'F (Учесталост)', value: input.fi },
      { name: 'E резидуални', value: input.e },
      { name: 'P резидуални', value: input.p },
      { name: 'F резидуални', value: input.f },
    ];

    for (const factor of factors) {
      if (factor.value < 1 || factor.value > 6) {
        throw new Error(`${factor.name} мора бити између 1 и 6. Унета вредност: ${factor.value}`);
      }
    }

    // Calculate risks
    const initialRi = calculateRisk(input.ei, input.pi, input.fi);
    const residualR = calculateRisk(input.e, input.p, input.f);

    // Validate R < Ri
    if (!validateRiskReduction(initialRi, residualR)) {
      throw new Error(
        `Резидуални ризик (R=${residualR}) мора бити мањи од почетног ризика (Ri=${initialRi}). ` +
        `Корективне мере морају смањити ризик.`
      );
    }

    // Validate high risk reduction (>70 must be reduced to ≤70)
    if (initialRi > 70 && residualR > 70) {
      throw new Error(
        `Висок почетни ризик (Ri=${initialRi}) мора бити сведен на прихватљив ниво (≤70). ` +
        `Тренутни резидуални ризик: R=${residualR}`
      );
    }

    // Validate corrective measures
    if (!input.correctiveMeasures || input.correctiveMeasures.trim().length < 10) {
      throw new Error('Корективне мере морају имати минимум 10 карактера.');
    }
  }

  /**
   * Create a new risk assessment
   *
   * @param input - Risk assessment data
   * @param userId - User ID (for audit logging)
   * @returns Created risk assessment with calculated Ri and R
   * @throws Error if validation fails
   */
  static async create(input: CreateRiskAssessmentInput, userId: string): Promise<any> {
    // Validate risk assessment
    this.validateRiskAssessment(input);

    // Calculate risks
    const initialRi = calculateRisk(input.ei, input.pi, input.fi);
    const residualR = calculateRisk(input.e, input.p, input.f);

    try {
      // Check for duplicate (position + hazard)
      const existing = await db.query.riskAssessments.findFirst({
        where: and(
          eq(riskAssessments.positionId, input.positionId),
          eq(riskAssessments.hazardId, input.hazardId)
        ),
      });

      if (existing) {
        throw new Error(
          `Процена ризика за овај хазард већ постоји за радно место. ` +
          `Користите ажурирање уместо креирања нове.`
        );
      }

      // Insert risk assessment
      const [assessment] = await db
        .insert(riskAssessments)
        .values({
          ...input,
          ri: initialRi,
          r: residualR,
          isHighRisk: residualR > 70 || initialRi > 70,
        })
        .returning();

      logBusinessEvent('risk_assessment_created', parseInt(userId), input.positionId, {
        assessmentId: assessment.id,
        hazardId: input.hazardId,
        initialRi,
        residualR,
        riskLevel: getRiskLevel(residualR),
      });

      return assessment;
    } catch (error) {
      logError('Failed to create risk assessment', error as Error, {
        positionId: input.positionId,
        hazardId: input.hazardId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get risk assessment by ID
   *
   * @param id - Assessment ID
   * @returns Assessment or null
   */
  static async getById(id: number): Promise<any> {
    const assessment = await db.query.riskAssessments.findFirst({
      where: eq(riskAssessments.id, id),
    });

    return assessment || null;
  }

  /**
   * List risk assessments for a position
   *
   * @param positionId - Position ID
   * @returns Array of assessments with hazard details
   */
  static async listByPosition(positionId: number): Promise<any[]> {
    // TODO: Implement with Drizzle relations to include hazard data
    const assessments = await db.query.riskAssessments.findMany({
      where: eq(riskAssessments.positionId, positionId),
      orderBy: (riskAssessments, { desc }) => [desc(riskAssessments.r)], // High risk first
    });

    return assessments;
  }

  /**
   * Update risk assessment
   *
   * @param input - Update data with assessment ID
   * @param userId - User ID (for audit logging)
   * @returns Updated assessment
   * @throws Error if validation fails or assessment not found
   */
  static async update(input: UpdateRiskAssessmentInput, userId: string): Promise<any> {
    const { id, ...updateData } = input;

    // Verify assessment exists
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Процена ризика са ID ${id} није пронађена.`);
    }

    // If risk factors are being updated, validate the complete assessment
    if (
      updateData.ei !== undefined ||
      updateData.pi !== undefined ||
      updateData.fi !== undefined ||
      updateData.e !== undefined ||
      updateData.p !== undefined ||
      updateData.f !== undefined
    ) {
      // Merge with existing data for validation
      const mergedData = {
        positionId: existing.positionId,
        hazardId: existing.hazardId,
        ei: updateData.ei ?? existing.ei,
        pi: updateData.pi ?? existing.pi,
        fi: updateData.fi ?? existing.fi,
        correctiveMeasures: updateData.correctiveMeasures ?? existing.correctiveMeasures,
        e: updateData.e ?? existing.e,
        p: updateData.p ?? existing.p,
        f: updateData.f ?? existing.f,
        responsiblePerson: updateData.responsiblePerson,
      };

      this.validateRiskAssessment(mergedData);
    }

    try {
      // Recalculate ri and r if factors changed
      const ri = (updateData.ei || updateData.pi || updateData.fi)
        ? calculateRisk(
            updateData.ei ?? existing.ei,
            updateData.pi ?? existing.pi,
            updateData.fi ?? existing.fi
          )
        : existing.ri;

      const r = (updateData.e || updateData.p || updateData.f)
        ? calculateRisk(
            updateData.e ?? existing.e,
            updateData.p ?? existing.p,
            updateData.f ?? existing.f
          )
        : existing.r;

      const [updated] = await db
        .update(riskAssessments)
        .set({
          ...updateData,
          ri,
          r,
          isHighRisk: r > 70 || ri > 70,
          updatedAt: new Date(),
        })
        .where(eq(riskAssessments.id, id))
        .returning();

      logBusinessEvent('risk_assessment_updated', parseInt(userId), updated.positionId, {
        assessmentId: id,
        residualR: r,
        riskLevel: getRiskLevel(r),
      });

      return updated;
    } catch (error) {
      logError('Failed to update risk assessment', error as Error, {
        assessmentId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete risk assessment
   *
   * @param id - Assessment ID
   * @param userId - User ID (for audit logging)
   * @throws Error if assessment not found
   */
  static async delete(id: number, userId: string): Promise<void> {
    // Verify assessment exists
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Процена ризика са ID ${id} није пронађена.`);
    }

    try {
      await db.delete(riskAssessments).where(eq(riskAssessments.id, id));

      logBusinessEvent('risk_assessment_deleted', parseInt(userId), existing.positionId, {
        assessmentId: id,
        hazardId: existing.hazardId,
      });
    } catch (error) {
      logError('Failed to delete risk assessment', error as Error, {
        assessmentId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get risk statistics for a position
   *
   * @param positionId - Position ID
   * @returns Statistics object
   */
  static async getStatistics(positionId: number): Promise<{
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    averageInitialRisk: number;
    averageResidualRisk: number;
  }> {
    const assessments = await this.listByPosition(positionId);

    const stats = {
      totalRisks: assessments.length,
      highRisks: 0,
      mediumRisks: 0,
      lowRisks: 0,
      averageInitialRisk: 0,
      averageResidualRisk: 0,
    };

    if (assessments.length === 0) {
      return stats;
    }

    let totalInitial = 0;
    let totalResidual = 0;

    for (const assessment of assessments) {
      const initialRi = calculateRisk(assessment.ei, assessment.pi, assessment.fi);
      const residualR = calculateRisk(assessment.e, assessment.p, assessment.f);

      totalInitial += initialRi;
      totalResidual += residualR;

      const level = getRiskLevel(residualR);
      if (level === 'high') stats.highRisks++;
      else if (level === 'medium') stats.mediumRisks++;
      else stats.lowRisks++;
    }

    stats.averageInitialRisk = Math.round(totalInitial / assessments.length);
    stats.averageResidualRisk = Math.round(totalResidual / assessments.length);

    return stats;
  }
}
