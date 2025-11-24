import { eq } from 'drizzle-orm';
import { db, companies, workPositions, riskAssessments, hazardTypes } from '../db';
import { throwNotFoundError } from '../api/middleware/error-handler';
import { getRiskLevel, getRiskLevelLabelSr } from '../lib/utils/risk-calculator';
import fs from 'fs/promises';
import path from 'path';

/**
 * Document Generator Service
 *
 * Generates legally compliant "Akt o proceni rizika" DOCX documents.
 * Implements FR-008, FR-009 (8 mandatory sections per Pravilnik 5/2018).
 *
 * Template structure per constitution section 9.1:
 * 1. Cover Page
 * 2. Uvod (Introduction)
 * 3. Podaci o poslodavcu (Company Data)
 * 4. Organizaciona struktura (Organizational Structure)
 * 5. Sistematizacija radnih mesta (Position Systematization)
 * 6. Procena rizika po radnim mestima (Risk Assessment by Position)
 * 7. Zbirni prikaz (Summary)
 * 8. Prilozi (Appendices: PPE, Training, Medical Exams)
 * 9. Verifikacija (Verification & Signatures)
 */

type DB = typeof db;

interface DocumentData {
  company: {
    name: string;
    pib: string;
    address: string;
    city?: string | null;
    activityCode: string;
    activityDescription?: string | null;
    director: string;
    bzrResponsiblePerson: string;
    employeeCount?: string | null;
  };
  positions: Array<{
    positionName: string;
    department?: string | null;
    totalCount: number;
    maleCount: number;
    femaleCount: number;
    requiredEducation?: string | null;
    requiredExperience?: string | null;
    risks: Array<{
      hazardName: string;
      hazardCategory: string;
      ei: number;
      pi: number;
      fi: number;
      ri: number;
      correctiveMeasures: string;
      e: number;
      p: number;
      f: number;
      r: number;
      riskLevel: string;
      isHighRisk: boolean;
    }>;
  }>;
  summary: {
    totalPositions: number;
    totalRisks: number;
    highRiskPositions: number;
    lowRiskCount: number;
    mediumRiskCount: number;
    highRiskCount: number;
  };
  metadata: {
    generatedDate: string;
    validityPeriod: string; // 2 years per Član 32
  };
}

export class DocumentGeneratorService {
  constructor(private db: DB) {}

  /**
   * Generate risk assessment document for a company
   *
   * @param companyId - Company ID
   * @param userId - User ID (for authorization)
   * @returns Document data ready for template rendering
   */
  async generateDocumentData(companyId: number, userId: number): Promise<DocumentData> {
    // Get company
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId));

    if (!company) {
      throwNotFoundError('Предузеће');
    }

    // Verify ownership
    if (company.userId !== userId) {
      throw new Error('Forbidden');
    }

    // Get all positions for this company
    const positions = await this.db
      .select()
      .from(workPositions)
      .where(eq(workPositions.companyId, companyId));

    // Get risks for all positions with hazard details
    const positionsWithRisks = await Promise.all(
      positions.map(async (position) => {
        const risks = await this.db
          .select({
            hazardName: hazardTypes.nameSr,
            hazardCategory: hazardTypes.category,
            ei: riskAssessments.ei,
            pi: riskAssessments.pi,
            fi: riskAssessments.fi,
            ri: riskAssessments.ri,
            correctiveMeasures: riskAssessments.correctiveMeasures,
            e: riskAssessments.e,
            p: riskAssessments.p,
            f: riskAssessments.f,
            r: riskAssessments.r,
            isHighRisk: riskAssessments.isHighRisk,
          })
          .from(riskAssessments)
          .innerJoin(hazardTypes, eq(riskAssessments.hazardId, hazardTypes.id))
          .where(eq(riskAssessments.positionId, position.id));

        return {
          positionName: position.positionName,
          department: position.department,
          totalCount: position.totalCount || 0,
          maleCount: position.maleCount || 0,
          femaleCount: position.femaleCount || 0,
          requiredEducation: position.requiredEducation,
          requiredExperience: position.requiredExperience,
          risks: risks.map((risk) => ({
            ...risk,
            riskLevel: getRiskLevelLabelSr(getRiskLevel(risk.r)),
          })),
        };
      })
    );

    // Calculate summary statistics
    const allRisks = positionsWithRisks.flatMap((p) => p.risks);
    const lowRiskCount = allRisks.filter((r) => r.r <= 36).length;
    const mediumRiskCount = allRisks.filter((r) => r.r > 36 && r.r <= 70).length;
    const highRiskCount = allRisks.filter((r) => r.r > 70).length;
    const highRiskPositions = positionsWithRisks.filter((p) =>
      p.risks.some((r) => r.isHighRisk)
    ).length;

    // Current date and validity period
    const generatedDate = new Date().toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const validityDate = new Date();
    validityDate.setFullYear(validityDate.getFullYear() + 2);
    const validityPeriod = validityDate.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return {
      company: {
        name: company.name,
        pib: company.pib,
        address: company.address,
        city: company.city,
        activityCode: company.activityCode,
        activityDescription: company.activityDescription,
        director: company.director,
        bzrResponsiblePerson: company.bzrResponsiblePerson,
        employeeCount: company.employeeCount,
      },
      positions: positionsWithRisks,
      summary: {
        totalPositions: positions.length,
        totalRisks: allRisks.length,
        highRiskPositions,
        lowRiskCount,
        mediumRiskCount,
        highRiskCount,
      },
      metadata: {
        generatedDate,
        validityPeriod,
      },
    };
  }

  /**
   * Generate DOCX file (placeholder for now)
   *
   * TODO: Implement actual DOCX generation with docx-templates
   * This is T056 - will be implemented after template is created
   *
   * @param documentData - Document data
   * @returns File path or buffer
   */
  async generateDOCX(documentData: DocumentData): Promise<string> {
    // For now, return JSON as proof of concept
    // Real implementation will use docx-templates with akt-template.docx

    const outputDir = path.join(process.cwd(), 'storage', 'documents');
    await fs.mkdir(outputDir, { recursive: true });

    const filename = `akt-${documentData.company.pib}-${Date.now()}.json`;
    const filepath = path.join(outputDir, filename);

    await fs.writeFile(filepath, JSON.stringify(documentData, null, 2), 'utf-8');

    return filepath;
  }
}
