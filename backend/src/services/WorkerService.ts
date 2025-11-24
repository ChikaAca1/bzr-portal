/**
 * Worker Service
 *
 * Business logic for Worker CRUD operations.
 * Workers are individual employees assigned to work positions.
 */

import { db, workers, type Worker, type NewWorker } from '../db';
import { eq, and } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';

export interface CreateWorkerInput {
  companyId: number;
  positionId?: number | null;
  fullName: string;
  jmbg?: string;
  gender: 'M' | 'F';
  dateOfBirth?: string;
  education?: string;
  coefficient?: string;
  yearsOfExperience?: string;
  notes?: string;
}

export interface UpdateWorkerInput extends Partial<CreateWorkerInput> {
  id: number;
}

export class WorkerService {
  /**
   * Create a new worker
   */
  static async create(input: CreateWorkerInput, userId: number): Promise<Worker> {
    try {
      const [worker] = await db
        .insert(workers)
        .values({
          companyId: input.companyId,
          positionId: input.positionId || null,
          fullName: input.fullName,
          jmbg: input.jmbg || null,
          gender: input.gender,
          dateOfBirth: input.dateOfBirth || null,
          education: input.education || null,
          coefficient: input.coefficient || null,
          yearsOfExperience: input.yearsOfExperience || null,
          notes: input.notes || null,
        })
        .returning();

      logInfo('Worker created', {
        workerId: worker.id,
        companyId: input.companyId,
        userId,
      });

      return worker;
    } catch (error) {
      logError('Failed to create worker', error as Error, {
        companyId: input.companyId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Create multiple workers at once
   */
  static async createMany(inputs: CreateWorkerInput[], userId: number): Promise<Worker[]> {
    if (inputs.length === 0) return [];

    try {
      const createdWorkers = await db
        .insert(workers)
        .values(
          inputs.map((input) => ({
            companyId: input.companyId,
            positionId: input.positionId || null,
            fullName: input.fullName,
            jmbg: input.jmbg || null,
            gender: input.gender,
            dateOfBirth: input.dateOfBirth || null,
            education: input.education || null,
            coefficient: input.coefficient || null,
            yearsOfExperience: input.yearsOfExperience || null,
            notes: input.notes || null,
          }))
        )
        .returning();

      logInfo('Workers created (batch)', {
        count: createdWorkers.length,
        companyId: inputs[0].companyId,
        userId,
      });

      return createdWorkers;
    } catch (error) {
      logError('Failed to create workers (batch)', error as Error, {
        count: inputs.length,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get worker by ID
   */
  static async getById(id: number, userId: number): Promise<Worker | null> {
    const worker = await db.query.workers.findFirst({
      where: and(eq(workers.id, id), eq(workers.isDeleted, false)),
    });

    return worker || null;
  }

  /**
   * List workers for a position
   */
  static async listByPosition(positionId: number, userId: number): Promise<Worker[]> {
    const workersList = await db.query.workers.findMany({
      where: and(eq(workers.positionId, positionId), eq(workers.isDeleted, false)),
      orderBy: (workers, { asc }) => [asc(workers.fullName)],
    });

    return workersList;
  }

  /**
   * List workers for a company
   */
  static async listByCompany(companyId: number, userId: number): Promise<Worker[]> {
    const workersList = await db.query.workers.findMany({
      where: and(eq(workers.companyId, companyId), eq(workers.isDeleted, false)),
      orderBy: (workers, { asc }) => [asc(workers.fullName)],
    });

    return workersList;
  }

  /**
   * Update worker
   */
  static async update(input: UpdateWorkerInput, userId: number): Promise<Worker> {
    const { id, ...updateData } = input;

    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error(`Радник са ID ${id} није пронађен.`);
    }

    try {
      const [updated] = await db
        .update(workers)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(workers.id, id))
        .returning();

      logInfo('Worker updated', {
        workerId: id,
        userId,
      });

      return updated;
    } catch (error) {
      logError('Failed to update worker', error as Error, {
        workerId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Soft delete worker
   */
  static async delete(id: number, userId: number): Promise<void> {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error(`Радник са ID ${id} није пронађен.`);
    }

    try {
      await db
        .update(workers)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
        })
        .where(eq(workers.id, id));

      logInfo('Worker soft deleted', {
        workerId: id,
        userId,
      });
    } catch (error) {
      logError('Failed to delete worker', error as Error, {
        workerId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Assign worker to position
   */
  static async assignToPosition(workerId: number, positionId: number, userId: number): Promise<Worker> {
    const existing = await this.getById(workerId, userId);
    if (!existing) {
      throw new Error(`Радник са ID ${workerId} није пронађен.`);
    }

    const [updated] = await db
      .update(workers)
      .set({
        positionId,
        updatedAt: new Date(),
      })
      .where(eq(workers.id, workerId))
      .returning();

    logInfo('Worker assigned to position', {
      workerId,
      positionId,
      userId,
    });

    return updated;
  }
}
