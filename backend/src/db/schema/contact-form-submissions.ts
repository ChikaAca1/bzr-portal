import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core';

/**
 * Contact Form Submissions Table
 *
 * Stores public contact form submissions from landing page.
 * No foreign keys (public form, not linked to users).
 *
 * Fields:
 * - id: UUID primary key
 * - name: Submitter's full name
 * - email: Submitter's email (RFC 5322 validated)
 * - companyName: Optional company name
 * - message: Message content (min 10 characters)
 * - submittedAt: Timestamp (UTC)
 * - status: Submission status ('new', 'read', 'replied')
 */
export const contactFormSubmissions = pgTable('contact_form_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }),
  message: text('message').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('new'),
});

// Type inference for TypeScript
export type ContactFormSubmission = typeof contactFormSubmissions.$inferSelect;
export type NewContactFormSubmission = typeof contactFormSubmissions.$inferInsert;
