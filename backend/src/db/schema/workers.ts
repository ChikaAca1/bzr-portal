import { pgTable, serial, integer, varchar, text, timestamp, boolean, date } from 'drizzle-orm/pg-core';
import { workPositions } from './work-positions';
import { companies } from './companies';

/**
 * Workers Table
 *
 * Stores individual worker (radnik) information for each work position.
 * Each worker is assigned to a specific position and company.
 *
 * Maps to FR-014 requirements (Position wizard - Worker details step).
 */
export const workers = pgTable('workers', {
  id: serial('id').primaryKey(),

  // Foreign keys
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  positionId: integer('position_id')
    .references(() => workPositions.id, { onDelete: 'cascade' }),

  // Personal information
  fullName: varchar('full_name', { length: 255 }).notNull(),
  jmbg: varchar('jmbg', { length: 13 }), // Jedinstveni matični broj građana (Serbian ID)
  gender: varchar('gender', { length: 1 }).notNull(), // 'M' or 'F'
  dateOfBirth: date('date_of_birth'),

  // Professional information
  education: varchar('education', { length: 255 }), // Stručna sprema (e.g., "III", "IV", "VII/1")
  coefficient: varchar('coefficient', { length: 50 }), // Koeficijent složenosti posla
  yearsOfExperience: varchar('years_of_experience', { length: 50 }), // Radno iskustvo (godina)

  // Additional fields
  notes: text('notes'),

  // Audit fields
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type Worker = typeof workers.$inferSelect;
export type NewWorker = typeof workers.$inferInsert;
