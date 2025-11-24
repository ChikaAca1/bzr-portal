# Implementation Plan: BZR Portal - AI-Powered Risk Assessment Platform

**Branch**: `main` | **Date**: 2025-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/main/spec.md`

## Summary

BZR Portal is a comprehensive SaaS platform for Serbian Occupational Health & Safety Risk Assessment, automating the generation of legally compliant "Akt o proceni rizika" documents. The platform replaces manual 2-4 hour Word/Excel workflows with a 10-minute guided process, featuring AI-powered hazard recommendations, mobile-first design with OCR capabilities, multi-tenant architecture with row-level security, and hybrid trial/verification registration flow. Core technical approach: Vite + React 18 frontend, Hono serverless API on Vercel, PostgreSQL (Supabase) with Drizzle ORM, docx-templates for document generation, Wasabi S3 storage, and Resend email service. MVP targets 10 pilot companies with 95%+ legal compliance rate (SC-002) and <10 minute document generation time (SC-001).

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode), Node.js 20+ / Bun
**Primary Dependencies**: React 18+, Vite 5+, Hono 4+, Drizzle ORM, TanStack Query, Zustand, shadcn/ui, Tailwind CSS, docx-templates, AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner), Resend, React Hook Form, Zod, Vitest, Playwright
**Storage**: PostgreSQL 14+ (Supabase managed), Wasabi S3-compatible object storage
**Testing**: Vitest (unit + integration), Playwright (E2E), React Testing Library
**Target Platform**: Web (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), iOS 13+ Safari, Android 8+ Chrome, Progressive Web App (PWA) with offline support
**Project Type**: Web application (frontend + backend serverless API)
**Performance Goals**:
- API response times: GET < 100ms, POST/PUT < 200ms (95th percentile)
- Document generation: Single position < 8s, multi-position (5) < 9s (Vercel Free 10s timeout constraint)
- Concurrent capacity: 100 users without degradation (production), 30-50 users (MVP)
- Frontend: FCP < 1.5s, TTI < 3s, UI interaction < 100ms
**Constraints**:
- Vercel Free plan: 10s serverless function timeout, 100 executions/day, 100GB bandwidth/month (MVP budget constraint)
- Document generation must complete synchronously (no async job queue for MVP)
- Large documents (6+ positions) must use split strategy (individual DOCX per position + ZIP)
- Legal compliance: All documents must conform to Serbian BZR regulations (Zakon 101/2005, Pravilnik 5/2018)
- Serbian Cyrillic UI required for all customer-facing text
- Multi-tenant isolation: Row-Level Security (RLS) + application-layer company_id filtering (defense-in-depth)
- Budget: ~$7/month MVP infrastructure (Wasabi only), upgrade to ~$52/month after 100 paying customers
**Scale/Scope**:
- MVP: 10 pilot companies, 30-50 concurrent users, ~300 documents in 3 months (~150MB storage)
- Production target: 100+ companies, 100+ concurrent users, ~10k documents/year (~5GB storage)
- Database sizing: Single shared PostgreSQL with company_id-based RLS, 10-20 connection pool (MVP), 20-50 (production)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Implementation Gate Evaluation

**Status: ⚠️ PARTIAL COMPLIANCE - 3 items require tasks**

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Legal Compliance First** | ✅ PASS | Spec includes complete legal traceability (LR-001 through LR-007), mandatory document sections (FR-034-042), E×P×F methodology with Serbian interpretation tables, 95%+ compliance target (SC-002) |
| **II. Test-Driven Development** | ✅ PASS | Testing stack specified (Vitest, Playwright), 80%+ coverage target (SC-010), critical paths identified (risk calculation, document generation, validation) |
| **III. Security by Design** | ⚠️ NEEDS TASKS | JWT auth specified (FR-028), RBAC roles defined (FR-029), RLS architecture documented (FR-030, FR-053c), BUT middleware scaffolding tasks not yet created (Action: Add T047-RLS, T048-RBAC, T049-JWT to Phase 3) |
| **IV. Serbian Language Priority** | ✅ PASS | All UI text, error messages, and documents specified in Serbian Cyrillic (FR-028i, FR-204), i18n setup required, hazard types with hazard_name_sr field |
| **V. Accessibility Standards** | ✅ PASS | WCAG AA requirements detailed (FR-054a-d), keyboard nav, screen reader, color contrast (4.5:1), focus management all specified |
| **VI. Multi-Tenancy Isolation** | ⚠️ NEEDS TASKS | RLS policy structure documented (FR-053c with SQL examples), application-layer filtering specified, BUT policy creation tasks not yet added (Action: Add T014-RLS-policies to Phase 1) |
| **VII. AI-First & Mobile-First** | ⚠️ NEEDS RESEARCH | AI features specified (FR-022-024 Phase 2, OCR for mobile), mobile-first design required (375px+, PWA), BUT AI provider selection and OCR service not yet researched (Action: Add research tasks for DeepSeek R1 vs Claude, Tesseract.js vs Google Vision API) |

**Constitution-Mandated Technology Stack Validation**:
- ✅ Backend: Node.js 20+ + Hono (matches constitution Section "Technology Stack")
- ✅ Database: PostgreSQL (Supabase) with Drizzle ORM (matches)
- ✅ Frontend: Vite + React 18 (matches, NOT Next.js per constitution)
- ✅ Storage: Wasabi S3 with AWS SDK v3 (matches)
- ✅ Email: Resend (matches)
- ✅ Testing: Vitest + Playwright (matches)

**Quality Gates Status** (from Constitution Section "Quality Gates"):
1. ✅ Constitution ratified (version 1.1.0, last amended 2025-01-28)
2. ✅ Technology stack confirmed (Vite + Hono, not Next.js + Fastify)
3. ✅ Testing framework specified (Vitest for unit, Playwright for E2E)
4. ⏳ Project structure created (backend/, frontend/, shared/) - **Action: Add T001-scaffolding task**
5. ⏳ Database connection established (Supabase) - **Action: Add T011-db-connection task**
6. ❌ RLS policies defined - **Action: Add T014-RLS-policies task (BLOCKER per constitution)**
7. ❌ RBAC middleware scaffolded - **Action: Add T047-T049 tasks (BLOCKER per constitution)**
8. ❌ Email service integrated - **Action: Add T050-email-integration tasks**

**GATE DECISION**: 🟡 **CONDITIONAL PASS** - Proceed to Phase 0 research, but Phase 3 (implementation) is BLOCKED until T014 (RLS policies), T047-T049 (RBAC middleware), T050 (email integration) are added to tasks.md.

### Phase 1 Design Re-Evaluation

*[To be completed after Phase 1 artifacts generated - will verify data-model.md includes company_id on all multi-tenant tables, contracts/ enforce authentication, quickstart.md includes RLS setup instructions]*

## Project Structure

### Documentation (this feature)

```
specs/main/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - AI providers, OCR services, PWA best practices
├── data-model.md        # Phase 1 output - 11 entities with company_id RLS
├── quickstart.md        # Phase 1 output - Setup instructions for developers
├── contracts/           # Phase 1 output - OpenAPI specs for API endpoints
│   ├── auth.yaml        # Registration, login, email verification, password reset
│   ├── companies.yaml   # Company CRUD operations
│   ├── positions.yaml   # Work position CRUD + wizard steps
│   ├── risks.yaml       # Risk assessment CRUD + E×P×F calculation
│   ├── documents.yaml   # Document generation + download + listing
│   ├── admin.yaml       # Admin dashboard + trial account upgrade
│   └── schema.yaml      # Shared schemas (User, Company, WorkPosition, RiskAssessment, etc.)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
bzr-portal/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts          # FR-028: JWT auth, registration, verification
│   │   │   │   ├── companies.ts     # FR-001: Company CRUD
│   │   │   │   ├── positions.ts     # FR-002: Work position CRUD + wizard
│   │   │   │   ├── risks.ts         # FR-003-007: Risk assessment + calculation
│   │   │   │   ├── ppe.ts           # FR-010: PPE items
│   │   │   │   ├── training.ts      # FR-011: Training requirements
│   │   │   │   ├── medical.ts       # FR-012: Medical exam requirements
│   │   │   │   ├── documents.ts     # FR-008-009: Document generation
│   │   │   │   ├── admin.ts         # FR-028e: Admin dashboard + account upgrade
│   │   │   │   └── health.ts        # Health check endpoint
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts          # JWT validation
│   │   │   │   ├── rbac.ts          # Role-based access control (Admin/BZR/HR/Viewer)
│   │   │   │   ├── rls.ts           # Row-level security (SET LOCAL app.current_company_id)
│   │   │   │   ├── rate-limit.ts    # 100 req/min, 5 docs/day (MVP), 5 login attempts
│   │   │   │   ├── error-handler.ts # Global error handling with Serbian messages
│   │   │   │   └── validation.ts    # Zod schema validation
│   │   │   └── app.ts               # Hono app setup
│   │   ├── db/
│   │   │   ├── schema/
│   │   │   │   ├── users.ts         # User entity with company_id, account_tier, trial_expiry_date
│   │   │   │   ├── companies.ts     # Company entity
│   │   │   │   ├── positions.ts     # WorkPosition entity with company_id
│   │   │   │   ├── risks.ts         # RiskAssessment entity with company_id
│   │   │   │   ├── hazards.ts       # HazardType reference data
│   │   │   │   ├── ppe.ts           # PPE entity with company_id
│   │   │   │   ├── training.ts      # Training entity with company_id
│   │   │   │   ├── medical.ts       # MedicalExam entity with company_id
│   │   │   │   ├── employees.ts     # Employee entity (optional) with company_id
│   │   │   │   ├── documents.ts     # Document metadata with company_id
│   │   │   │   ├── referrals.ts     # Referral tracking (Phase 4+) with company_id
│   │   │   │   ├── files.ts         # UserFile (Phase 4+) with user_id
│   │   │   │   └── audit.ts         # AuditLog entity with company_id
│   │   │   ├── migrations/          # Drizzle migrations (version-controlled)
│   │   │   │   ├── 0001_init.sql
│   │   │   │   ├── 0002_hazards_seed.sql # Serbian hazard codes with effective_date
│   │   │   │   └── 0003_rls_policies.sql # RLS policy creation (CRITICAL per constitution)
│   │   │   ├── seeds/               # Seed data for development
│   │   │   └── index.ts             # Drizzle client setup (Supabase connection)
│   │   ├── services/
│   │   │   ├── document-generator.ts   # FR-008: docx-templates integration
│   │   │   ├── document-split.ts       # FR-052b: Split strategy for large documents
│   │   │   ├── risk-calculator.ts      # FR-004-007: E×P×F calculation + validation
│   │   │   ├── wasabi-storage.ts       # Wasabi S3 integration (AWS SDK v3)
│   │   │   ├── email-service.ts        # Resend integration (FR-028h)
│   │   │   ├── audit-logger.ts         # FR-033: Audit trail
│   │   │   ├── pib-validator.ts        # FR-043b: PIB checksum validation
│   │   │   └── jmbg-encryption.ts      # FR-031: AES-256-GCM encryption
│   │   ├── validation/
│   │   │   ├── schemas/
│   │   │   │   ├── auth.ts          # Registration, login, password reset schemas
│   │   │   │   ├── company.ts       # Company validation (PIB, activity code)
│   │   │   │   ├── position.ts      # Work position validation
│   │   │   │   ├── risk.ts          # Risk assessment validation (E, P, F range, R < Ri)
│   │   │   │   └── common.ts        # Shared validation rules
│   │   │   └── index.ts
│   │   ├── templates/
│   │   │   ├── Akt_Procena_Rizika_Template.docx  # FR-050a: Legal template (Cyrillic)
│   │   │   └── email/
│   │   │       ├── verification.html    # Email verification template (Serbian)
│   │   │       ├── trial-expiry.html    # Trial expiration warning
│   │   │       ├── password-reset.html  # Password reset link
│   │   │       └── document-ready.html  # Document generation notification
│   │   └── utils/
│   │       ├── logger.ts            # Structured logging (Pino)
│   │       ├── jwt.ts               # JWT generation + validation
│   │       └── errors.ts            # Custom error classes
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── risk-calculator.test.ts  # E×P×F formula, R < Ri, R > 70 flagging
│   │   │   ├── pib-validator.test.ts    # PIB checksum algorithm
│   │   │   ├── document-split.test.ts   # Split strategy logic
│   │   │   └── jmbg-encryption.test.ts  # AES-256-GCM encryption
│   │   ├── integration/
│   │   │   ├── auth.test.ts         # Registration → verification → login flow
│   │   │   ├── companies.test.ts    # Company CRUD with RLS filtering
│   │   │   ├── positions.test.ts    # Position creation + wizard steps
│   │   │   ├── risks.test.ts        # Risk assessment CRUD + validation
│   │   │   ├── documents.test.ts    # Document generation + Wasabi upload
│   │   │   └── admin.test.ts        # Trial account upgrade workflow
│   │   ├── e2e/
│   │   │   ├── registration-flow.spec.ts    # User Story 1: Complete registration
│   │   │   ├── risk-assessment-flow.spec.ts # User Story 1: Single position → document
│   │   │   ├── multi-position-flow.spec.ts  # User Story 3: 10+ positions
│   │   │   └── trial-limits.spec.ts         # Trial account limits (3 positions, 5 docs)
│   │   └── fixtures/
│   │       ├── test-data.ts         # Sample companies, positions, risks
│   │       └── mock-responses.ts    # Mocked API responses
│   ├── drizzle.config.ts            # Drizzle Kit configuration
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── modal.tsx
│   │   │   │   ├── badge.tsx        # Risk level indicators (green/yellow/red)
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx    # Main app layout with nav
│   │   │   │   ├── AuthLayout.tsx   # Login/registration layout
│   │   │   │   └── AdminLayout.tsx  # Admin dashboard layout
│   │   │   ├── forms/
│   │   │   │   ├── CompanyForm.tsx      # FR-001: Company profile form
│   │   │   │   ├── PositionWizard.tsx   # FR-017: Multi-step wizard
│   │   │   │   ├── RiskAssessmentForm.tsx # FR-003-007: Risk input with E×P×F
│   │   │   │   ├── PPEForm.tsx          # FR-010: PPE items
│   │   │   │   ├── TrainingForm.tsx     # FR-011: Training requirements
│   │   │   │   └── MedicalForm.tsx      # FR-012: Medical exams
│   │   │   ├── displays/
│   │   │   │   ├── RiskBadge.tsx        # FR-019: Visual risk indicators
│   │   │   │   ├── RiskCalculator.tsx   # FR-018: Real-time E×P×F calculation
│   │   │   │   ├── DocumentPreview.tsx  # FR-020: Document preview
│   │   │   │   └── StorageQuota.tsx     # FR-056k: Storage usage widget
│   │   │   └── common/
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ProgressBar.tsx      # Document generation progress
│   │   │       └── VirtualList.tsx      # FR-021: Virtual scrolling
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── RegisterPage.tsx     # FR-028a: Trial account registration
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── VerifyEmailPage.tsx  # FR-028g: Email verification
│   │   │   │   └── PasswordResetPage.tsx # FR-028k: Password recovery
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx    # Overview + quick actions
│   │   │   ├── companies/
│   │   │   │   ├── CompaniesListPage.tsx
│   │   │   │   ├── CompanyEditPage.tsx
│   │   │   │   └── CompanyDetailsPage.tsx
│   │   │   ├── positions/
│   │   │   │   ├── PositionsListPage.tsx
│   │   │   │   ├── PositionWizardPage.tsx  # Multi-step wizard
│   │   │   │   └── PositionDetailsPage.tsx
│   │   │   ├── documents/
│   │   │   │   ├── DocumentsListPage.tsx
│   │   │   │   └── DocumentGeneratePage.tsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.tsx   # FR-028e: Account upgrade UI
│   │   │   │   ├── UsersListPage.tsx
│   │   │   │   └── MetricsPage.tsx          # Custom metrics dashboard
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── auth.ts          # Auth API client methods
│   │   │   │   ├── companies.ts     # Company API client
│   │   │   │   ├── positions.ts     # Position API client
│   │   │   │   ├── risks.ts         # Risk API client
│   │   │   │   ├── documents.ts     # Document API client
│   │   │   │   └── admin.ts         # Admin API client
│   │   │   └── client.ts            # Axios/Fetch wrapper with JWT interceptor
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Authentication hook
│   │   │   ├── useCompanies.ts      # TanStack Query hook for companies
│   │   │   ├── usePositions.ts      # TanStack Query hook for positions
│   │   │   ├── useRisks.ts          # TanStack Query hook for risks
│   │   │   ├── useDocuments.ts      # TanStack Query hook for documents
│   │   │   └── useRiskCalculation.ts # Real-time E×P×F calculation
│   │   ├── stores/
│   │   │   ├── auth.ts              # Zustand auth store (JWT tokens, user info)
│   │   │   └── wizard.ts            # Position wizard state
│   │   ├── i18n/
│   │   │   ├── sr-Cyrl-RS.json      # Serbian Cyrillic translations
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── globals.css          # Tailwind base styles
│   │   │   └── theme.css            # Risk badge colors (FR-054c)
│   │   ├── types/
│   │   │   ├── api.ts               # API response types
│   │   │   ├── entities.ts          # Entity types (User, Company, WorkPosition, etc.)
│   │   │   └── validation.ts        # Zod schema types
│   │   ├── utils/
│   │   │   ├── format.ts            # Date/number formatting (Serbian locale)
│   │   │   ├── validation.ts        # Client-side validation helpers
│   │   │   └── storage.ts           # LocalStorage helpers (auth token persist)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx               # React Router setup
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── RiskCalculator.test.tsx   # E×P×F calculation component
│   │   │   └── RiskBadge.test.tsx        # Risk badge rendering + aria-label
│   │   ├── integration/
│   │   │   ├── CompanyForm.test.tsx      # Form submission + validation
│   │   │   └── PositionWizard.test.tsx   # Multi-step wizard navigation
│   │   └── e2e/
│   │       ├── registration.spec.ts
│   │       ├── risk-assessment.spec.ts
│   │       └── accessibility.spec.ts     # WCAG AA compliance tests
│   ├── playwright.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── shared/                          # Shared types between frontend/backend
│   ├── types/
│   │   ├── entities.ts              # Common entity interfaces
│   │   └── api.ts                   # API contract types
│   └── validation/
│       └── schemas.ts               # Shared Zod schemas
│
├── .specify/                        # SpecKit configuration
│   ├── templates/
│   ├── scripts/
│   └── memory/
│       └── constitution.md
│
├── specs/                           # Feature specifications
│   └── main/
│       ├── spec.md
│       ├── plan.md                  # This file
│       ├── research.md              # Generated in Phase 0
│       ├── data-model.md            # Generated in Phase 1
│       ├── quickstart.md            # Generated in Phase 1
│       ├── contracts/               # Generated in Phase 1
│       └── tasks.md                 # Generated by /speckit.tasks (not this command)
│
├── docs/
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── security-model.md        # RLS + RBAC + JWT architecture
│   │   └── deployment.md            # Vercel + Supabase + Wasabi setup
│   └── legal/
│       ├── zakon-bzr-summary.md     # Legal requirements summary
│       └── compliance-checklist.md   # Pre-deployment legal verification
│
├── .env.example
├── .gitignore
├── CLAUDE.md                        # Auto-generated tech stack summary
├── README.md
└── package.json                     # Root monorepo package (if using workspaces)
```

**Structure Decision**: Web application structure (Option 2) with backend/ (Hono serverless API), frontend/ (Vite + React), and shared/ (common types/validation). This matches the constitution's technology stack mandate and supports the hybrid trial/verification registration flow with multi-tenant architecture. The backend/ uses Hono for lightweight serverless functions on Vercel, Drizzle ORM for type-safe database access with RLS policies, and docx-templates for document generation. The frontend/ uses Vite for fast builds, React 18 for UI, TanStack Query for server state, Zustand for client state (auth), and shadcn/ui + Tailwind for styling. The shared/ directory contains entity types and Zod schemas used by both frontend (client-side validation) and backend (server-side validation), ensuring DRY principles and type safety across the stack.

## Complexity Tracking

*GATE DECISION: ⚠️ Constitution violations identified that require explicit justification*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Vercel Free 10s timeout for document generation** | MVP budget constraint (~$7/month) requires staying on Vercel Free plan until ~100 paying customers achieved. 10s timeout forces synchronous generation + split strategy for large documents (FR-052b). | **Async job queue (BullMQ + Redis)** rejected because: (1) Adds $10-15/month Redis hosting cost (violates budget), (2) Increases operational complexity (job monitoring, failure retries, queue management), (3) MVP users (<20) can tolerate 8-9s synchronous wait with progress indicator, (4) Split strategy (individual DOCX per position + ZIP) acceptable for 6+ position documents |
| **Single shared database with RLS** (not separate schemas per tenant) | MVP cost optimization: Single Supabase Free tier database (500MB, 50k users) supports 10-100 companies with proper indexing on company_id. RLS policies + application-layer filtering provides defense-in-depth isolation. | **Separate schemas per tenant** rejected because: (1) Schema creation complexity for self-service registration, (2) Connection pooling inefficiency (10-20 connections × N tenants), (3) Migration complexity (apply to all schemas), (4) Single database scales to 1000+ companies with proper indexing, (5) Enterprise customers requiring physical isolation can migrate post-MVP |
| **docx-templates (Mustache) instead of programmatic DOCX generation** | Template-based approach allows BZR legal experts to design template in Microsoft Word (familiar tool) with Cyrillic fonts, then inject dynamic data via Mustache placeholders ({{company.name}}, {{#positions}}...{{/positions}}). Separates legal structure (template) from code logic. | **Programmatic generation (docx library)** rejected because: (1) Requires developers to maintain complex nested XML structure for legal document, (2) Higher risk of formatting errors in 50+ page documents, (3) Legal compliance changes require code changes (not just template updates), (4) Template approach allows non-technical stakeholders to iterate on document design |
| **Hybrid trial/verification registration** (not open self-service) | Serbian market requires trust verification for paid accounts due to: (1) JMBG (national ID) encryption requirements, (2) Legal liability of generated documents, (3) Premium pricing (1,500-6,000 RSD/month) requires sales conversation. Trial accounts (1 company, 3 positions, 5 docs, 14 days) allow self-service evaluation, then verification call upgrades to full access. | **Open self-service with payment gateway** rejected because: (1) Serbian payment processing complexity (no Stripe), (2) Legal advisor consultation needed to verify BZR officer credentials, (3) Onboarding support improves customer success (manual process reduces churn), (4) Trial limits prevent abuse while allowing legitimate evaluation |

**Mitigation Plan**:
1. **Document generation timeout**: Monitor 95th percentile generation times in production; if >8s for single positions, optimize template complexity or upgrade to Vercel Pro ($20/month for 60s timeout) after revenue milestone
2. **RLS isolation**: Penetration testing MUST include tenant isolation attacks (JWT tampering, SQL injection); automated tests verify cross-tenant access denial (integration tests in T031-T037)
3. **Template maintenance**: Version-control template file (backend/templates/Akt_Procena_Rizika_Template.docx); legal compliance review required for any template changes (Principle I gate)
4. **Hybrid registration**: Track trial-to-paid conversion rate (target >20% per SC-007); if conversion <10%, re-evaluate self-service payment integration in Phase 5+

## Phase 0: Research Plan

### Research Questions

**1. AI Service Provider Selection** (for FR-022-024, Constitution Principle VII)
- **Question**: Which AI provider should be used for hazard prediction and corrective measure suggestions?
- **Options**:
  - DeepSeek R1 (Constitution mentions explicitly, cost-effective, reasoning model)
  - Anthropic Claude (Sonnet 3.7, high quality, $3/$15 per million tokens)
  - OpenAI GPT-4o (widely used, $2.50/$10 per million tokens)
  - Local model (Llama 3, free, requires GPU hosting)
- **Evaluation Criteria**: Cost per hazard suggestion (target <$0.01), accuracy (>70% relevance per SC-008), Serbian language support, API reliability, latency (<3s response time)
- **Output**: Decision matrix with cost analysis, sample prompts, test results

**2. OCR Service Selection** (for mobile OCR feature, Constitution Principle VII)
- **Question**: Which OCR service should extract structured data from paper documents (Obrazac 6, existing risk assessments)?
- **Options**:
  - Tesseract.js (open source, runs in browser, free, Cyrillic support)
  - Google Cloud Vision API (high accuracy, $1.50/1000 images, good handwriting recognition)
  - Azure Computer Vision (OCR + form recognition, $1.00/1000 images, Serbian language)
  - Amazon Textract (document analysis, $1.50/1000 pages, table extraction)
- **Evaluation Criteria**: Cyrillic accuracy (test with Serbian forms), cost (<$0.01 per scan target), latency (<5s for mobile), offline capability (PWA requirement), handwriting support
- **Output**: Decision matrix, sample OCR results from test documents, cost projections

**3. PWA Implementation Strategy** (for offline-ready mobile, Constitution Principle VII)
- **Question**: How should Progressive Web App (PWA) be implemented for offline form filling?
- **Research Topics**:
  - Service worker caching strategies (Cache-First vs Network-First for different resources)
  - IndexedDB for offline data storage (form state persistence)
  - Background sync API for deferred document generation
  - Push notifications for document generation completion
  - App manifest configuration (icons, theme colors, install prompts)
- **Evaluation Criteria**: Offline functionality coverage (can complete risk assessment offline?), sync reliability, browser support (iOS Safari limitations), storage quota (50MB+ needed?)
- **Output**: Architecture diagram, service worker implementation patterns, offline-first data flow

**4. Rate Limiting Implementation** (for FR-053d, Vercel serverless constraint)
- **Question**: How should rate limiting be implemented in stateless Vercel serverless functions?
- **Options**:
  - Upstash Redis (serverless Redis, $0.20/100k commands, 10k free/day)
  - Vercel KV (built-in Redis, $0.30/100k commands, requires Pro plan $20/month)
  - Database-based (store counters in PostgreSQL, risk of connection pool exhaustion)
  - In-memory (only works per-instance, not across function invocations)
- **Evaluation Criteria**: MVP budget (<$7/month), reliability (no false positives), latency (<10ms overhead), multi-region support
- **Output**: Decision matrix, cost projections, implementation example with Hono middleware

**5. Document Template Best Practices** (for FR-050a, legal compliance)
- **Question**: What are best practices for maintaining docx-templates with complex Serbian legal structure?
- **Research Topics**:
  - Mustache syntax for nested loops ({{#positions}}...{{/positions}})
  - Conditional rendering ({{#if}}...{{/if}}) for optional sections
  - Table rendering with dynamic rows
  - Page break control
  - Cyrillic font embedding (Arial, Times New Roman)
  - Header/footer with dynamic page numbers
- **Evaluation Criteria**: Template maintainability (non-technical stakeholders can edit?), rendering reliability (no formatting corruption), legal compliance (all FR-034-042 sections)
- **Output**: Template structure guide, Mustache syntax examples, testing checklist

**6. Email Deliverability** (for FR-028h, Resend integration)
- **Question**: How should email deliverability be maximized for trial account verification and notifications?
- **Research Topics**:
  - SPF/DKIM/DMARC configuration for custom domain
  - Email template design (plain text + HTML versions)
  - Resend sandbox vs production domain setup
  - Bounce/complaint handling
  - Serbian character encoding in subject lines
- **Evaluation Criteria**: Deliverability rate (>95% target), setup complexity, cost (Free tier 3,000/month sufficient?)
- **Output**: Domain configuration checklist, email template examples, monitoring setup

### Research Task Breakdown

**Task R001: AI Provider Cost-Benefit Analysis**
- Test DeepSeek R1, Claude Sonnet 3.7, GPT-4o with Serbian hazard prediction prompts
- Measure accuracy (relevance score), latency, cost per request
- Output: Decision matrix in research.md

**Task R002: OCR Service Evaluation**
- Test Tesseract.js, Google Vision, Azure CV with Serbian Obrazac 6 sample forms
- Measure Cyrillic accuracy, handwriting recognition, table extraction, cost
- Output: OCR service recommendation in research.md

**Task R003: PWA Architecture Design**
- Research service worker patterns, IndexedDB strategies, background sync
- Design offline-first data flow (form state → sync → document generation)
- Output: Architecture diagram + implementation patterns in research.md

**Task R004: Rate Limiting Implementation Research**
- Evaluate Upstash Redis vs Vercel KV vs database-based counters
- Cost analysis for MVP (10-20 users) vs production (100+ users)
- Output: Rate limiting strategy recommendation in research.md

**Task R005: Document Template Best Practices**
- Create sample Mustache template with nested loops, conditionals, tables
- Test rendering with docx-templates library
- Output: Template maintenance guide in research.md

**Task R006: Email Deliverability Setup**
- Research Resend domain configuration (SPF/DKIM/DMARC)
- Design email templates (verification, trial expiry, password reset)
- Output: Email setup checklist in research.md

### Research Outputs

**Deliverable**: `research.md` containing:
1. **AI Provider Decision**: Selected provider (DeepSeek R1 or Claude), rationale, cost projections, sample prompts
2. **OCR Service Decision**: Selected service (likely Tesseract.js for free tier, Azure CV for paid), rationale, accuracy benchmarks
3. **PWA Implementation Pattern**: Service worker strategy, offline data flow diagram, IndexedDB schema
4. **Rate Limiting Strategy**: Selected approach (Upstash Redis recommended), cost analysis, Hono middleware example
5. **Document Template Guide**: Mustache syntax patterns, template maintenance workflow, legal compliance checklist
6. **Email Deliverability Checklist**: Domain configuration steps, template design guide, Resend Free tier limitations

## Phase 1: Design Artifacts

### Data Model

**Deliverable**: `data-model.md` containing:
- 11 entities extracted from spec.md (User, Company, WorkPosition, HazardType, RiskAssessment, PPE, Training, MedicalExam, Employee, Referral, UserFile, AuditLog)
- Complete attributes with types (TypeScript + PostgreSQL)
- Relationships (belongs-to, has-many)
- Validation rules from FR-043 (PIB checksum, JMBG format, E/P/F range 1-6, R < Ri)
- Indexes for performance (company_id, user_id, created_at)
- RLS policy annotations (which tables require company_id filtering)
- State transitions (account_tier: trial → full, email_verified: false → true)

**Key Entities**:
1. **User**: email, password_hash, first_name, last_name, role (enum: Admin/BZR Officer/HR Manager/Viewer), company_id (FK), account_tier (enum: trial/full), trial_expiry_date, email_verified, email_verification_token, email_verified_at, storage_quota_gb (calculated), storage_used_bytes, referral_code (8-char unique), referred_by_user_id (FK nullable), created_at, updated_at, deleted_at
2. **Company**: name, address, pib (9 digits + checksum), registration_number, activity_code (4 digits), director, bzr_responsible_person, organization_chart_url, account_tier (enum: trial/full), trial_expiry_date, document_generation_count, work_position_count, created_at, updated_at, deleted_at
3. **WorkPosition**: company_id (FK), position_name, position_code, department, required_education, required_experience, employee_count_male, employee_count_female, employee_count_total, work_hours, job_description, workspace, equipment_used (JSON array), created_at, updated_at, deleted_at
4. **HazardType** (reference data): hazard_code (e.g., "06", "29", "33"), hazard_category (enum: mechanical/electrical/ergonomic/psychosocial), hazard_name_sr (Serbian Cyrillic), hazard_description, effective_date, deprecated_date (nullable), created_at
5. **RiskAssessment**: work_position_id (FK), hazard_id (FK), e_initial (1-6), p_initial (1-6), f_initial (1-6), ri_calculated (E×P×F), corrective_measures (text, min 20 chars), e_residual (1-6), p_residual (1-6), f_residual (1-6), r_calculated (E×P×F), responsible_person, created_at, updated_at, deleted_at, **Constraints**: r_calculated < ri_calculated
6. **Document**: company_id (FK), work_position_ids (JSON array), document_type (enum: single_position/multi_position/consolidated), file_path_s3, file_size_bytes, generation_date, version, status (enum: generating/ready/failed), error_message (nullable), created_by_user_id (FK), created_at

### API Contracts

**Deliverable**: `contracts/` directory with OpenAPI 3.1 YAML files:

**1. auth.yaml** (FR-028 Registration & Authentication)
- `POST /api/auth/register` - Trial account registration (email, password, first_name, last_name, company_name) → 201 Created + verification email sent
- `POST /api/auth/verify-email` - Email verification (token) → 200 OK + trial_expiry_date set (verification_date + 14 days)
- `POST /api/auth/login` - Login (email, password) → 200 OK + JWT access token (15min) + refresh token (7 days, HTTP-only cookie)
- `POST /api/auth/refresh` - Token refresh (refresh token from cookie) → 200 OK + new access token
- `POST /api/auth/logout` - Logout → 200 OK + clear refresh token cookie
- `POST /api/auth/password-reset-request` - Request password reset (email) → 200 OK + reset email sent (token valid 15-60min)
- `POST /api/auth/password-reset` - Reset password (token, new_password) → 200 OK + invalidate all existing tokens
- `GET /api/auth/me` - Get current user info → 200 OK + User object

**2. companies.yaml** (FR-001 Company Management)
- `POST /api/companies` - Create company (name, address, pib, activity_code, director, bzr_responsible_person) → 201 Created + PIB validation
- `GET /api/companies/:id` - Get company details (RLS: only own company unless Admin) → 200 OK + Company object
- `PUT /api/companies/:id` - Update company (partial update) → 200 OK + validation
- `DELETE /api/companies/:id` - Soft delete company (cascade to positions/risks) → 200 OK + confirmation dialog required
- `GET /api/companies/:id/statistics` - Get company stats (position count, document count, risk summary) → 200 OK

**3. positions.yaml** (FR-002, FR-017 Work Position Management)
- `POST /api/positions` - Create work position (wizard step 1: basic info) → 201 Created
- `GET /api/positions` - List work positions (company_id filtered, pagination, virtual scrolling for >50 items) → 200 OK + Position[]
- `GET /api/positions/:id` - Get position details → 200 OK + Position object with related risks/ppe/training
- `PUT /api/positions/:id` - Update position (wizard steps 2-5: job description, work hours, etc.) → 200 OK
- `DELETE /api/positions/:id` - Soft delete position (cascade to risks/ppe/training) → 200 OK
- `GET /api/positions/:id/risk-summary` - Get risk summary (highest R, count by risk level) → 200 OK

**4. risks.yaml** (FR-003-007 Risk Assessment Management)
- `POST /api/positions/:position_id/risks` - Create risk assessment (hazard_id, E/P/F initial, corrective_measures, E/P/F residual) → 201 Created + validation (R < Ri, E/P/F range 1-6)
- `GET /api/positions/:position_id/risks` - List risk assessments for position → 200 OK + RiskAssessment[]
- `GET /api/risks/:id` - Get risk assessment details → 200 OK
- `PUT /api/risks/:id` - Update risk assessment → 200 OK + re-validate R < Ri
- `DELETE /api/risks/:id` - Soft delete risk assessment → 200 OK
- `POST /api/risks/calculate` - Calculate risk score (E, P, F) → 200 OK + {ri: number, r: number, risk_level: "low"|"medium"|"high", warnings: string[]}

**5. documents.yaml** (FR-008-009 Document Generation)
- `POST /api/documents/generate` - Generate document (company_id, position_ids[], document_type) → 201 Created + synchronous generation (8-9s) with progress updates (SSE or polling) → Wasabi S3 upload → pre-signed URL (1hr expiry)
- `GET /api/documents` - List documents (company_id filtered, pagination) → 200 OK + Document[]
- `GET /api/documents/:id` - Get document metadata → 200 OK + Document object
- `GET /api/documents/:id/download` - Download document (pre-signed URL redirect) → 302 Redirect to Wasabi S3
- `POST /api/documents/:id/regenerate` - Regenerate document with current data → 201 Created + new version
- `DELETE /api/documents/:id` - Soft delete document (90-day retention) → 200 OK

**6. admin.yaml** (FR-028e Admin Dashboard)
- `GET /api/admin/users` - List all users (Admin only, pagination, filter by account_tier/email_verified) → 200 OK + User[]
- `GET /api/admin/users/:id` - Get user details (Admin only) → 200 OK + User object with company, documents, audit logs
- `PUT /api/admin/users/:id/upgrade` - Upgrade trial to full access (Admin only, set account_tier='full', clear trial_expiry_date, log audit trail) → 200 OK + confirmation modal
- `GET /api/admin/metrics` - Get platform metrics (total users, documents generated today/week/month, error count, slow queries) → 200 OK + Metrics object
- `GET /api/admin/audit-logs` - List audit logs (Admin only, filter by user_id/entity_type/date_range) → 200 OK + AuditLog[]

**7. schema.yaml** (Shared Schemas)
- User, Company, WorkPosition, HazardType, RiskAssessment, PPE, Training, MedicalExam, Document, AuditLog
- Error responses (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests, 500 Internal Server Error) with Serbian error messages
- Pagination schema (page, limit, total, has_more)
- Validation error schema (field, message in Serbian Cyrillic)

### Quickstart Guide

**Deliverable**: `quickstart.md` containing:
1. **Prerequisites**: Node.js 20+, PostgreSQL 14+ (Supabase account), Wasabi account, Resend account, Git
2. **Environment Setup**: Clone repo, copy .env.example → .env, configure DATABASE_URL, WASABI_*, RESEND_API_KEY, JWT_SECRET
3. **Database Setup**: Run `npm run db:migrate` (Drizzle migrations), seed hazard types `npm run db:seed`, verify RLS policies created
4. **Backend Setup**: Install dependencies `npm install`, run tests `npm test`, start dev server `npm run dev` (http://localhost:3000)
5. **Frontend Setup**: Install dependencies `npm install`, run tests `npm test`, start dev server `npm run dev` (http://localhost:5173)
6. **Document Template Setup**: Place Akt_Procena_Rizika_Template.docx in backend/templates/, verify Mustache placeholders
7. **Running Tests**: Unit tests `npm run test:unit`, integration tests `npm run test:integration`, E2E tests `npm run test:e2e`, coverage report `npm run test:coverage`
8. **Deployment**: Push to GitHub → Vercel auto-deploys, configure production environment variables in Vercel dashboard, verify Supabase connection pooling (PgBouncer), test document generation on staging

### Agent Context Update

**Deliverable**: Updated `CLAUDE.md` (or `AGENT_GUIDANCE.md`) with:
- Active Technologies from research.md decisions (AI provider, OCR service, rate limiting solution)
- Project structure from plan.md (backend/, frontend/, shared/ paths)
- Commands: `npm run dev`, `npm test`, `npm run db:migrate`, `npm run db:seed`, `npm run lint`
- Code style: TypeScript strict mode, Zod validation, Drizzle ORM, Hono routing patterns
- Recent changes: AI provider selected, PWA architecture designed, RLS policies defined

**Implementation**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`

## Phase 2: Task Breakdown

**Note**: Task breakdown is handled by the `/speckit.tasks` command, which reads this plan.md + spec.md + data-model.md + contracts/ and generates tasks.md with dependency-ordered implementation tasks.

**Expected Task Categories** (for reference, NOT generated by this command):
1. **Phase 0 (Research)**: R001-R006 (AI provider, OCR, PWA, rate limiting, templates, email)
2. **Phase 1 (Foundation)**: T001-T015 (Project scaffolding, database schema, migrations, RLS policies, seed data)
3. **Phase 2 (Authentication)**: T016-T030 (JWT middleware, registration, email verification, login, password reset, RBAC)
4. **Phase 3 (Core Features)**: T031-T080 (Companies, positions, risks, PPE, training, medical, risk calculation)
5. **Phase 4 (Document Generation)**: T081-T100 (Template setup, docx-templates integration, Wasabi S3, document generation, split strategy)
6. **Phase 5 (Admin & Testing)**: T101-T130 (Admin dashboard, trial account upgrade, integration tests, E2E tests, accessibility tests)
7. **Phase 6 (Deployment)**: T131-T145 (Vercel setup, Supabase connection pooling, environment config, smoke tests, production deployment)

## Constitution Check Re-Evaluation (Post-Phase 1)

*[To be completed after Phase 1 artifacts generated]*

**Checklist**:
- [ ] **data-model.md** includes company_id on all multi-tenant tables (companies, work_positions, risk_assessments, ppe, training, medical_exams, employees, documents, audit_logs)
- [ ] **data-model.md** specifies RLS policy structure (`CREATE POLICY company_isolation ON {table} FOR ALL USING (company_id = current_setting('app.current_company_id')::integer)`)
- [ ] **contracts/*.yaml** enforce authentication (Bearer JWT token in Authorization header) for all endpoints except /auth/register, /auth/login, /auth/verify-email, /auth/password-reset-request, /auth/password-reset
- [ ] **contracts/schema.yaml** includes Serbian Cyrillic error messages (PIB validation, E/P/F range, R < Ri, etc.)
- [ ] **quickstart.md** includes RLS policy verification step (`SELECT * FROM pg_policies WHERE schemaname = 'public'`)
- [ ] **quickstart.md** includes Serbian character testing checklist (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш in UI, documents, database)

**Gate Decision**: 🟢 **PASS** if all checkboxes above are checked, otherwise 🔴 **FAIL** (regenerate artifacts with corrections).

## Next Steps

**Command Completion**: `/speckit.plan` ends here.

**Artifacts Generated**:
1. ✅ plan.md (this file) - Technical context, constitution check, project structure, Phase 0 research plan, Phase 1 design specifications
2. ⏳ research.md (Phase 0) - AI provider, OCR service, PWA architecture, rate limiting, template best practices, email deliverability
3. ⏳ data-model.md (Phase 1) - 11 entities with attributes, relationships, validation rules, RLS annotations
4. ⏳ contracts/ (Phase 1) - 7 OpenAPI YAML files (auth, companies, positions, risks, documents, admin, schema)
5. ⏳ quickstart.md (Phase 1) - Developer setup guide with prerequisites, environment config, database setup, testing, deployment
6. ⏳ CLAUDE.md update (Phase 1) - Agent context with technologies, commands, code style

**Next Command**: `/speckit.tasks` to generate tasks.md with dependency-ordered implementation tasks (150+ tasks estimated based on spec complexity).

**Blocker Resolution** (before Phase 3 implementation):
- Add T014 (RLS policies creation) to Phase 1 tasks
- Add T047-T049 (RBAC middleware) to Phase 3 tasks
- Add T050 (Email service integration) to Phase 2 tasks

**Branch**: `main`
**Plan Path**: `D:\Users\User\Dropbox\POSO\claudecode\bzr-portal.com\bzr-portal\specs\main\plan.md`
**Status**: ✅ Planning complete, ready for Phase 0 research execution
