import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { workPositions } from './work-positions';

/**
 * PPE (Personal Protective Equipment) Items Table
 *
 * Stores PPE requirements for work positions.
 * Maps to FR-010 requirements in spec.md.
 */
export const ppeItems = pgTable('ppe_items', {
  id: serial('id').primaryKey(),
  positionId: integer('position_id')
    .notNull()
    .references(() => workPositions.id, { onDelete: 'cascade' }),

  // PPE details (FR-010)
  ppeType: varchar('ppe_type', { length: 255 }).notNull(), // e.g., "Zaštitne rukavice"
  enStandard: varchar('en_standard', { length: 100 }), // e.g., "EN 388:2016"
  quantity: integer('quantity').notNull().default(1),
  replacementPeriod: varchar('replacement_period', { length: 100 }), // e.g., "6 meseci"

  // Audit fields
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type PPEItem = typeof ppeItems.$inferSelect;
export type NewPPEItem = typeof ppeItems.$inferInsert;
