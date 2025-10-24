import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';

/**
 * Error Handler Middleware
 *
 * Transforms errors into consistent tRPC error format.
 * Maps database errors, validation errors, and business logic errors.
 */

export function handleTRPCError(error: unknown): TRPCError {
  // Zod validation errors
  if (error instanceof ZodError) {
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Грешка валидације',
      cause: error,
    });
  }

  // Already a tRPC error
  if (error instanceof TRPCError) {
    return error;
  }

  // Database errors (Drizzle/Postgres)
  if (error instanceof Error) {
    // Unique constraint violation
    if (error.message.includes('unique constraint')) {
      return new TRPCError({
        code: 'CONFLICT',
        message: 'Ова вредност већ постоји у бази',
        cause: error,
      });
    }

    // Foreign key constraint violation
    if (error.message.includes('foreign key constraint')) {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Референцирани ресурс не постоји',
        cause: error,
      });
    }

    // Generic error
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      cause: error,
    });
  }

  // Unknown error
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Непозната грешка',
  });
}

/**
 * Business Logic Error
 *
 * For custom business rule violations (e.g., R >= Ri validation)
 */
export class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

export function throwBusinessLogicError(message: string): never {
  throw new TRPCError({
    code: 'UNPROCESSABLE_CONTENT',
    message,
  });
}

/**
 * Not Found Error
 */
export function throwNotFoundError(resource: string): never {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: `${resource} није пронађен`,
  });
}

/**
 * Forbidden Error (Row-level security)
 */
export function throwForbiddenError(): never {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Немате дозволу за приступ овом ресурсу',
  });
}
