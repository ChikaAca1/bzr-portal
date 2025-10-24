import { pgTable, serial, integer, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { companies } from './companies';

/**
 * Work Positions Table
 *
 * Stores work position (radno mesto) information.
 * Maps to FR-002 requirements in spec.md.
 */
export const workPositions = pgTable('work_positions', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),

  // Position identification (FR-002)
  positionName: varchar('position_name', { length: 255 }).notNull(),
  department: varchar('department', { length: 255 }),
  positionCode: varchar('position_code', { length: 50 }),

  // Job description
  jobDescription: text('job_description'),
  workEnvironment: text('work_environment'),
  equipmentUsed: text('equipment_used'),
  hazardousMaterials: text('hazardous_materials'),

  // Education and qualifications
  requiredEducation: varchar('required_education', { length: 255 }),
  requiredExperience: varchar('required_experience', { length: 255 }),
  additionalQualifications: text('additional_qualifications'),

  // Work hours and conditions
  workSchedule: varchar('work_schedule', { length: 255 }), // e.g., "8-16h, radnim danima"
  shiftWork: boolean('shift_work').default(false),
  nightWork: boolean('night_work').default(false),
  overtimeFrequency: varchar('overtime_frequency', { length: 100 }),

  // Employee count
  maleCount: integer('male_count').default(0),
  femaleCount: integer('female_count').default(0),
  totalCount: integer('total_count').default(0),

  // Audit fields
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type WorkPosition = typeof workPositions.$inferSelect;
export type NewWorkPosition = typeof workPositions.$inferInsert;
