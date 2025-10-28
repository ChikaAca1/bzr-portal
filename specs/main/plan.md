# Implementation Plan: BZR Portal - AI-Powered Risk Assessment Platform

**Branch**: `main` | **Date**: 2025-10-27 | **Spec**: [spec.md](./spec.md)

## Summary

BZR Portal is a SaaS platform that automates Serbian Occupational Health & Safety risk assessments, transforming manual Word/Excel workflows into AI-assisted document generation. The platform enables BZR officers to create legally compliant "Akt o proceni rizika" documents using the E×P×F risk methodology, manage work positions with hazard assessments, and generate DOCX documents meeting Serbian regulatory requirements (Zakon o BZR 101/2005). The MVP targets 10 pilot companies with a trial-based registration model, allowing users to create risk assessments for up to 3 positions and generate 5 documents within a 14-day trial period before requiring verification for full access.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode), Node.js 20+

**Primary Dependencies**: Hono (API framework for Vercel serverless), Drizzle ORM (with Drizzle Kit for migrations), docx-templates (Mustache-based DOCX templating), AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner for Wasabi S3 integration), Resend (transactional email), React 18+ with Vite (frontend), TanStack Query (data fetching), Zustand (state management), shadcn/ui + Tailwind CSS (UI components), React Hook Form + Zod (validation)

**Storage**:
- Database: Supabase PostgreSQL Free tier (500MB, 50k MAU) - provides managed PostgreSQL with built-in authentication support, Row-Level Security policies, connection pooling via PgBouncer, and real-time capabilities
- Object Storage: Wasabi S3-compatible storage ($6.99/month for 1TB minimum, no egress/bandwidth fees) - chosen for predictable flat-rate pricing and zero bandwidth charges critical for document downloads

**Testing**: Vitest (unit/integration tests), Playwright (E2E tests), React Testing Library (component tests), Supertest or Hono test utilities (API integration tests)

**Target Platform**: Vercel Free plan (10s serverless function timeout, 100 executions/day, 100GB bandwidth/month) → upgrade to Vercel Pro ($20/month, 60s timeout, unlimited executions) only after achieving 100+ paying customers milestone

**Project Type**: Web application (backend + frontend)

**Performance Goals**:
- API response times: GET < 100ms, POST/PUT < 200ms, DELETE < 150ms (95th percentile)
- Document generation: Single position < 8s (must fit within Vercel Free 10s timeout), multi-position (up to 5) < 9s
- Frontend: FCP < 1.5s, TTI < 3s, UI interactions < 100ms
- Concurrent capacity: 30-50 concurrent users (MVP with 10 pilot companies), scale to 100+ concurrent users (production)

**Constraints**:
- Vercel Free 10s timeout requires document generation optimization and split strategy for large documents (5+ positions)
- 100 serverless executions/day limit requires rate limiting to 5 documents/day per user during MVP phase
- Budget constraint: ~$7/month infrastructure cost (Wasabi only) until 100 paying customers
- Trial account limits: 1 company profile, 3 work positions maximum, 5 generated documents, 14-day trial period
- Legal compliance: All generated documents must conform to Serbian BZR regulations (Zakon 101/2005, Pravilnik 5/2018)

**Scale/Scope**: 10 pilot companies (MVP) → 100+ paying customers (production) → scale to 1000+ companies with current single-database architecture

## Constitution Check

*GATE: Must pass before Phase 0 research.*

### I. Legal Compliance First (NON-NEGOTIABLE)

**Assessment**: ✅ PASS

The specification comprehensively addresses Serbian BZR legal requirements:
- Complete legal basis documented (Zakon o BZR 101/2005, 91/2015, 113/2017; Pravilnik 23/2009, 83/2014, 5/2018)
- Legal Requirements Traceability section maps all 7 legal articles (LR-001 through LR-007) to functional requirements
- Mandatory document sections (FR-034 through FR-042) explicitly implement Član 9 requirements for Akt o proceni rizika structure
- Risk methodology (E×P×F) defined with Serbian interpretation tables for E (Posledice), P (Verovatnoća), F (Učestalost)
- R > 70 high-risk flagging per Član 9, stav 1, tačka 4 requirement
- Success criteria SC-002 requires 95%+ compliance rate with labor inspection review
- All 8 mandatory document sections specified: cover page, introduction, employer data, organizational structure, position systematization, risk assessment tables, summary with action plans, verification signatures

**Validation Strategy**: Document generation tests must verify presence of all mandatory sections; legal advisor review required before MVP launch; pilot testing with actual labor inspectorate submissions.

### II. Test-Driven Development (NON-NEGOTIABLE)

**Assessment**: ✅ PASS

Specification mandates comprehensive testing:
- SC-004 requires 100% accuracy for risk calculation (E×P×F formula) verified by automated unit tests
- SC-010 requires 80%+ code coverage for critical business logic
- Success criteria SC-005 requires 99%+ document generation success rate
- Testing stack specified: Vitest (unit/integration), Playwright (E2E), React Testing Library (components)
- Critical test requirements identified: risk calculation validation (FR-044a-e), document generation error handling (FR-045), concurrent edit conflicts (FR-046), DOCX template rendering
- Edge cases enumerated with expected behaviors (R ≥ Ri validation error, E/P/F out of range, document generation failures)

**Implementation Approach**: Phase 2 must begin with test task creation (T031-T037) covering risk calculation, document generation, validation, authentication, RLS isolation, rate limiting, and DOCX template correctness before any feature implementation.

### III. Security by Design (NON-NEGOTIABLE)

**Assessment**: ✅ PASS

Multi-layered security architecture specified:
- **Authentication**: JWT-based with 15-minute access tokens, 7-day refresh tokens (HTTP-only, SameSite=Strict) per FR-053a
- **Authorization**: RBAC with 4 roles (Admin, BZR Officer, HR Manager, Viewer) and explicit permission matrix per FR-029, FR-053b
- **Multi-Tenancy Isolation**: Row-Level Security enforced via PostgreSQL RLS policies + application-layer company_id filtering (defense-in-depth) per FR-030, FR-053c
- **Data Protection**: JMBG encryption using AES-256-GCM (FR-031), GDPR compliance with data export/deletion (FR-032, FR-049)
- **Input Validation**: Zod schemas on frontend and backend (FR-016), SQL injection prevention via Drizzle ORM parameterized queries
- **Rate Limiting**: 100 requests/minute, 5 documents/day per user (MVP), 5 login attempts with 15-min lockout per FR-053d
- **Audit Trail**: All document generations and data modifications logged for 2-year retention per Član 32 (FR-033)

**RLS Policy Implementation**: All multi-tenant tables (companies, work_positions, risk_assessments, ppe, training, medical_exams, employees, documents, audit_logs) must have `CREATE POLICY company_isolation ON {table} FOR ALL USING (company_id = current_setting('app.current_company_id')::integer)` with middleware setting session variable from JWT payload.

### IV. Serbian Language Priority

**Assessment**: ✅ PASS

Comprehensive Serbian Cyrillic requirement:
- FR-028i mandates all email templates in Serbian language (Cyrillic or Latin based on user preference)
- All UI components, error messages, validation text specified in Serbian Cyrillic (examples throughout spec: "PIB broj nije validan. Proverite unos.", "Rezidual rizik mora biti manji od inicijalnog rizika")
- Document template sections specified in Cyrillic: "АКТ О ПРОЦЕНИ РИЗИКА", "Uvod", "Podaci o poslodavcu", etc.
- Risk methodology tables include Serbian terms: "Posledice", "Verovatnoća", "Učestalost", "Nizak rizik", "Srednji rizik", "Povećan rizik"
- Hazard reference data requires `hazard_name_sr` column with Serbian descriptions
- Trial account warning example in Cyrillic: "Probni nalog - {days} dana preostalo. Zakažite verifikaciju za pun pristup."

**Technical Implementation**: i18n setup with sr-Cyrl-RS locale, DOCX templates with Cyrillic fonts (Arial/Times New Roman with Serbian support), UTF-8 encoding throughout stack, character set testing for special characters (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш).

### V. Accessibility Standards

**Assessment**: ✅ PASS

WCAG 2.1 AA compliance requirements specified:
- **Keyboard Navigation** (FR-054a): All interactive elements accessible via Tab/Shift+Tab/Enter/Escape/Arrow keys; multi-step wizard keyboard support
- **Screen Reader Support** (FR-054b): All form inputs with `<label>` elements, error messages with `aria-live="polite"`, risk level badges with descriptive `aria-label` ("Nizak rizik"/"Srednji rizik"/"Povećan rizik"), document generation progress announcements
- **Color Contrast** (FR-054c): 4.5:1 minimum contrast ratio specified with exact hex values: Green #107C10, Orange #CA5010 (not pure yellow), Red #D13438; text labels mandatory alongside color indicators
- **Focus Management** (FR-054d): Modal focus trapping, error-first focus on validation failures, screen reader announcements for async operations

**Testing Strategy**: Manual keyboard navigation testing for critical flows, screen reader testing with NVDA/JAWS, automated audits with axe DevTools/Lighthouse, documented test cases in Phase 6 (T083-T088).

### VI. Multi-Tenancy Isolation

**Assessment**: ✅ PASS

Defense-in-depth multi-tenancy architecture:
- **Database Layer**: PostgreSQL RLS policies on all multi-tenant tables per FR-053c with session variable-based filtering
- **Application Layer**: Explicit company_id filtering in all queries (WHERE company_id = user.company_id)
- **Middleware**: JWT payload includes company_id, validated on every authenticated request; session variable injection for RLS
- **Storage Layer**: Wasabi S3 bucket folder structure with company_id isolation (documents/{company_id}/{document_id}.docx), pre-signed URLs with 1-hour expiration
- **Testing**: Integration tests must verify cross-tenant access denial (FR-046 optimistic locking includes multi-user conflict scenarios)

**9 Multi-Tenant Tables Identified**: companies (self-referential), work_positions, risk_assessments, ppe, training, medical_exams, employees, documents, audit_logs - all require company_id column + RLS policy + application-layer filtering.

**Result**: ✅ PASS - All 6 constitutional principles satisfied. No blocking issues identified. Project may proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```
specs/main/
├── spec.md              # Feature specification (existing - 980 lines)
├── plan.md              # This file
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── api-spec.yaml    # OpenAPI 3.0 specification
│   └── schemas/         # JSON schemas for validation
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── models/              # Drizzle schema definitions
│   │   ├── schema.ts        # Main schema file (all tables)
│   │   ├── users.ts         # User model with RBAC roles
│   │   ├── companies.ts     # Company model with trial limits
│   │   ├── positions.ts     # WorkPosition model
│   │   ├── risks.ts         # RiskAssessment model (E×P×F calculation)
│   │   ├── hazards.ts       # HazardType reference data
│   │   ├── ppe.ts           # PPE model
│   │   ├── training.ts      # Training model
│   │   ├── medical.ts       # MedicalExam model
│   │   ├── employees.ts     # Employee model (optional, anonymized)
│   │   ├── documents.ts     # Document metadata model
│   │   └── audit.ts         # AuditLog model
│   ├── services/            # Business logic
│   │   ├── auth.service.ts           # JWT generation, password hashing, email verification
│   │   ├── risk.service.ts           # Risk calculation (E×P×F), R < Ri validation, R > 70 flagging
│   │   ├── document.service.ts       # DOCX generation using docx-templates
│   │   ├── storage.service.ts        # Wasabi S3 operations (upload, pre-signed URLs)
│   │   ├── email.service.ts          # Resend integration for transactional emails
│   │   ├── validation.service.ts     # PIB/JMBG checksum validation, Serbian data formats
│   │   └── trial.service.ts          # Trial account limit enforcement
│   ├── api/                 # Hono route handlers
│   │   ├── auth.routes.ts            # POST /api/auth/register, /login, /refresh, /verify-email
│   │   ├── companies.routes.ts       # GET/PUT/DELETE /api/companies/:id
│   │   ├── positions.routes.ts       # CRUD /api/companies/:companyId/positions, /api/positions/:id
│   │   ├── risks.routes.ts           # CRUD /api/positions/:positionId/risks, /api/risks/:id
│   │   ├── documents.routes.ts       # POST /api/documents/generate, /generate-multiple; GET /api/documents, /api/documents/:id/download
│   │   └── health.routes.ts          # GET /api/health (status + database connectivity check)
│   ├── middleware/          # Auth, RLS, rate limiting
│   │   ├── auth.middleware.ts        # JWT validation, role-based access control
│   │   ├── rls.middleware.ts         # PostgreSQL session variable injection (app.current_company_id)
│   │   ├── rate-limit.middleware.ts  # 100 req/min, 5 docs/day per user, 5 login attempts
│   │   └── validation.middleware.ts  # Zod schema validation for requests
│   ├── lib/                 # Utilities
│   │   ├── s3.ts                     # AWS SDK v3 configuration for Wasabi endpoint
│   │   ├── email.ts                  # Resend client configuration
│   │   ├── docx.ts                   # docx-templates wrapper functions
│   │   ├── crypto.ts                 # AES-256-GCM encryption for JMBG
│   │   ├── logger.ts                 # Structured logging (Pino)
│   │   └── db.ts                     # Drizzle ORM database connection
│   └── index.ts             # Vercel serverless entry point (Hono app export)
├── templates/
│   └── Akt_Procena_Rizika_Template.docx  # DOCX template with Mustache placeholders
├── drizzle/                 # Migration files
│   ├── 0001_initial_schema.sql
│   ├── 0002_rls_policies.sql
│   └── 0003_hazard_seed_data.sql
├── tests/
│   ├── unit/
│   │   ├── risk.service.test.ts      # E×P×F calculation tests
│   │   ├── validation.test.ts        # PIB/JMBG checksum tests
│   │   └── trial.service.test.ts     # Trial limit enforcement tests
│   ├── integration/
│   │   ├── auth.test.ts              # Registration/login flow tests
│   │   ├── rls.test.ts               # Cross-tenant isolation tests
│   │   ├── document.test.ts          # DOCX generation tests
│   │   └── rate-limit.test.ts        # Rate limiting tests
│   └── fixtures/
│       ├── companies.json            # Test data fixtures
│       ├── positions.json
│       ├── risks.json
│       └── template.docx             # Test DOCX template
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── vitest.config.ts

frontend/
├── src/
│   ├── components/          # shadcn/ui components
│   │   ├── ui/                       # shadcn primitives (button, input, dialog, etc.)
│   │   ├── layout/                   # Layout components (Header, Sidebar, Footer)
│   │   ├── forms/                    # Form components (CompanyForm, PositionForm, RiskAssessmentForm)
│   │   ├── wizards/                  # Multi-step wizards (PositionWizard with 5 steps)
│   │   ├── tables/                   # Data tables (PositionTable, RiskTable with virtual scrolling)
│   │   └── feedback/                 # Feedback components (ErrorModal, ProgressIndicator)
│   ├── pages/               # Main views
│   │   ├── Dashboard.tsx             # Company overview, document generation stats
│   │   ├── Positions.tsx             # Work position list, CRUD operations
│   │   ├── PositionDetail.tsx        # Single position with risk assessments, PPE, training
│   │   ├── Documents.tsx             # Generated documents list, download links
│   │   ├── Login.tsx                 # Login page
│   │   ├── Register.tsx              # Trial registration page
│   │   └── VerifyEmail.tsx           # Email verification confirmation page
│   ├── hooks/               # React hooks
│   │   ├── useAuth.ts                # Authentication state (Zustand + TanStack Query)
│   │   ├── useDocuments.ts           # Document generation hooks
│   │   ├── usePositions.ts           # Position CRUD hooks
│   │   ├── useRisks.ts               # Risk assessment hooks
│   │   └── useRateLimit.ts           # Rate limit quota display
│   ├── services/            # API clients (TanStack Query)
│   │   ├── api.ts                    # Axios instance with JWT interceptor
│   │   ├── auth.api.ts               # Auth API calls
│   │   ├── companies.api.ts          # Company API calls
│   │   ├── positions.api.ts          # Position API calls
│   │   ├── risks.api.ts              # Risk API calls
│   │   └── documents.api.ts          # Document API calls
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts              # Auth state (user, company_id, role, trial status)
│   │   └── appStore.ts               # Global app state (loading, errors, notifications)
│   ├── lib/                 # Utilities
│   │   ├── i18n.ts                   # Serbian Cyrillic translations
│   │   ├── validation.ts             # Zod schemas (shared with backend)
│   │   ├── formatters.ts             # Date/number formatters for Serbian locale
│   │   └── constants.ts              # Risk level thresholds, role definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css            # Tailwind imports
├── tests/
│   ├── unit/
│   │   ├── risk-calculation.test.tsx # Client-side risk calculation tests
│   │   └── validation.test.ts        # Client-side Zod schema tests
│   └── e2e/                 # Playwright tests
│       ├── auth.spec.ts              # Registration → login → email verification flow
│       ├── position-wizard.spec.ts   # Full position creation wizard
│       ├── risk-assessment.spec.ts   # Risk assessment E×P×F input and validation
│       ├── document-generation.spec.ts # Generate → download → verify DOCX
│       └── trial-limits.spec.ts      # Trial account limit enforcement
├── package.json
├── tsconfig.json
├── vite.config.ts
└── playwright.config.ts

shared/
└── schemas/                 # Zod schemas (shared validation)
    ├── user.schema.ts
    ├── company.schema.ts
    ├── position.schema.ts
    ├── risk.schema.ts
    ├── ppe.schema.ts
    ├── training.schema.ts
    └── document.schema.ts

.github/
└── workflows/
    └── ci.yml               # GitHub Actions CI (test, lint, build, deploy preview)

vercel.json                  # Vercel configuration (serverless functions routing)
```

**Structure Decision**: Web application structure chosen (backend + frontend) per constitution. Vite + React 18 frontend for fast builds and excellent TypeScript support without Next.js complexity. Hono backend optimized for Vercel serverless functions with 10s timeout constraint. Drizzle ORM for type-safe queries and simple migrations. Single shared database with Row-Level Security for multi-tenancy.

**Rationale for Technology Choices**:
- **Vite (not Next.js)**: Simpler deployment, faster builds, no server-side rendering complexity needed for MVP
- **Hono (not Fastify)**: Lightweight, designed for edge/serverless, better cold start performance (<3s target)
- **Supabase PostgreSQL**: Managed service with built-in RLS support, connection pooling via PgBouncer, generous free tier (500MB, 50k MAU)
- **Wasabi S3**: Flat-rate pricing ($6.99/TB/month), zero egress/bandwidth fees (critical for unpredictable document download volume), S3-compatible API for easy migration
- **Resend**: Developer-friendly email API, generous free tier (100 emails/day sufficient for MVP), excellent deliverability

## Phase 0: Research & Technical Decisions

### Research Tasks

#### R001: Wasabi S3 Integration with Vercel Serverless

**Objective**: Validate AWS SDK v3 configuration for custom S3 endpoints, pre-signed URL generation, and multi-tenant folder structure.

**Research Questions**:
1. How to configure AWS SDK v3 S3Client with custom Wasabi endpoint?
2. What are best practices for pre-signed URL generation with @aws-sdk/s3-request-presigner?
3. What folder structure ensures multi-tenant isolation?
4. How to handle bucket policy configuration for public-read-deny?
5. What are cold start implications of AWS SDK v3 in Vercel serverless functions?

**Success Criteria**:
- Working code example for S3Client initialization with Wasabi endpoint
- Pre-signed URL generation function with 1-hour expiration
- Upload function with company_id-based folder structure
- Bundle size analysis for cold start optimization
- Error handling patterns for network failures

**Output**: Section in research.md with code examples and implementation guidance.

---

#### R002: docx-templates Performance Optimization

**Objective**: Validate template complexity vs generation time to meet <8s requirement for Vercel Free 10s timeout.

**Research Questions**:
1. What is baseline generation time for simple vs complex templates?
2. How does Mustache loop performance scale with 50+ risk assessments?
3. What is difference between streaming vs buffered document generation?
4. Can template pre-compilation improve generation speed?
5. What are bottlenecks: template parsing, data injection, or DOCX compression?

**Testing Approach**:
- Create test template matching FR-034 through FR-042 structure
- Benchmark with varying data sizes (1 position, 5 positions, 10 positions)
- Measure time breakdown: template load, data injection, zip generation
- Test on Vercel serverless function (cold start matters)

**Success Criteria**:
- Single position < 8 seconds consistently
- Multi-position (up to 5) < 9 seconds
- Identification of split threshold for document generation strategy
- Memory usage profile (1GB limit on Vercel Free)

**Output**: Section in research.md with performance benchmarks and optimization recommendations.

---

#### R003: Vercel Free Plan Constraints

**Objective**: Document mitigation strategies for 10s timeout and 100 executions/day limit.

**Research Questions**:
1. How to implement cold start optimization (<3s target)?
2. What monitoring is available on Vercel Free plan?
3. How to implement 5 documents/day per user rate limiting?
4. What happens when 100 executions/day limit exceeded?
5. Can we use Vercel Edge Functions for any routes?

**Testing Approach**:
- Deploy test function to Vercel Free plan, measure cold start time
- Simulate 100 requests/day to observe limit behavior
- Test database connection pooling with PgBouncer
- Benchmark function execution time with varying query complexity

**Success Criteria**:
- Cold start time < 3 seconds (90th percentile)
- Database connection pool configuration (10-20 connections)
- Rate limiting implementation plan
- Monitoring strategy using Vercel built-in logs

**Output**: Section in research.md with optimization checklist and monitoring setup guide.

---

#### R004: Supabase Row-Level Security Implementation

**Objective**: Validate RLS policy patterns for multi-tenant SaaS with session variable injection.

**Research Questions**:
1. What is correct syntax for RLS policy with session variable?
2. How to inject session variable from Hono middleware?
3. What is performance impact of RLS vs application-layer filtering?
4. How to handle Admin role bypass?
5. How to test RLS policies effectively?

**Testing Approach**:
- Create test database with RLS policies on work_positions table
- Create 2 test users with different company_id values
- Verify User A cannot read User B's data
- Measure query performance with EXPLAIN ANALYZE

**Success Criteria**:
- Working RLS policy definition for all 9 multi-tenant tables
- Middleware function to inject session variable from JWT payload
- Integration test verifying cross-tenant access denial
- Performance analysis showing <10ms overhead with proper indexing

**Output**: Section in research.md with RLS policy template and middleware code example.

---

#### R005: Rate Limiting Strategy

**Objective**: Design daily quota tracking (5 docs/user/day) without Redis, using PostgreSQL only.

**Research Questions**:
1. How to implement database-backed rate limiting?
2. How to handle distributed rate limiting across serverless instances?
3. When to reset daily counter (midnight UTC vs 24 hours from first generation)?
4. How to display remaining quota to users?
5. What user notification patterns for quota exhaustion?

**Design Options**:
- Option A: users table with document_generation_count + reset_at timestamp
- Option B: rate_limit_events table with timestamp filtering
- Option C: daily_quotas table with unique constraint on (user_id, date)

**Success Criteria**:
- Rate limiting handles concurrent requests
- Quota resets correctly after 24 hours
- User sees accurate remaining quota display
- Graceful error handling when limit exceeded

**Output**: Section in research.md with database schema and implementation algorithm.

---

### Research Output: research.md

The research.md file will be created during Phase 0 execution with:

1. **Executive Summary**: Key decisions made, blockers identified, technical risks assessed
2. **R001-R005 Findings**: Detailed findings for each research task with code examples
3. **Risk Register**: Technical risks with mitigation plans
4. **Phase 1 Recommendations**: Architectural decisions informing data model and API design

**Estimated Research Duration**: 3-5 days (can be parallelized)

## Phase 1: Data Model Design

Phase 1 will produce a comprehensive `data-model.md` file containing complete Drizzle schema definitions for all 12 core entities. The data model must enforce multi-tenancy isolation (company_id column on 9 tables), support Row-Level Security policies, implement trial account limits, and maintain audit trails per Serbian BZR legal requirements (2-year retention per Član 32).

### Core Entities Summary

1. **User**: Authentication, RBAC roles, trial account management
2. **Company**: Multi-tenant root entity with trial limits
3. **WorkPosition**: Job roles with risk assessments
4. **HazardType**: Serbian BZR hazard code reference data
5. **RiskAssessment**: E×P×F risk calculation with validation
6. **PPE**: Personal protective equipment requirements
7. **Training**: Training requirements per Član 11
8. **MedicalExam**: Medical examination requirements per Član 22
9. **Employee**: Optional worker records (anonymized, encrypted JMBG)
10. **Document**: Generated DOCX file metadata
11. **AuditLog**: Compliance audit trail
12. **RateLimitEvent**: Database-backed rate limiting

### Data Model Output

The complete `data-model.md` file will contain:

1. **Entity Relationship Diagram** (ASCII art or Mermaid)
2. **Complete Drizzle Schema Definitions** (TypeScript code)
3. **RLS Policy Definitions** (SQL code for 9 multi-tenant tables)
4. **Migration Files** (4 sequential migrations)
5. **Validation Rules Summary** (Zod schemas)
6. **Business Logic Summary** (triggers, auto-calculations, cascade behaviors)
7. **Index Strategy** (performance optimization)
8. **Storage Estimates** (database size projections)

## Phase 1: API Contracts

Phase 1 will produce a comprehensive `contracts/api-spec.yaml` OpenAPI 3.0 specification defining all API endpoints, request/response schemas, authentication requirements, error codes, and validation rules.

### Endpoint Categories

1. **Authentication** (5 endpoints): register, login, refresh, verify-email, resend-verification
2. **Company Management** (3 endpoints): GET, PUT, DELETE /api/companies/:id
3. **Work Position Management** (5 endpoints): List, create, read, update, delete positions
4. **Risk Assessment** (4 endpoints): List, create, update, delete risk assessments
5. **Document Generation** (4 endpoints): generate, generate-multiple, list, download
6. **Reference Data** (2 endpoints): List hazards, get hazard details
7. **Health Check** (1 endpoint): Service health and database connectivity

### API Contracts Output

The complete `contracts/api-spec.yaml` will contain:

1. **API Metadata**: Title, version, description, servers
2. **Security Schemes**: JWT Bearer token definition
3. **Endpoint Definitions**: All 25+ endpoints with full schemas
4. **Schema Components**: Reusable schemas for all entities
5. **Authentication Requirements**: Security annotations
6. **Error Examples**: Serbian Cyrillic error messages
7. **JSON Schemas**: Separate schemas/ directory for validation

## Phase 1: Quickstart Guide

Phase 1 will produce a comprehensive `quickstart.md` file enabling developers to set up the development environment, run locally, execute tests, and deploy to Vercel.

### Quickstart Sections

1. **Prerequisites**: Required tools and accounts
2. **Environment Setup**: Clone repo, install dependencies, configure .env files
3. **Local Development**: Start backend and frontend servers
4. **Running Tests**: Backend unit/integration, frontend unit, E2E with Playwright
5. **Database Management**: Migrations, seeding, backup
6. **Document Template Editing**: DOCX template with Mustache syntax
7. **Deployment to Vercel**: CLI commands and configuration
8. **Troubleshooting**: Common issues and solutions
9. **Development Workflow**: Feature development cycle with TDD
10. **Monitoring and Debugging**: Logs, metrics, performance optimization
11. **Security Checklist**: Pre-deployment verification

### Quickstart Output

The complete `quickstart.md` file will provide copy-paste commands, environment variable templates, configuration examples, troubleshooting guides, and security checklists.

**Estimated Setup Time**: 30-60 minutes for experienced developer

## Phase 2: Task Generation

Phase 2 will use the `/speckit.tasks` command to generate the complete `tasks.md` file based on requirements from spec.md, research findings, data model, and API contracts.

**Task Structure**:
- Phase 2: Infrastructure Setup (T001-T014)
- Phase 3: Authentication & User Management (T015-T030)
- Phase 4: Company & Position Management (T031-T050)
- Phase 5: Risk Assessment (T051-T070)
- Phase 6: Document Generation (T071-T090)
- Phase 7: Frontend Implementation (T091-T120)
- Phase 8: Testing & Quality Assurance (T121-T140)
- Phase 9: Deployment & Monitoring (T141-T150)

Each task includes: ID, description, dependencies, acceptance criteria, estimated effort, related requirements.

## Phase 3: Implementation Execution

Phase 3 will use the `/speckit.implement` command to execute all tasks from `tasks.md` in dependency order, with automated testing and quality gate enforcement per Constitution principles.

## Complexity Tracking

### Known Technical Risks

**R1: Document Generation Timeout (Vercel Free 10s limit)**
- **Risk**: Complex documents with 5+ positions may exceed 10s timeout
- **Mitigation**: Implement split strategy (individual position documents + ZIP)
- **Monitoring**: Track generation times in AuditLog, alert if 90th percentile > 8s
- **Remediation**: Optimize template, pre-compile data, upgrade to Vercel Pro if successful

**R2: RLS Performance Degradation**
- **Risk**: Row-Level Security policies add overhead, may slow queries
- **Mitigation**: Add indices on company_id, monitor with EXPLAIN ANALYZE
- **Monitoring**: Log slow queries (> 100ms), review Supabase dashboard
- **Remediation**: Optimize policies, add covering indices, consider read replicas

**R3: Rate Limiting Race Conditions**
- **Risk**: Concurrent requests may bypass 5 docs/day limit
- **Mitigation**: Use SERIALIZABLE isolation, implement idempotency keys
- **Monitoring**: Track rate limit events, log violations
- **Remediation**: Add unique constraints, use Redis for atomic counters post-MVP

**R4: Trial Account Limit Bypass**
- **Risk**: Users may bypass trial limits via direct API calls
- **Mitigation**: Enforce limits in database + application + frontend layers
- **Monitoring**: Track trial usage in AuditLog, alert on violations
- **Remediation**: Review constraints, implement automatic suspension

**R5: DOCX Template Rendering Errors**
- **Risk**: Mustache syntax errors or missing data cause generation failures
- **Mitigation**: Validate template, use default values, comprehensive tests
- **Monitoring**: Log template errors with Error ID, track success rate (target 99%+)
- **Remediation**: Improve error messages, add validation CLI tool

**R6: Referral Bonus Storage Calculation at Scale (Phase 4+)**
- **Risk**: Users with 100+ referrals may experience slow quota calculation (N+1 query problem)
- **Mitigation**: Cache calculated storage_quota_gb, recalculate daily via cron job, index referrer_id
- **Monitoring**: Track query times for calculateStorageQuota(), alert if > 200ms
- **Remediation**: Add materialized view for active_referral_count, implement cache invalidation on subscription changes
- **Note**: Deferred to Phase 4 when referral feature is implemented

**R7: Storage Downgrade Data Loss Prevention**
- **Risk**: User downgrades from 50GB (with referrals) to 1GB (free) - 49GB data at risk
- **Mitigation**: 30-day grace period with email warnings (30d, 14d, 7d, 1d), delete oldest files first (FIFO)
- **Monitoring**: Track downgrade events, file deletion logs, user complaints
- **Remediation**: Implement "freeze" option (pay minimal fee to preserve files), archive to cheaper cold storage

### Constitution Compliance Deviations

**None currently**: All 6 constitutional principles satisfied in plan design. Any deviations identified during implementation will be documented here with justification and remediation plan.

## Next Steps

1. **Execute Phase 0 Research** (3-5 days): Conduct R001-R005 research tasks, document findings in research.md
2. **Complete Phase 1 Deliverables** (3-5 days): Create data-model.md, contracts/api-spec.yaml, quickstart.md
3. **Generate Tasks** (automated): Run `/speckit.tasks` to generate tasks.md
4. **Begin Implementation** (Phase 3): Run `/speckit.implement` with TDD discipline
5. **Monitor Progress**: Track task completion, test coverage, Constitution compliance

**Plan Version**: 1.0.0
**Last Updated**: 2025-10-27
**Status**: Ready for Phase 0 Research
**Constitution Compliance**: ✅ PASS (all 6 principles satisfied)
