import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { workPositions } from './work-positions';

/**
 * Training Requirements Table
 *
 * Stores training (obuka) requirements for work positions.
 * Maps to FR-011 requirements in spec.md.
 */
export const trainingRequirements = pgTable('training_requirements', {
  id: serial('id').primaryKey(),
  positionId: integer('position_id')
    .notNull()
    .references(() => workPositions.id, { onDelete: 'cascade' }),

  // Training details (FR-011)
  trainingType: varchar('training_type', { length: 255 }).notNull(),
  // Types: "Osnovna obuka BZR", "Periodična obuka BZR", "Obuka za rad na visini",
  //        "Obuka za rad pod naponom", "Obuka za rukovanje opasnim materijama"

  frequency: varchar('frequency', { length: 100 }).notNull(), // e.g., "Godišnje", "Svake 3 godine"
  duration: varchar('duration', { length: 100 }), // e.g., "8 časova", "2 dana"
  requiredBeforeWork: boolean('required_before_work').default(false).notNull(),

  // Audit fields
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type TrainingRequirement = typeof trainingRequirements.$inferSelect;
export type NewTrainingRequirement = typeof trainingRequirements.$inferInsert;
