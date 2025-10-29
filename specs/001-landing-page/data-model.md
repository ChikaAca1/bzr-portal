# Landing Page Data Model

**Feature**: BZR Portal Landing Page & Marketing Site
**Date**: 2025-01-28
**Status**: Final

## Overview

Landing page feature is primarily **frontend-only** with static content. Only one new database entity required for contact form functionality.

## Entities

### 1. ContactFormSubmission (NEW)

**Purpose**: Store contact form submissions from public /contact page for sales/support follow-up.

**Table**: `contact_form_submissions`

**Fields**:

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique submission identifier |
| `name` | TEXT | NOT NULL | Submitter's full name (e.g., "Marko Marković") |
| `email` | VARCHAR(255) | NOT NULL | Submitter's email address (validated RFC 5322 format) |
| `company_name` | VARCHAR(255) | NULLABLE | Optional company name (e.g., "Primer DOO") |
| `message` | TEXT | NOT NULL | Message content (min 10 characters) |
| `submitted_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Submission timestamp (UTC) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'new', CHECK IN ('new', 'read', 'replied') | Submission status for admin triage |

**Indexes**:
- `CREATE INDEX idx_contact_submissions_submitted_at ON contact_form_submissions(submitted_at DESC);`
  **Purpose**: Admin panel sorting (newest first)
- `CREATE INDEX idx_contact_submissions_status ON contact_form_submissions(status);`
  **Purpose**: Filter by status (e.g., show only 'new' submissions)

**Validation Rules** (enforced at application layer):
- `name`: Required, min 1 character, max 255 characters
- `email`: Required, RFC 5322 email format validation, max 255 characters
- `company_name`: Optional, max 255 characters
- `message`: Required, min 10 characters (prevent empty spam submissions)

**Relationships**:
- **None** - Standalone entity, no foreign keys
- Contact form is public (unauthenticated), so no link to `users` table
- Admin role can view submissions via future admin panel (no RLS required - admin BYPASSRLS)

**Drizzle ORM Schema** (backend/src/db/schema.ts addition):

```typescript
import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core';

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
```

**Migration** (generated via `npm run db:generate`):

```sql
-- Migration: 001_create_contact_form_submissions.sql
CREATE TABLE IF NOT EXISTS contact_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  message TEXT NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied'))
);

CREATE INDEX idx_contact_submissions_submitted_at ON contact_form_submissions(submitted_at DESC);
CREATE INDEX idx_contact_submissions_status ON contact_form_submissions(status);

-- No RLS policy needed (admin BYPASSRLS, no multi-tenant isolation required)
```

**Status Lifecycle**:
1. **new** → Initial state when form submitted
2. **read** → Admin opened submission in admin panel (future feature)
3. **replied** → Support team sent response email to submitter

---

### 2. User (EXISTING - Reference Only)

**Usage in Landing Page**: Registration CTA buttons ("Počnite besplatno") link to `/register` route, which creates new User record.

**No changes required** - existing auth system handles registration.

---

### 3. Company (EXISTING - Reference Only)

**Usage in Landing Page**: Pricing section displays tiers based on company employee count (0-50: 3000 RSD, 51-200: 4500 RSD, 201+: 6000 RSD).

**No changes required** - pricing logic calculated at registration time or in billing system.

---

## Data Flow Diagrams

### Contact Form Submission Flow

```
┌─────────────┐
│  User fills │
│ contact form│
│ (/contact)  │
└──────┬──────┘
       │
       │ POST /api/contact
       │ { name, email, companyName?, message }
       ▼
┌─────────────┐
│  Backend    │
│  Validation │
│ (Zod schema)│
└──────┬──────┘
       │
       │ ✓ Valid
       │
       ├───────────────────┬────────────────────┐
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐    ┌─────────────┐     ┌─────────────┐
│   Insert    │    │ Send Email  │     │   Return    │
│   into DB   │    │ via Resend  │     │  Success    │
│ (contact_   │    │ to support@ │     │  Response   │
│  form_      │    │ bzrportal.rs│     │  (200 OK)   │
│  submissions)│    └─────────────┘     └─────────────┘
└─────────────┘
       │
       │ Status: 'new'
       │
       ▼
┌─────────────┐
│  Admin Panel│
│  (Future)   │
│  View new   │
│  submissions│
└─────────────┘
```

---

## Database Size Estimates

### ContactFormSubmission Storage

**Assumptions**:
- 1000 visitors/day post-launch (per scale goals)
- 2% contact form conversion → 20 submissions/day
- Average submission size: 500 bytes (name + email + company + message)

**Daily growth**: 20 submissions × 500 bytes = **10 KB/day**
**Monthly growth**: 20 submissions/day × 30 days × 500 bytes = **300 KB/month**
**Annual growth**: 20 submissions/day × 365 days × 500 bytes = **3.65 MB/year**

**Conclusion**: Negligible database impact. Supabase Free tier (500MB) sufficient for 100+ years of contact form data.

---

## Backup & Retention Policy

**Backup**: Supabase automatic daily backups (30-day retention on Free tier)

**Retention policy** (to be implemented in Phase 3):
- Keep all submissions indefinitely for legal/audit purposes
- Option to manually delete spam submissions (admin panel feature)
- GDPR data export: Include contact form submissions in user data export (if email matches registered user)

---

## Security Considerations

**No PII encryption required**:
- Contact form submissions contain publicly-provided information (name, email, message)
- No JMBG, passwords, or company confidential data
- Emails visible to admin role only (no public exposure)

**Rate limiting** (see research.md R003):
- 100 requests per 15 minutes per IP
- Prevents spam floods

**Honeypot validation** (see research.md R003):
- Hidden `website` field must be empty (bot detection)

**SQL injection prevention**:
- Drizzle ORM parameterized queries (all inputs sanitized)

---

## Future Enhancements (Post-MVP)

1. **Admin Panel** (Phase 3):
   - View all contact submissions sorted by `submitted_at DESC`
   - Filter by status ('new', 'read', 'replied')
   - Mark as read/replied
   - Reply directly from admin panel (compose email in UI)

2. **Analytics** (Phase 3):
   - Track contact form conversion rate (views vs submissions)
   - Most common inquiry topics (keyword extraction from messages)
   - Average response time (submitted_at → first reply timestamp)

3. **CRM Integration** (Phase 4):
   - Sync contact submissions to external CRM (HubSpot, Salesforce)
   - Auto-tag leads based on message content (e.g., "enterprise" inquiry, "pricing" question)
