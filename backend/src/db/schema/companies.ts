import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { accountTierEnum } from './users';

/**
 * Companies Table (Phase 2: T013)
 *
 * Stores employer (poslodavac) information for BZR Act documents.
 * Maps to FR-001 requirements in spec.md.
 * Trial limits: 1 company, 3 positions, 5 documents per FR-028b.
 */
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // For row-level security

  // Company identification (FR-001)
  name: varchar('name', { length: 255 }).notNull(),
  pib: varchar('pib', { length: 9 }).notNull(), // Serbian tax ID (9 digits, modulo-11 checksum)
  maticniBroj: varchar('maticni_broj', { length: 8 }), // Company registration number
  activityCode: varchar('activity_code', { length: 4 }).notNull(), // 4-digit šifra delatnosti
  activityDescription: text('activity_description'),

  // Contact information
  address: varchar('address', { length: 500 }).notNull(),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),

  // Responsible persons
  director: varchar('director', { length: 255 }).notNull(),
  directorJmbg: varchar('director_jmbg', { length: 255 }), // Encrypted JMBG (AES-256-GCM)
  bzrResponsiblePerson: varchar('bzr_responsible_person', { length: 255 }).notNull(),
  bzrResponsibleJmbg: varchar('bzr_responsible_jmbg', { length: 255 }), // Encrypted JMBG

  // Additional info
  employeeCount: varchar('employee_count', { length: 10 }),
  organizationChart: text('organization_chart'), // URL or file path

  // Trial Account Limits (FR-028b)
  accountTier: accountTierEnum('account_tier').default('trial').notNull(),
  trialExpiryDate: timestamp('trial_expiry_date'), // 14 days from registration
  documentGenerationCount: integer('document_generation_count').default(0).notNull(), // Max 5 for trial
  workPositionCount: integer('work_position_count').default(0).notNull(), // Max 3 for trial

  // Audit fields
  isDeleted: boolean('is_deleted').default(false).notNull(), // Soft delete (FR-015)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
