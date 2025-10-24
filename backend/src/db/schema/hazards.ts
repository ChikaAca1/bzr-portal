import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Hazard Types (Reference Data)
 *
 * Immutable reference table with 45+ standardized hazard codes
 * per Serbian BZR regulations.
 *
 * Categories: Mechanical, Electrical, Chemical, Biological, Ergonomic,
 * Psychosocial, Organizational, Environmental
 */
export const hazardTypes = pgTable('hazard_types', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  nameSr: varchar('name_sr', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
  typicalMeasures: text('typical_measures'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type HazardType = typeof hazardTypes.$inferSelect;
export type NewHazardType = typeof hazardTypes.$inferInsert;
