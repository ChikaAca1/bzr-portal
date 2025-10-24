import { pgTable, serial, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

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
 * Users Table (Phase 2.5: T040b)
 *
 * Stores user authentication and authorization data.
 * Implements JWT-based auth with RBAC (FR-028, FR-029, FR-030).
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  // Authentication
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(), // bcrypt/argon2 hash

  // Authorization (RBAC)
  role: userRoleEnum('role').default('viewer').notNull(),

  // Multi-tenancy: Row-Level Security (FR-030)
  // User can only access data from their assigned company
  companyId: serial('company_id').references(() => companies.id, { onDelete: 'cascade' }),

  // Profile
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

// Import companies for FK reference
import { companies } from './companies';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
