import { pgTable, serial, varchar, timestamp, pgEnum, boolean, integer } from 'drizzle-orm/pg-core';

/**
 * User Roles Enum (RBAC per FR-029, FR-053b)
 *
 * Admin: Full system access, manage users
 * BZR Officer: Create/edit risk assessments, generate documents
 * HR Manager: View positions, manage employee data
 * Viewer: Read-only access to documents
 */
export const userRoleEnum = pgEnum('user_role', ['admin', 'bzr_officer', 'hr_manager', 'viewer']);

/**
 * Account Tier Enum (Trial vs Full Access per FR-028)
 */
export const accountTierEnum = pgEnum('account_tier', ['trial', 'verified', 'premium']);

/**
 * Users Table (Phase 2: T012)
 *
 * Stores user authentication and authorization data.
 * Implements JWT-based auth with RBAC (FR-028, FR-029, FR-030).
 * Trial account limits enforced at application layer.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  // Authentication
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(), // bcrypt hash
  emailVerified: boolean('email_verified').default(false).notNull(),

  // Authorization (RBAC)
  role: userRoleEnum().default('viewer').notNull(),

  // Multi-tenancy: Row-Level Security (FR-030)
  // User can only access data from their assigned company
  // Note: Foreign key constraint will be added in migration to avoid circular dependency
  companyId: integer('company_id'),

  // Profile
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  // Trial Account Management (FR-028a-d)
  accountTier: accountTierEnum().default('trial').notNull(),
  trialExpiryDate: timestamp('trial_expiry_date'), // 14 days from registration

  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
