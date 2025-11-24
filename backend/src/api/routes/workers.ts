import { router, protectedProcedure } from '../trpc/router';
import { WorkerService } from '../../services/WorkerService';
import { z } from 'zod';

/**
 * Workers tRPC Router
 *
 * Handles CRUD operations for individual workers.
 */

const createWorkerSchema = z.object({
  companyId: z.number().int().positive(),
  positionId: z.number().int().positive().nullable().optional(),
  fullName: z.string().min(2),
  jmbg: z.string().length(13).optional().or(z.literal('')),
  gender: z.enum(['M', 'F']),
  dateOfBirth: z.string().optional().or(z.literal('')),
  education: z.string().optional().or(z.literal('')),
  coefficient: z.string().optional().or(z.literal('')),
  yearsOfExperience: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

const createManyWorkersSchema = z.object({
  companyId: z.number().int().positive(),
  positionId: z.number().int().positive().nullable().optional(),
  workers: z.array(
    z.object({
      fullName: z.string().min(2),
      jmbg: z.string().length(13).optional().or(z.literal('')),
      gender: z.enum(['M', 'F']),
      dateOfBirth: z.string().optional().or(z.literal('')),
      education: z.string().optional().or(z.literal('')),
      coefficient: z.string().optional().or(z.literal('')),
      yearsOfExperience: z.string().optional().or(z.literal('')),
      notes: z.string().optional().or(z.literal('')),
    })
  ),
});

export const workersRouter = router({
  /**
   * Create new worker
   */
  create: protectedProcedure.input(createWorkerSchema).mutation(async ({ ctx, input }) => {
    return WorkerService.create(input, ctx.userId);
  }),

  /**
   * Create multiple workers at once
   */
  createMany: protectedProcedure.input(createManyWorkersSchema).mutation(async ({ ctx, input }) => {
    const { companyId, positionId, workers } = input;

    const workerInputs = workers.map((worker) => ({
      companyId,
      positionId: positionId || null,
      ...worker,
    }));

    return WorkerService.createMany(workerInputs, ctx.userId);
  }),

  /**
   * Get worker by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return WorkerService.getById(input.id, ctx.userId);
    }),

  /**
   * List workers by position
   */
  listByPosition: protectedProcedure
    .input(z.object({ positionId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return WorkerService.listByPosition(input.positionId, ctx.userId);
    }),

  /**
   * List workers by company
   */
  listByCompany: protectedProcedure
    .input(z.object({ companyId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return WorkerService.listByCompany(input.companyId, ctx.userId);
    }),

  /**
   * Update worker
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        fullName: z.string().min(2).optional(),
        jmbg: z.string().length(13).optional().or(z.literal('')),
        gender: z.enum(['M', 'F']).optional(),
        dateOfBirth: z.string().optional().or(z.literal('')),
        education: z.string().optional().or(z.literal('')),
        coefficient: z.string().optional().or(z.literal('')),
        yearsOfExperience: z.string().optional().or(z.literal('')),
        notes: z.string().optional().or(z.literal('')),
        positionId: z.number().int().positive().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return WorkerService.update(input, ctx.userId);
    }),

  /**
   * Delete worker (soft delete)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      return WorkerService.delete(input.id, ctx.userId);
    }),

  /**
   * Assign worker to position
   */
  assignToPosition: protectedProcedure
    .input(
      z.object({
        workerId: z.number().int().positive(),
        positionId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return WorkerService.assignToPosition(input.workerId, input.positionId, ctx.userId);
    }),
});
