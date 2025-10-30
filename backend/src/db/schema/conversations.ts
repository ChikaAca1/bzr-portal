/**
 * Conversations Schema
 *
 * Stores AI chat conversations for:
 * - Sales conversations (landing page)
 * - Document creation workflows
 * - Help/support chats
 * - Lead capture data
 */

import { pgTable, serial, integer, text, timestamp, json, varchar, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { documents } from './documents';

/**
 * conversations - Main conversation sessions
 *
 * RLS Policy: Users can only access their own conversations (user_id)
 * Anonymous users (sales mode) have session_id only, no user_id
 */
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),

  // User reference (NULL for anonymous sales conversations)
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),

  // Session ID for anonymous users
  sessionId: varchar('session_id', { length: 255 }).notNull().unique(),

  // Conversation mode
  mode: varchar('mode', { length: 50 }).notNull(), // 'sales' | 'document_creation' | 'help'

  // Status
  status: varchar('status', { length: 50 }).default('active').notNull(), // 'active' | 'completed' | 'abandoned'

  // Lead data captured during sales conversations
  leadData: json('lead_data').$type<{
    name?: string;
    email?: string;
    companyName?: string;
    phoneNumber?: string;
    industryCode?: string;
    employeeCount?: string;
    notes?: string;
  }>(),

  // Document created from this conversation (if any)
  documentId: integer('document_id').references(() => documents.id, { onDelete: 'set null' }),

  // AI cost tracking
  totalTokensInput: integer('total_tokens_input').default(0),
  totalTokensOutput: integer('total_tokens_output').default(0),
  totalCostUsd: text('total_cost_usd').default('0.00'), // Stored as string for precision

  // Timestamps
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  lastMessageAt: timestamp('last_message_at').defaultNow(),

  // Metadata (for analytics)
  metadata: json('metadata').$type<{
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    language?: string;
  }>(),
});

/**
 * conversation_messages - Individual messages in conversations
 *
 * Stores full conversation history for:
 * - Training AI models
 * - Debugging
 * - Lead qualification analysis
 * - Customer support
 */
export const conversationMessages = pgTable('conversation_messages', {
  id: serial('id').primaryKey(),

  // Conversation reference
  conversationId: integer('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),

  // Message metadata
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'

  // Message content
  content: text('content').notNull(),

  // Attachments (images, files)
  attachments: json('attachments').$type<
    Array<{
      type: 'image' | 'document' | 'file';
      url: string;
      filename?: string;
      mimeType?: string;
      size?: number;
      ocrText?: string; // Extracted text if OCR was performed
    }>
  >(),

  // AI provider used for this message
  aiProvider: varchar('ai_provider', { length: 50 }), // 'deepseek' | 'gpt-4' | 'claude'
  aiModel: varchar('ai_model', { length: 100 }),

  // Token usage for this specific message
  tokensInput: integer('tokens_input'),
  tokensOutput: integer('tokens_output'),
  costUsd: text('cost_usd'), // Cost for this message

  // Function calls made by AI
  functionCalls: json('function_calls').$type<
    Array<{
      name: string;
      arguments: Record<string, unknown>;
      result?: unknown;
    }>
  >(),

  // Error tracking
  error: text('error'),
  retryCount: integer('retry_count').default(0),

  // Timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * document_templates - AI-generated document templates
 *
 * When AI creates a new type of document, it becomes a template candidate.
 * Admin approves → available to all users as knowledge base.
 *
 * RLS Policy: All users can READ approved templates, only admins can WRITE/UPDATE
 */
export const documentTemplates = pgTable('document_templates', {
  id: serial('id').primaryKey(),

  // Template metadata
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  documentType: varchar('document_type', { length: 100 }).notNull(), // 'akt_procena_rizika' | 'obrazac_6' | etc.

  // Template data (Mustache structure)
  templateData: json('template_data').notNull().$type<{
    sections: Array<{
      title: string;
      content: string;
      mustacheVariables: string[];
    }>;
    requiredFields: string[];
    optionalFields: string[];
  }>(),

  // Creator
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdFromConversationId: integer('created_from_conversation_id').references(
    () => conversations.id,
    { onDelete: 'set null' }
  ),

  // Approval workflow
  status: varchar('status', { length: 50 }).default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  approvedBy: integer('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),

  // Usage analytics
  usageCount: integer('usage_count').default(0).notNull(),
  lastUsedAt: timestamp('last_used_at'),

  // Vector embedding for similarity search (pgvector)
  // Note: Requires pgvector extension installed
  // embedding: vector('embedding', { dimensions: 1536 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Metadata
  metadata: json('metadata').$type<{
    averageGenerationTimeMs?: number;
    legalRequirements?: string[];
    tags?: string[];
    relatedDocumentTypes?: string[];
  }>(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type NewConversationMessage = typeof conversationMessages.$inferInsert;

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type NewDocumentTemplate = typeof documentTemplates.$inferInsert;
