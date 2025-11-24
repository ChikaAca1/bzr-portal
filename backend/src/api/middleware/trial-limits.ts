/**
 * Trial Account Limits Middleware (T018)
 *
 * Enforces trial account resource limits before expensive operations.
 * Requirements: FR-028a, FR-028b, FR-028c, FR-028d, FR-028e
 *
 * Trial Limits:
 * - Max 1 company
 * - Max 3 work positions
 * - Max 5 documents generated
 * - 14-day expiration
 */

import { Context } from 'hono';
import { db } from '../../db';
import { companies, workPositions } from '../../db/schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { requireAuthUser } from './auth';

// =============================================================================
// Configuration
// =============================================================================

const TRIAL_LIMITS = {
  maxCompanies: parseInt(process.env.TRIAL_MAX_COMPANIES || '1', 10),
  maxWorkPositions: parseInt(process.env.TRIAL_MAX_WORK_POSITIONS || '2', 10),
  maxDocuments: parseInt(process.env.TRIAL_MAX_DOCUMENTS || '1', 10),
  durationDays: parseInt(process.env.TRIAL_DURATION_DAYS || '3', 10),
};

// =============================================================================
// Trial Limit Enforcement
// =============================================================================

/**
 * Check if user's trial account has expired
 *
 * @param userCreatedAt - User account creation date
 * @returns boolean - true if trial expired
 */
export function isTrialExpired(userCreatedAt: Date): boolean {
  const now = new Date();
  const expirationDate = new Date(userCreatedAt);
  expirationDate.setDate(expirationDate.getDate() + TRIAL_LIMITS.durationDays);

  return now > expirationDate;
}

/**
 * Middleware: Enforce company creation limit (1 company max for trial)
 *
 * Usage: app.post('/api/companies', enforceCompanyLimit, ...)
 */
export async function enforceCompanyLimit(c: Context, next: Function) {
  const user = requireAuthUser(c);

  // Check current company count
  const result = await db
    .select({ count: count() })
    .from(companies)
    .where(eq(companies.userId, user.userId));

  const currentCount = result[0]?.count || 0;

  if (currentCount >= TRIAL_LIMITS.maxCompanies) {
    return c.json(
      {
        error: 'Trial Limit Exceeded',
        message: `Пробни налог дозвољава максимално ${TRIAL_LIMITS.maxCompanies} компанију. Надоградите налог за додатне компаније.`,
        trialLimit: TRIAL_LIMITS.maxCompanies,
        currentCount,
      },
      403
    );
  }

  await next();
}

/**
 * Middleware: Enforce work position creation limit (3 positions max for trial)
 *
 * Usage: app.post('/api/positions', enforceWorkPositionLimit, ...)
 */
export async function enforceWorkPositionLimit(c: Context, next: Function) {
  const user = requireAuthUser(c);

  // Get all companies owned by user
  const userCompanies = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.userId, user.userId));

  const companyIds = userCompanies.map((c) => c.id);

  if (companyIds.length === 0) {
    // No companies yet, allow creation
    await next();
    return;
  }

  // Count positions across all user companies
  const result = await db
    .select({ count: count() })
    .from(workPositions)
    .where(sql`${workPositions.companyId} IN ${companyIds}`);

  const currentCount = result[0]?.count || 0;

  if (currentCount >= TRIAL_LIMITS.maxWorkPositions) {
    return c.json(
      {
        error: 'Trial Limit Exceeded',
        message: `Пробни налог дозвољава максимално ${TRIAL_LIMITS.maxWorkPositions} радна места. Надоградите налог за више.`,
        trialLimit: TRIAL_LIMITS.maxWorkPositions,
        currentCount,
      },
      403
    );
  }

  await next();
}

/**
 * Middleware: Enforce document generation limit (5 documents max for trial)
 *
 * Usage: app.post('/api/documents/generate', enforceDocumentLimit, ...)
 */
export async function enforceDocumentLimit(c: Context, next: Function) {
  const user = requireAuthUser(c);

  // TODO: Implement document generation tracking table
  // For now, allow document generation (will be enforced in Phase 2.5)

  await next();
}

/**
 * Middleware: Check if trial account has expired
 *
 * Usage: app.use('*', checkTrialExpiration) - Apply globally
 */
export async function checkTrialExpiration(c: Context, next: Function) {
  const user = c.get('user'); // Optional auth

  if (!user) {
    // Not authenticated, skip check
    await next();
    return;
  }

  // TODO: Load user creation date from database
  // For now, skip check (will be implemented with full user management)

  await next();
}

/**
 * Get trial status for current user
 *
 * Usage in handlers to display trial info banner
 */
export async function getTrialStatus(userId: number) {
  // Get company count
  const companyResult = await db
    .select({ count: count() })
    .from(companies)
    .where(eq(companies.userId, userId));

  const companyCount = companyResult[0]?.count || 0;

  // Get position count
  const userCompanies = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.userId, userId));

  const companyIds = userCompanies.map((c) => c.id);

  let positionCount = 0;
  if (companyIds.length > 0) {
    const positionResult = await db
      .select({ count: count() })
      .from(workPositions)
      .where(sql`${workPositions.companyId} IN ${companyIds}`);

    positionCount = positionResult[0]?.count || 0;
  }

  // TODO: Get document count from document_generations table

  return {
    companies: {
      current: companyCount,
      max: TRIAL_LIMITS.maxCompanies,
      remaining: TRIAL_LIMITS.maxCompanies - companyCount,
    },
    workPositions: {
      current: positionCount,
      max: TRIAL_LIMITS.maxWorkPositions,
      remaining: TRIAL_LIMITS.maxWorkPositions - positionCount,
    },
    documents: {
      current: 0, // TODO: Implement
      max: TRIAL_LIMITS.maxDocuments,
      remaining: TRIAL_LIMITS.maxDocuments,
    },
    daysRemaining: TRIAL_LIMITS.durationDays, // TODO: Calculate based on user.createdAt
  };
}
