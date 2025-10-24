import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { workPositions } from './work-positions';
import { hazardTypes } from './hazards';

/**
 * Risk Assessments Table
 *
 * Stores risk assessments for hazards identified at work positions.
 * Implements E×P×F risk calculation methodology per FR-004, FR-005.
 *
 * Risk Calculation:
 * - Ri (Initial Risk) = Ei × Pi × Fi
 * - R (Residual Risk) = E × P × F
 * - Validation: R < Ri (mandatory reduction)
 * - High Risk Flag: R > 70 OR Ri > 70 (povećan rizik requiring immediate action)
 */
export const riskAssessments = pgTable('risk_assessments', {
  id: serial('id').primaryKey(),
  positionId: integer('position_id')
    .notNull()
    .references(() => workPositions.id, { onDelete: 'cascade' }),
  hazardId: integer('hazard_id')
    .notNull()
    .references(() => hazardTypes.id),

  // Initial risk assessment (before corrective measures) - FR-004
  ei: integer('ei').notNull(), // Consequences (1-6)
  pi: integer('pi').notNull(), // Probability (1-6)
  fi: integer('fi').notNull(), // Frequency (1-6)
  ri: integer('ri').notNull(), // Calculated: Ei × Pi × Fi

  // Corrective measures - FR-006
  correctiveMeasures: text('corrective_measures').notNull(),

  // Residual risk assessment (after corrective measures) - FR-005
  e: integer('e').notNull(), // Consequences (1-6)
  p: integer('p').notNull(), // Probability (1-6)
  f: integer('f').notNull(), // Frequency (1-6)
  r: integer('r').notNull(), // Calculated: E × P × F

  // High risk flag - FR-007
  isHighRisk: boolean('is_high_risk').notNull(), // R > 70 OR Ri > 70

  // Responsible person for mitigation
  responsiblePerson: text('responsible_person'),
  deadline: timestamp('deadline'),

  // Audit fields
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type NewRiskAssessment = typeof riskAssessments.$inferInsert;
