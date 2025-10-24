/**
 * AI Hazard Suggestions Cache Schema (Phase 3b: T122)
 *
 * Semantic caching with pgvector for learning from previous AI suggestions.
 * Enables the system to recognize similar job descriptions and reuse results.
 *
 * Example: "čistač pijace" ≈ "manipulator otpadaka metlom" → same hazards
 */

import { pgTable, serial, varchar, text, jsonb, timestamp, integer, real, uuid } from 'drizzle-orm/pg-core';
import { companies } from './companies';

// =============================================================================
// AI Suggestions Cache Table
// =============================================================================

/**
 * Stores AI-generated hazard suggestions with semantic embeddings
 * for fast similarity search using pgvector.
 *
 * Note: The 'embedding' column uses pgvector's vector type.
 * You must enable pgvector extension in PostgreSQL:
 *   CREATE EXTENSION IF NOT EXISTS vector;
 */
export const aiHazardSuggestionsCache = pgTable('ai_hazard_suggestions_cache', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Multi-tenancy
  companyId: integer('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),

  // ===== Input Data =====
  positionName: varchar('position_name', { length: 255 }).notNull(),
  jobDescription: text('job_description').notNull(),
  equipment: jsonb('equipment').$type<string[]>().notNull(), // Array of equipment
  workspace: varchar('workspace', { length: 255 }).notNull(),
  workHours: jsonb('work_hours')
    .$type<{
      daily: number;
      shifts?: boolean;
      nightWork?: boolean;
      overtime?: boolean;
    }>()
    .notNull(),

  // ===== Semantic Search (pgvector) =====
  // Vector embedding of the job description (1536 dimensions for OpenAI text-embedding-3-small)
  // Note: Drizzle doesn't have native pgvector support yet, so we use text() and cast in raw SQL
  embedding: text('embedding').notNull(), // Will be stored as vector(1536) in PostgreSQL

  // ===== AI Result =====
  suggestions: jsonb('suggestions')
    .$type<
      Array<{
        hazardCode: string;
        confidence: number;
        rationale: string;
      }>
    >()
    .notNull(),

  aiProvider: varchar('ai_provider', { length: 50 }).notNull(), // 'deepseek', 'anthropic', 'openai'
  confidenceAvg: real('confidence_avg').notNull(), // Average confidence of suggestions

  // ===== Metadata & Usage Tracking =====
  usageCount: integer('usage_count').default(1).notNull(), // How many times reused
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
  createdBy: integer('created_by'), // User who created (optional)
});

// =============================================================================
// Type Exports
// =============================================================================

export type AIHazardSuggestionsCache = typeof aiHazardSuggestionsCache.$inferSelect;
export type NewAIHazardSuggestionsCache = typeof aiHazardSuggestionsCache.$inferInsert;
