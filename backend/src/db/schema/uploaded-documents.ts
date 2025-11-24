/**
 * Uploaded Documents Schema
 *
 * Tracks user-uploaded documents for AI extraction and knowledge base building.
 * Supports PDF, DOCX, and image files (scanned documents).
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { companies } from './companies';

export const uploadedDocuments = pgTable('uploaded_documents', {
  id: serial('id').primaryKey(),

  // Ownership
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  companyId: integer('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),

  // File metadata
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(), // 'pdf', 'docx', 'image'
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(), // bytes

  // Storage
  storageUrl: text('storage_url').notNull(), // Wasabi S3 URL
  storageKey: varchar('storage_key', { length: 500 }).notNull(), // S3 object key

  // Document classification
  documentType: varchar('document_type', { length: 100 }), // 'risk_assessment', 'employment_contract', 'org_chart', 'other'
  documentCategory: varchar('document_category', { length: 100 }), // 'source_document', 'reference', 'template'

  // Processing status
  processingStatus: varchar('processing_status', { length: 50 })
    .notNull()
    .default('pending'), // 'pending', 'processing', 'completed', 'failed'

  processingError: text('processing_error'),

  // AI extraction results
  extractedData: jsonb('extracted_data').$type<{
    positions?: Array<{
      title: string;
      description?: string;
      hazards?: string[];
      employeeCount?: number;
    }>;
    employees?: Array<{
      name: string;
      position?: string;
      jmbg?: string;
    }>;
    hazards?: Array<{
      description: string;
      category?: string;
      severity?: number;
    }>;
    protectiveMeasures?: string[];
    companyInfo?: {
      name?: string;
      pib?: string;
      address?: string;
    };
    rawText?: string; // Full extracted text for reference
  }>(),

  // Knowledge base
  addedToKnowledgeBase: boolean('added_to_knowledge_base')
    .notNull()
    .default(false),

  knowledgeBaseId: varchar('knowledge_base_id', { length: 100 }), // External KB reference

  // Metadata
  uploadedAt: timestamp('uploaded_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  processedAt: timestamp('processed_at', { withTimezone: true }),

  isDeleted: boolean('is_deleted')
    .notNull()
    .default(false),

  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Notes
  notes: text('notes'),
});

export type UploadedDocument = typeof uploadedDocuments.$inferSelect;
export type NewUploadedDocument = typeof uploadedDocuments.$inferInsert;
