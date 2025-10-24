/**
 * Row-Level Security (RLS) Utilities (Phase 2.5: T040j)
 *
 * Filters database queries by user's company_id to enforce multi-tenant isolation.
 * Security requirement: FR-030
 *
 * Purpose: Users can only see/modify data from their own company.
 */

import { SQL, eq, and } from 'drizzle-orm';
import type { AccessTokenPayload } from './jwt';

/**
 * Create RLS filter for company-scoped data
 *
 * @param table - Drizzle table with companyId column
 * @param user - Authenticated user from JWT
 * @returns SQL condition to filter by companyId
 *
 * Usage:
 *   const user = requireAuthUser(c);
 *   const positions = await db
 *     .select()
 *     .from(workPositions)
 *     .where(rlsFilter(workPositions, user));
 */
export function rlsFilter(
  table: { companyId: any },
  user: AccessTokenPayload
): SQL | undefined {
  // Admin can see all data (no filter)
  if (user.role === 'admin' && user.companyId === null) {
    return undefined;
  }

  // All other users: filter by their companyId
  if (!user.companyId) {
    throw new Error('User does not have a company assigned');
  }

  return eq(table.companyId, user.companyId);
}

/**
 * Combine RLS filter with other WHERE conditions
 *
 * @param table - Drizzle table
 * @param user - Authenticated user
 * @param additionalConditions - Additional WHERE conditions
 * @returns Combined SQL condition
 *
 * Usage:
 *   const user = requireAuthUser(c);
 *   const activePositions = await db
 *     .select()
 *     .from(workPositions)
 *     .where(
 *       rlsWith(workPositions, user, eq(workPositions.isDeleted, false))
 *     );
 */
export function rlsWith(
  table: { companyId: any },
  user: AccessTokenPayload,
  ...additionalConditions: (SQL | undefined)[]
): SQL | undefined {
  const rlsCondition = rlsFilter(table, user);

  const validConditions = [rlsCondition, ...additionalConditions].filter(Boolean) as SQL[];

  if (validConditions.length === 0) {
    return undefined;
  }

  if (validConditions.length === 1) {
    return validConditions[0];
  }

  return and(...validConditions);
}

/**
 * Verify user owns a specific resource (by companyId)
 *
 * @param resourceCompanyId - Company ID of the resource
 * @param user - Authenticated user
 * @throws Error if user doesn't have access
 *
 * Usage:
 *   const position = await getPositionById(id);
 *   verifyOwnership(position.companyId, user); // Throws if not owned
 */
export function verifyOwnership(
  resourceCompanyId: number | null,
  user: AccessTokenPayload
): void {
  // Admin can access everything
  if (user.role === 'admin' && user.companyId === null) {
    return;
  }

  // Check if user's company matches resource company
  if (user.companyId !== resourceCompanyId) {
    throw new Error('Access denied: You do not have permission to access this resource');
  }
}
