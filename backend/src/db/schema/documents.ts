/**
 * Documents Table (Phase 2: T033)
 *
 * Tracks generated DOCX files for audit trail and download management.
 * Per spec.md:
 * - FR-052a: Document metadata tracking
 * - FR-052e: Pre-signed URL downloads (1-hour expiration)
 * - FR-033: 2-year audit trail retention per Član 32
 */

import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { workPositions } from './work-positions';

/**
 * Documents Table
 *
 * Stores metadata for all generated BZR Act documents.
 * Actual DOCX files stored in Wasabi S3 at: documents/{company_id}/{document_id}_{filename}
 */
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),

  // Multi-tenancy: RLS filtering by company_id
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),

  // Position reference (nullable for multi-position documents)
  positionId: integer('position_id').references(() => workPositions.id, { onDelete: 'set null' }),

  // File metadata
  filename: varchar('filename', { length: 255 }).notNull(), // Original filename with Serbian characters
  filePathS3: varchar('file_path_s3', { length: 500 }).notNull(), // S3 object key: documents/123/doc_456_filename.docx
  fileSizeBytes: integer('file_size_bytes').notNull(), // For storage quota tracking (Phase 6)
  mimeType: varchar('mime_type', { length: 100 }).default('application/vnd.openxmlformats-officedocument.wordprocessingml.document').notNull(),

  // Document generation metadata
  generationTimestamp: timestamp('generation_timestamp').defaultNow().notNull(), // When document was generated
  generationDurationMs: integer('generation_duration_ms'), // Time taken to generate (for <8s optimization tracking)
  version: integer('version').default(1).notNull(), // Document version (if regenerated)

  // Document type (future: support multiple document types)
  documentType: varchar('document_type', { length: 50 }).default('akt_procena_rizika').notNull(), // akt_procena_rizika, izvestaj, etc.

  // Deletion tracking (soft delete for audit trail)
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),

  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

/**
 * Document generation status enum (for async generation if needed)
 */
export type DocumentStatus = 'pending' | 'generating' | 'completed' | 'failed';
