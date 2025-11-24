/**
 * Data Mapping Service
 *
 * Maps extracted data from OCR/AI into database entities.
 * Handles deduplication, validation, and smart merging of data.
 */

import { db } from '../db/index.js';
import { companies, NewCompany } from '../db/schema/companies.js';
import { workPositions, NewWorkPosition } from '../db/schema/work-positions.js';
import { workers, NewWorker } from '../db/schema/workers.js';
import { hazardTypes } from '../db/schema/hazards.js';
import { uploadedDocuments } from '../db/schema/uploaded-documents.js';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import type { ExtractedData } from './document-extraction.service.js';

/**
 * Mapping result showing what was created/updated
 */
export interface MappingResult {
  companyId?: number;
  companyCreated: boolean;
  companyUpdated: boolean;

  positionIds: number[];
  positionsCreated: number;
  positionsUpdated: number;

  workerIds: number[];
  workersCreated: number;
  workersUpdated: number;

  hazardsIdentified: number;

  errors: string[];
  warnings: string[];
}

/**
 * Map extracted data to database entities
 *
 * @param extractedData - Data extracted from document
 * @param userId - ID of user who uploaded document
 * @param documentId - ID of uploaded document record
 * @param companyId - Optional existing company ID (if known)
 * @returns Mapping result with IDs and counts
 */
export async function mapExtractedDataToDatabase(
  extractedData: ExtractedData,
  userId: number,
  documentId: number,
  companyId?: number
): Promise<MappingResult> {
  const result: MappingResult = {
    companyCreated: false,
    companyUpdated: false,
    positionIds: [],
    positionsCreated: 0,
    positionsUpdated: 0,
    workerIds: [],
    workersCreated: 0,
    workersUpdated: 0,
    hazardsIdentified: 0,
    errors: [],
    warnings: [],
  };

  try {
    logger.info({
      msg: 'Starting data mapping to database',
      documentId,
      userId,
      hasCompanyInfo: !!extractedData.companyInfo,
      positionsCount: extractedData.positions?.length || 0,
      employeesCount: extractedData.employees?.length || 0,
    });

    // Step 1: Handle company information
    if (extractedData.companyInfo && extractedData.companyInfo.name) {
      const companyResult = await mapCompanyInfo(
        extractedData.companyInfo,
        userId,
        companyId
      );

      result.companyId = companyResult.companyId;
      result.companyCreated = companyResult.created;
      result.companyUpdated = companyResult.updated;

      if (companyResult.warnings) {
        result.warnings.push(...companyResult.warnings);
      }
    } else if (companyId) {
      result.companyId = companyId;
    } else {
      result.warnings.push('No company information found in document and no companyId provided');
    }

    // Step 2: Handle work positions
    if (extractedData.positions && extractedData.positions.length > 0 && result.companyId) {
      const positionsResult = await mapWorkPositions(
        extractedData.positions,
        result.companyId
      );

      result.positionIds = positionsResult.positionIds;
      result.positionsCreated = positionsResult.created;
      result.positionsUpdated = positionsResult.updated;

      if (positionsResult.warnings) {
        result.warnings.push(...positionsResult.warnings);
      }
    }

    // Step 3: Handle employees/workers
    if (extractedData.employees && extractedData.employees.length > 0 && result.companyId) {
      const workersResult = await mapWorkers(
        extractedData.employees,
        result.companyId,
        result.positionIds
      );

      result.workerIds = workersResult.workerIds;
      result.workersCreated = workersResult.created;
      result.workersUpdated = workersResult.updated;

      if (workersResult.warnings) {
        result.warnings.push(...workersResult.warnings);
      }
    }

    // Step 4: Count identified hazards (for reporting)
    if (extractedData.hazards) {
      result.hazardsIdentified = extractedData.hazards.length;
    }

    // Update document record with mapping results
    await db
      .update(uploadedDocuments)
      .set({
        processingStatus: 'completed',
        processedAt: new Date(),
      })
      .where(eq(uploadedDocuments.id, documentId));

    logger.info({
      msg: 'Data mapping completed successfully',
      documentId,
      result,
    });

    return result;
  } catch (error) {
    logger.error({
      msg: 'Data mapping failed',
      error,
      documentId,
    });

    // Update document status to failed
    await db
      .update(uploadedDocuments)
      .set({
        processingStatus: 'failed',
        processingError: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(uploadedDocuments.id, documentId));

    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

/**
 * Map company information (create or update)
 */
async function mapCompanyInfo(
  companyInfo: NonNullable<ExtractedData['companyInfo']>,
  userId: number,
  existingCompanyId?: number
): Promise<{
  companyId: number;
  created: boolean;
  updated: boolean;
  warnings?: string[];
}> {
  const warnings: string[] = [];

  // If we have an existing company ID, try to update it
  if (existingCompanyId) {
    const existing = await db.query.companies.findFirst({
      where: and(
        eq(companies.id, existingCompanyId),
        eq(companies.isDeleted, false)
      ),
    });

    if (existing) {
      // Update only if we have new information
      const updates: Partial<NewCompany> = {};

      if (companyInfo.name && companyInfo.name !== existing.name) {
        updates.name = companyInfo.name;
      }
      if (companyInfo.pib && companyInfo.pib !== existing.pib) {
        updates.pib = companyInfo.pib;
      }
      if (companyInfo.address && companyInfo.address !== existing.address) {
        updates.address = companyInfo.address;
      }

      if (Object.keys(updates).length > 0) {
        await db
          .update(companies)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(companies.id, existingCompanyId));

        return {
          companyId: existingCompanyId,
          created: false,
          updated: true,
          warnings,
        };
      }

      return {
        companyId: existingCompanyId,
        created: false,
        updated: false,
        warnings,
      };
    }
  }

  // Try to find existing company by PIB or name
  let existingCompany = null;

  if (companyInfo.pib) {
    existingCompany = await db.query.companies.findFirst({
      where: and(
        eq(companies.pib, companyInfo.pib),
        eq(companies.userId, userId),
        eq(companies.isDeleted, false)
      ),
    });
  }

  if (!existingCompany && companyInfo.name) {
    existingCompany = await db.query.companies.findFirst({
      where: and(
        eq(companies.name, companyInfo.name),
        eq(companies.userId, userId),
        eq(companies.isDeleted, false)
      ),
    });
  }

  if (existingCompany) {
    warnings.push(`Company already exists: ${existingCompany.name} (PIB: ${existingCompany.pib})`);

    return {
      companyId: existingCompany.id,
      created: false,
      updated: false,
      warnings,
    };
  }

  // Validate required fields
  if (!companyInfo.name) {
    throw new Error('Company name is required');
  }
  if (!companyInfo.pib || companyInfo.pib.length !== 9) {
    warnings.push('Invalid PIB format (must be 9 digits)');
  }

  // Create new company
  const newCompany: NewCompany = {
    userId,
    name: companyInfo.name,
    pib: companyInfo.pib || '000000000', // Placeholder if missing
    address: companyInfo.address || '',
    activityCode: '0000', // TODO: Extract from document
    director: 'TBD', // Will be filled later
    bzrResponsiblePerson: 'TBD', // Will be filled later
  };

  const [created] = await db.insert(companies).values(newCompany).returning();

  return {
    companyId: created.id,
    created: true,
    updated: false,
    warnings,
  };
}

/**
 * Map work positions (create or update)
 */
async function mapWorkPositions(
  positions: NonNullable<ExtractedData['positions']>,
  companyId: number
): Promise<{
  positionIds: number[];
  created: number;
  updated: number;
  warnings?: string[];
}> {
  const positionIds: number[] = [];
  let created = 0;
  let updated = 0;
  const warnings: string[] = [];

  for (const position of positions) {
    try {
      // Try to find existing position by name
      const existing = await db.query.workPositions.findFirst({
        where: and(
          eq(workPositions.companyId, companyId),
          eq(workPositions.positionName, position.title),
          eq(workPositions.isDeleted, false)
        ),
      });

      if (existing) {
        // Update if we have new information
        const updates: Partial<NewWorkPosition> = {};

        if (position.description && position.description !== existing.jobDescription) {
          updates.jobDescription = position.description;
        }

        if (position.employeeCount && position.employeeCount !== existing.totalCount) {
          updates.totalCount = position.employeeCount;
        }

        if (Object.keys(updates).length > 0) {
          await db
            .update(workPositions)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(workPositions.id, existing.id));

          updated++;
        }

        positionIds.push(existing.id);
      } else {
        // Create new position
        const newPosition: NewWorkPosition = {
          companyId,
          positionName: position.title,
          jobDescription: position.description || null,
          totalCount: position.employeeCount || 0,
        };

        const [createdPosition] = await db
          .insert(workPositions)
          .values(newPosition)
          .returning();

        positionIds.push(createdPosition.id);
        created++;
      }
    } catch (error) {
      warnings.push(
        `Failed to map position "${position.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return { positionIds, created, updated, warnings };
}

/**
 * Map workers/employees (create or update)
 */
async function mapWorkers(
  employees: NonNullable<ExtractedData['employees']>,
  companyId: number,
  positionIds: number[]
): Promise<{
  workerIds: number[];
  created: number;
  updated: number;
  warnings?: string[];
}> {
  const workerIds: number[] = [];
  let created = 0;
  let updated = 0;
  const warnings: string[] = [];

  for (const employee of employees) {
    try {
      // Validate required fields
      if (!employee.name) {
        warnings.push('Skipping employee with no name');
        continue;
      }

      // Try to find existing worker by name and/or JMBG
      let existing = null;

      if (employee.jmbg) {
        existing = await db.query.workers.findFirst({
          where: and(
            eq(workers.companyId, companyId),
            eq(workers.jmbg, employee.jmbg),
            eq(workers.isDeleted, false)
          ),
        });
      }

      if (!existing) {
        existing = await db.query.workers.findFirst({
          where: and(
            eq(workers.companyId, companyId),
            eq(workers.fullName, employee.name),
            eq(workers.isDeleted, false)
          ),
        });
      }

      // Try to find matching position
      let positionId: number | null = null;
      if (employee.position && positionIds.length > 0) {
        const matchingPosition = await db.query.workPositions.findFirst({
          where: and(
            eq(workPositions.companyId, companyId),
            eq(workPositions.positionName, employee.position),
            eq(workPositions.isDeleted, false)
          ),
        });

        if (matchingPosition) {
          positionId = matchingPosition.id;
        }
      }

      if (existing) {
        // Update if we have new information
        const updates: Partial<NewWorker> = {};

        if (employee.jmbg && employee.jmbg !== existing.jmbg) {
          updates.jmbg = employee.jmbg;
        }

        if (positionId && positionId !== existing.positionId) {
          updates.positionId = positionId;
        }

        if (Object.keys(updates).length > 0) {
          await db
            .update(workers)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(workers.id, existing.id));

          updated++;
        }

        workerIds.push(existing.id);
      } else {
        // Determine gender from JMBG (if available)
        let gender: 'M' | 'F' = 'M';
        if (employee.jmbg && employee.jmbg.length === 13) {
          const genderDigit = parseInt(employee.jmbg.substring(9, 12));
          gender = genderDigit < 500 ? 'M' : 'F';
        }

        // Create new worker
        const newWorker: NewWorker = {
          companyId,
          positionId,
          fullName: employee.name,
          jmbg: employee.jmbg || null,
          gender,
        };

        const [createdWorker] = await db.insert(workers).values(newWorker).returning();

        workerIds.push(createdWorker.id);
        created++;
      }
    } catch (error) {
      warnings.push(
        `Failed to map worker "${employee.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return { workerIds, created, updated, warnings };
}

export const dataMappingService = {
  mapExtractedDataToDatabase,
};
