import { pgTable, serial, integer, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { workPositions } from './work-positions';

/**
 * Medical Examination Requirements Table
 *
 * Stores medical examination (lekarski pregled) requirements for work positions.
 * Maps to FR-012 requirements in spec.md.
 */
export const medicalExamRequirements = pgTable('medical_exam_requirements', {
  id: serial('id').primaryKey(),
  positionId: integer('position_id')
    .notNull()
    .references(() => workPositions.id, { onDelete: 'cascade' }),

  // Medical exam details (FR-012)
  examType: varchar('exam_type', { length: 255 }).notNull(),
  // Types: "Preventivni pregled", "Periodični pregled", "Vanredni pregled"

  frequency: varchar('frequency', { length: 100 }).notNull(),
  // For high-risk positions (R > 70): minimum "Godišnje"
  // For normal positions: "Svake 2 godine" or "Svake 3 godine"

  scope: text('scope'), // e.g., "Opšti zdravstveni pregled, testovi vida i sluha"

  // Audit fields
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type MedicalExamRequirement = typeof medicalExamRequirements.$inferSelect;
export type NewMedicalExamRequirement = typeof medicalExamRequirements.$inferInsert;
