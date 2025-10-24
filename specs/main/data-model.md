# Data Model: BZR Portal

**Date**: 2025-10-21
**Source**: Constitution sections 3.1-3.2 (Core & Supporting Entities)
**ORM**: Drizzle ORM with PostgreSQL 16+

---

## Schema Overview

```
companies (1) ──< (N) work_positions (1) ──< (N) employees
                         │
                         ├──< (N) risk_assessments >── (1) hazard_types
                         ├──< (N) ppe_items
                         ├──< (N) training_requirements
                         ├──< (N) medical_exam_requirements
                         ├──< (N) activity_patterns
                         ├──< (N) load_handling_activities
                         └──< (N) psychological_loads
```

---

## Core Entities

### 1. `companies`

**Purpose**: Represents employer organizations (poslodavac)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `name` | `varchar(255)` | NOT NULL | Company name (naziv preduzeca) |
| `address` | `text` | NOT NULL | Full address (adresa) |
| `activity_code` | `varchar(10)` | NOT NULL | Serbian activity classification code (šifra delatnosti) |
| `pib` | `varchar(9)` | UNIQUE | Tax ID (PIB), optional for MVP |
| `registration_number` | `varchar(20)` | | Company registration number (matični broj) |
| `director` | `varchar(255)` | NOT NULL | Director name |
| `bzr_responsible_person` | `varchar(255)` | NOT NULL | BZR officer name and title |
| `organization_chart_url` | `text` | | URL to org chart image (S3/R2), optional |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamp` | NOT NULL DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id` (automatic)
- Unique index on `pib` (if provided)

**Validation Rules** (Zod schema):
- `name`: min length 3, max 255
- `activity_code`: matches pattern `/^\d{4}$/` (4-digit code)
- `pib`: if provided, exactly 9 digits, passes checksum validation
- `director`: min length 3
- `bzr_responsible_person`: min length 3

---

### 2. `work_positions`

**Purpose**: Job roles within company (radna mesta)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `company_id` | `bigint` | NOT NULL, FK → companies(id) | Parent company |
| `position_name` | `varchar(255)` | NOT NULL | Job title (naziv radnog mesta) |
| `position_code` | `varchar(50)` | | Internal code (šifra), optional |
| `department` | `varchar(255)` | | Organizational unit (org. celina) |
| `required_education` | `varchar(255)` | NOT NULL | Required education level (stručna sprema) |
| `required_experience` | `varchar(255)` | | Required experience (iskustvo) |
| `employees_male` | `integer` | NOT NULL DEFAULT 0 | Male employee count |
| `employees_female` | `integer` | NOT NULL DEFAULT 0 | Female employee count |
| `employees_total` | `integer` | GENERATED AS (employees_male + employees_female) | Total count (computed) |
| `work_hours_daily` | `numeric(3,1)` | NOT NULL DEFAULT 8.0 | Daily hours (radni sati) |
| `work_hours_weekly` | `numeric(4,1)` | NOT NULL DEFAULT 40.0 | Weekly hours |
| `shift_work` | `boolean` | NOT NULL DEFAULT false | Shift work indicator (smene) |
| `night_work` | `boolean` | NOT NULL DEFAULT false | Night work indicator (noćni rad) |
| `job_description` | `text` | | Job description (opis poslova) |
| `equipment_used` | `text[]` | | Array of equipment (oprema za rad) |
| `workspace` | `varchar(100)` | | Workspace type (radni prostor) |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamp` | NOT NULL DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `company_id`
- Index on `(company_id, position_code)` for lookups
- Index on `position_name` for search

**Validation Rules**:
- `position_name`: min length 3, max 255
- `required_education`: enum or free text (e.g., "VII stepen")
- `employees_male`, `employees_female`: >= 0
- `work_hours_daily`: 1.0 - 12.0 (reasonable range)
- `work_hours_weekly`: 5.0 - 60.0 (per Serbian labor law max)

**Cascade**:
- ON DELETE CASCADE (deleting company deletes positions)

---

### 3. `hazard_types` (Reference Data)

**Purpose**: Standardized hazard codes per Serbian BZR regulations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `hazard_code` | `varchar(10)` | NOT NULL UNIQUE | Code (e.g., "06", "07", "29", "34") |
| `hazard_category` | `varchar(50)` | NOT NULL | Category (mechanical, electrical, ergonomic, psychosocial, organizational) |
| `hazard_name_sr` | `varchar(500)` | NOT NULL | Serbian name (full description) |
| `hazard_name_en` | `varchar(500)` | | English translation (optional) |
| `hazard_description` | `text` | | Detailed description |
| `typical_measures` | `text[]` | | Array of typical corrective measures |
| `examples` | `text[]` | | Array of examples |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |

**Indexes**:
- Primary key on `id`
- Unique index on `hazard_code`
- Index on `hazard_category` for filtering

**Seed Data**: Load from constitution section 10.1 (45+ hazard codes)

**Immutable**: This table is reference data, populated via `seed.ts`, not user-editable

---

### 4. `risk_assessments`

**Purpose**: Risk assessment for a specific hazard on a work position

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `position_id` | `bigint` | NOT NULL, FK → work_positions(id) | Work position |
| `hazard_id` | `bigint` | NOT NULL, FK → hazard_types(id) | Hazard type |
| `initial_e` | `integer` | NOT NULL CHECK (initial_e BETWEEN 1 AND 6) | Initial consequences (E) |
| `initial_p` | `integer` | NOT NULL CHECK (initial_p BETWEEN 1 AND 6) | Initial probability (P) |
| `initial_f` | `integer` | NOT NULL CHECK (initial_f BETWEEN 1 AND 6) | Initial frequency (F) |
| `initial_ri` | `integer` | GENERATED AS (initial_e * initial_p * initial_f) | Initial risk (Ri = E×P×F) |
| `corrective_measures` | `text` | NOT NULL | Applied measures (text) |
| `residual_e` | `integer` | NOT NULL CHECK (residual_e BETWEEN 1 AND 6) | Residual consequences (E) |
| `residual_p` | `integer` | NOT NULL CHECK (residual_p BETWEEN 1 AND 6) | Residual probability (P) |
| `residual_f` | `integer` | NOT NULL CHECK (residual_f BETWEEN 1 AND 6) | Residual frequency (F) |
| `residual_r` | `integer` | GENERATED AS (residual_e * residual_p * residual_f) | Residual risk (R = E×P×F) |
| `responsible_person` | `varchar(255)` | | Person responsible for measures |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamp` | NOT NULL DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `position_id`
- Foreign key on `hazard_id`
- Composite index on `(position_id, hazard_id)` for uniqueness check
- Index on `residual_r` for filtering high-risk positions (WHERE residual_r > 70)

**Validation Rules**:
- `initial_e`, `initial_p`, `initial_f`: integer 1-6 (enforced by CHECK)
- `residual_r < initial_ri` (application-level validation before save)
- `corrective_measures`: min length 10 characters
- Unique constraint on `(position_id, hazard_id)` to prevent duplicate assessments

**Cascade**:
- ON DELETE CASCADE (deleting position deletes risk assessments)

---

### 5. `ppe_items` (Personal Protective Equipment)

**Purpose**: PPE requirements for work positions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `position_id` | `bigint` | NOT NULL, FK → work_positions(id) | Work position |
| `ppe_type` | `varchar(100)` | NOT NULL | PPE type (e.g., "rukavice", "kaciga") |
| `ppe_standard` | `varchar(50)` | | EN/ISO standard (e.g., "EN 420") |
| `quantity` | `integer` | NOT NULL DEFAULT 1 | Quantity per employee |
| `replacement_period_months` | `integer` | NOT NULL | Replacement period in months |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamp` | NOT NULL DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `position_id`
- Index on `position_id` for lookups

**Validation Rules**:
- `ppe_type`: min length 3
- `quantity`: >= 1
- `replacement_period_months`: 1-120 (reasonable range)

**Cascade**:
- ON DELETE CASCADE

---

### 6. `training_requirements`

**Purpose**: Training requirements for work positions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `position_id` | `bigint` | NOT NULL, FK → work_positions(id) | Work position |
| `training_type` | `varchar(50)` | NOT NULL | Type (initial, periodic, additional) |
| `frequency_months` | `integer` | NOT NULL | Frequency in months (e.g., 36 for every 3 years) |
| `duration_hours` | `integer` | NOT NULL | Duration in hours |
| `required_before_work` | `boolean` | NOT NULL DEFAULT true | Must complete before starting job |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamp` | NOT NULL DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `position_id`

**Validation Rules**:
- `training_type`: enum ['initial', 'periodic', 'additional']
- `frequency_months`: 1-120
- `duration_hours`: 1-200

**Cascade**:
- ON DELETE CASCADE

---

### 7. `medical_exam_requirements`

**Purpose**: Medical examination requirements for work positions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `position_id` | `bigint` | NOT NULL, FK → work_positions(id) | Work position |
| `exam_type` | `varchar(50)` | NOT NULL | Type (preliminary, periodic, control) |
| `frequency_months` | `integer` | NOT NULL | Frequency in months (0 for preliminary) |
| `exam_scope` | `varchar(100)` | | Scope (general, specialized) |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamp` | NOT NULL DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `position_id`

**Validation Rules**:
- `exam_type`: enum ['preliminary', 'periodic', 'control']
- `frequency_months`: 0-120 (0 for preliminary = one-time before employment)

**Cascade**:
- ON DELETE CASCADE

---

### 8. `employees` (Optional, can be anonymized)

**Purpose**: Individual employees (optional for MVP, can be omitted for privacy)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `position_id` | `bigint` | NOT NULL, FK → work_positions(id) | Work position |
| `first_name` | `varchar(100)` | | First name (optional, can be NULL for anonymized) |
| `last_name` | `varchar(100)` | | Last name |
| `jmbg` | `bytea` | | Encrypted JMBG (13-digit ID), PII |
| `hire_date` | `date` | | Employment start date |
| `contract_type` | `varchar(50)` | | Contract type (fixed-term, permanent) |
| `last_medical_exam_date` | `date` | | Last medical exam |
| `last_bzr_training_date` | `date` | | Last BZR training |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamp` | NOT NULL DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `position_id`

**Security**:
- `jmbg` column encrypted at rest using PostgreSQL `pgcrypto` extension or application-level encryption (e.g., AES-256)
- GDPR compliance: Right to erasure (DELETE), right to export (JSON export function)

**Cascade**:
- ON DELETE CASCADE (deleting position removes employees, or SET NULL if retention needed)

**MVP Note**: This table can be omitted in MVP Phase 1 if only position-level data is needed (no individual employee tracking)

---

## Supporting Entities

### 9. `activity_patterns`

**Purpose**: Hodogram of activities (location and duration breakdown)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `position_id` | `bigint` | NOT NULL, FK → work_positions(id) | Work position |
| `location_type` | `varchar(50)` | NOT NULL | indoor / outdoor |
| `duration_percentage` | `integer` | NOT NULL CHECK (duration_percentage BETWEEN 0 AND 100) | % of time |
| `body_position` | `varchar(50)` | | standing, sitting, bending, squatting, etc. |
| `frequency` | `varchar(50)` | | none, occasional, often, constant |
| `duration_hours` | `numeric(4,1)` | | Hours per day in this position |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `position_id`

**Validation**:
- Sum of `duration_percentage` for a position should ≤ 100% (application-level validation)

**Cascade**:
- ON DELETE CASCADE

---

### 10. `load_handling_activities`

**Purpose**: Manual load handling (ručno prenošenje tereta)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `position_id` | `bigint` | NOT NULL, FK → work_positions(id) | Work position |
| `activity_type` | `varchar(50)` | NOT NULL | lifting, carrying, pushing, pulling, throwing |
| `frequency` | `varchar(50)` | NOT NULL | none, occasional, often, constant |
| `max_weight_kg` | `integer` | | Maximum weight in kg |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `position_id`

**Validation**:
- `activity_type`: enum ['lifting', 'carrying', 'pushing', 'pulling', 'throwing']
- `max_weight_kg`: 0-200 (reasonable range)

**Cascade**:
- ON DELETE CASCADE

---

### 11. `psychological_loads`

**Purpose**: Psychological workload factors (psihološko opterećenje)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `position_id` | `bigint` | NOT NULL, FK → work_positions(id) | Work position |
| `load_type` | `varchar(100)` | NOT NULL | decision_making, customer_service, emergency_situations, etc. |
| `frequency` | `varchar(50)` | NOT NULL | none, occasional, often, constant |
| `created_at` | `timestamp` | NOT NULL DEFAULT now() | Creation timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `position_id`

**Validation**:
- `load_type`: enum or free text (examples: decision_making, customer_service, emergency_situations, information_overload, responsibility_for_others, monotonous_work)

**Cascade**:
- ON DELETE CASCADE

---

## Audit & Versioning Tables (Future)

### 12. `document_generations` (Phase 2)

**Purpose**: Track generated documents for audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigserial` | PRIMARY KEY | Auto-increment ID |
| `company_id` | `bigint` | NOT NULL, FK → companies(id) | Company |
| `generated_by_user_id` | `bigint` | | User who generated (FK to users table) |
| `document_type` | `varchar(50)` | NOT NULL | akt_o_proceni_rizika, izvestaj, etc. |
| `file_url` | `text` | NOT NULL | S3/R2 URL |
| `file_size_bytes` | `bigint` | | File size |
| `positions_included` | `bigint[]` | | Array of position IDs included |
| `generated_at` | `timestamp` | NOT NULL DEFAULT now() | Generation timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `company_id`
- Index on `generated_at` for date-range queries

---

## Database Migrations Strategy

**Tool**: Drizzle Kit

**Workflow**:
1. Define schema in `backend/src/db/schema/` (TypeScript files)
2. Run `drizzle-kit generate:pg` to create SQL migration files
3. Review generated SQL in `backend/src/db/migrations/`
4. Run `drizzle-kit push:pg` to apply to database
5. Commit migration files to Git

**Example Migration**:
```sql
-- 0001_create_companies.sql
CREATE TABLE "companies" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "address" TEXT NOT NULL,
  "activity_code" VARCHAR(10) NOT NULL,
  "pib" VARCHAR(9) UNIQUE,
  "registration_number" VARCHAR(20),
  "director" VARCHAR(255) NOT NULL,
  "bzr_responsible_person" VARCHAR(255) NOT NULL,
  "organization_chart_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_pib ON companies(pib) WHERE pib IS NOT NULL;
```

---

## Drizzle Schema Example

**File**: `backend/src/db/schema/companies.ts`

```typescript
import { pgTable, bigserial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  activityCode: varchar('activity_code', { length: 10 }).notNull(),
  pib: varchar('pib', { length: 9 }).unique(),
  registrationNumber: varchar('registration_number', { length: 20 }),
  director: varchar('director', { length: 255 }).notNull(),
  bzrResponsiblePerson: varchar('bzr_responsible_person', { length: 255 }).notNull(),
  organizationChartUrl: text('organization_chart_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

---

## Data Integrity Rules

### Application-Level Validations (not enforced by DB constraints)

1. **Risk Reduction Validation**:
   ```typescript
   if (residual_r >= initial_ri) {
     throw new ValidationError("Residual risk must be lower than initial risk");
   }
   ```

2. **Activity Pattern Sum**:
   ```typescript
   const totalPercentage = activityPatterns.reduce((sum, p) => sum + p.duration_percentage, 0);
   if (totalPercentage > 100) {
     throw new ValidationError("Activity duration percentages cannot exceed 100%");
   }
   ```

3. **High Risk Mandatory Reduction**:
   ```typescript
   if (initial_ri > 70 && residual_r > 70) {
     throw new ValidationError("High initial risk (>70) must be reduced to acceptable level (≤70)");
   }
   ```

---

## Summary

**Total Tables**: 11 core + 1 audit table (Phase 2)

**Estimated Data Volume (Year 1)**:
- Companies: ~100 rows
- Work Positions: ~5,000 rows
- Risk Assessments: ~15,000 rows (avg 3 hazards per position)
- PPE Items: ~10,000 rows
- Training: ~5,000 rows
- Medical Exams: ~5,000 rows
- Total DB size: <100 MB

**Next Step**: Generate API contracts for CRUD operations on these entities
