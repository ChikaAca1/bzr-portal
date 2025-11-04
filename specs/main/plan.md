# Implementation Plan: BZR Portal - AI-Powered Risk Assessment Platform

**Branch**: `main` | **Date**: 2025-10-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/main/spec.md`

**Note**: This implementation plan covers the complete MVP platform for Serbian Occupational Health & Safety Risk Assessment.

## Summary

BZR Portal is a SaaS platform that transforms manual 2-4 hour Word/Excel-based risk assessment workflows into automated, AI-assisted document generation completing in under 10 minutes. The system enables Serbian BZR officers to create legally compliant "Akt o proceni rizika" documents meeting requirements of Zakon o bezbednosti i zdravlju na radu (Sl. glasnik RS 101/2005, 91/2015, 113/2017).

**Core Value Proposition**: Generate legally compliant Serbian risk assessment documents with AI assistance, mobile-first field data collection via OCR, and 10x time savings over manual processes.

**MVP Scope**: User registration with trial accounts, company profile management, work position definition, risk assessment using E×P×F methodology, PPE/training/medical exam specification, DOCX document generation, mobile-responsive UI, and admin dashboard for account upgrades.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode), Node.js 20+ / Bun runtime
**Primary Dependencies**:
- Backend: Hono (API framework for Vercel serverless), Drizzle ORM with Drizzle Kit, docx-templates (Mustache DOCX generation), AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner), Resend (email)
- Frontend: React 18+ with Vite, TanStack Query (data fetching), Zustand (state management), shadcn/ui + Tailwind CSS (UI), React Hook Form + Zod (validation)

**Storage**:
- Database: PostgreSQL via Supabase (managed service with RLS policies, connection pooling via PgBouncer)
- Document Storage: Wasabi S3-compatible object storage ($6.99/TB/month, no egress fees)
- File Structure: `documents/{company_id}/{document_id}.docx`, `user-files/{user_id}/{file_id}.{ext}`

**Testing**:
- Unit/Integration: Vitest + Supertest (or Hono test utilities)
- E2E: Playwright
- Coverage Target: 80%+ for business logic (risk calculation, document generation, validation per SC-010)

**Target Platform**:
- Deployment: Vercel (serverless functions for backend + static hosting for frontend)
- Constraints: Vercel Free plan (10s function timeout, 100 executions/day) until 100+ paying customers
- Responsive: 375px mobile (iPhone SE) to 1920px desktop
- PWA: Offline-capable with service worker caching (Phase 4+)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- API: <100ms p95 GET, <200ms p95 POST/PUT
- Document Generation: <8s single position, <9s multi-position (5 positions max due to 10s Vercel timeout)
- Concurrent Users: 100 without degradation (MVP: 30-50 users, 10 pilot companies)
- Frontend: <1.5s FCP, <3s TTI

**Constraints**:
- Budget: ~$7/month MVP infrastructure (Wasabi only, rest free tier) until revenue milestone
- Legal: 100% compliance with Serbian BZR regulations (Zakon 101/2005, Pravilnik 5/2018)
- Language: Serbian Cyrillic (sr-Cyrl-RS) for all UI, errors, documents
- Security: Multi-tenant RLS isolation, RBAC (4 roles), GDPR compliance, AES-256-GCM for JMBG encryption
- Rate Limiting: 5 documents/day/user (MVP), 100 API requests/min/user
- Document Timeout: Split strategy for large documents (>5 positions) due to 10s serverless limit

**Scale/Scope**:
- MVP: 10 pilot companies, 30-50 concurrent users, ~300 documents/3 months (~150MB storage)
- Production: 10,000+ Serbian companies (target market), 100+ concurrent users
- Database: Single shared PostgreSQL with company_id RLS filtering (scales to 1000+ companies)
- Connection Pool: 10-20 connections MVP, 20-50 production (PgBouncer)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Legal Compliance First ✅ PASS

- All document sections (FR-034 through FR-042) mapped to templates
- Risk methodology E×P×F with Serbian interpretation tables specified (RM-001 through RL-004)
- Legal traceability matrix complete (LR-001 through LR-007)
- Target: 95%+ compliance rate per SC-002
- **Action Required**: Phase 1 must include DOCX template design with all mandatory sections

### Principle II: Test-Driven Development ✅ PASS

- Testing stack specified: Vitest (unit/integration), Playwright (E2E)
- Coverage target: 80%+ for business logic (SC-010)
- Critical test areas identified: risk calculation (E×P×F), document generation, validation
- **Action Required**: Phase 2 (tasks.md) must include test tasks BEFORE implementation tasks

### Principle III: Security by Design ✅ PASS

- Authentication: JWT with 15-min access tokens, 7-day refresh tokens (FR-053a)
- Authorization: RBAC with 4 roles defined (FR-053b)
- Multi-Tenancy: RLS policies + application-layer company_id filtering (FR-053c)
- Data Protection: AES-256-GCM for JMBG (FR-031, FR-049c)
- Rate Limiting: 5 docs/day/user MVP, 100 req/min (FR-053d)
- **Action Required**: Phase 1 must define RLS policy SQL, middleware patterns

### Principle IV: Serbian Language Priority ✅ PASS

- All spec requirements in Serbian Cyrillic (FR-028i, error messages specified)
- DOCX templates designed with Cyrillic fonts per FR-050a
- i18n structure required (frontend/src/i18n/ for sr-Cyrl-RS locale)
- **Action Required**: Phase 1 must include i18n key structure, Phase 2 translation tasks

### Principle V: Accessibility Standards ✅ PASS

- WCAG 2.1 AA compliance required (FR-054a through FR-054d)
- Keyboard navigation, screen reader support, 4.5:1 contrast ratios specified
- Color + text labels for risk indicators (not color-only)
- **Action Required**: Phase 2 must include manual accessibility testing tasks

### Principle VI: Multi-Tenancy Isolation ✅ PASS

- Architecture: Single shared PostgreSQL with RLS (AS-005)
- All multi-tenant tables identified (9 tables with company_id + RLS policies)
- Defense-in-depth: RLS + application middleware (FR-053c)
- **Action Required**: Phase 1 must document RLS policy templates, Phase 2 integration tests for cross-tenant access denial

### Principle VII: AI-First & Mobile-First Experience ✅ PASS (with scope clarification)

**MVP Phase (MANDATORY)**:
- ✅ Mobile-first responsive UI (375px to 1920px) - REQUIRED for all features
- ✅ Mobile-optimized forms and document preview
- ✅ Touch-friendly interactions and navigation

**Post-MVP Growth (SHOULD prioritize after validation)**:
- ⏳ AI-powered hazard prediction based on job descriptions (Phase 2+)
- ⏳ AI-suggested corrective measures from knowledge base (Phase 2+)
- ⏳ OCR integration for field data capture from mobile photos (Phase 3+)
- ⏳ Offline-capable PWA architecture with service workers (Phase 4+)

**Rationale for Deferral**:
- MVP focuses on proving core value proposition (manual → automated document generation) within budget constraints (~$7/month infrastructure)
- AI features require additional LLM API costs (Anthropic Claude) and development complexity, justified only after achieving 10+ pilot customers and revenue validation
- 3-month MVP timeline prioritizes legally compliant document generation over AI enhancement
- Architecture designed to support AI integration (Phase 2) without MVP refactoring

**GATE STATUS**: ✅ PASS - Mobile-first UI is mandatory and specified; AI/OCR/PWA appropriately phased based on documented budget and timeline constraints

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── db/
│   │   ├── schema/           # Drizzle ORM schema definitions
│   │   │   ├── users.ts
│   │   │   ├── companies.ts
│   │   │   ├── work-positions.ts
│   │   │   ├── risk-assessments.ts
│   │   │   ├── hazard-types.ts  # Reference data
│   │   │   ├── ppe.ts
│   │   │   ├── training.ts
│   │   │   ├── medical-exams.ts
│   │   │   └── referrals.ts
│   │   ├── migrations/       # Drizzle Kit generated migrations
│   │   └── seed/            # Initial data (hazard codes, etc.)
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.ts      # Login, register, password reset
│   │   │   ├── companies.ts
│   │   │   ├── positions.ts
│   │   │   ├── risks.ts
│   │   │   ├── documents.ts # Document generation
│   │   │   └── admin.ts     # Account upgrades
│   │   └── middleware/
│   │       ├── auth.ts      # JWT validation
│   │       ├── rbac.ts      # Role-based access control
│   │       ├── rls.ts       # company_id injection
│   │       └── rate-limit.ts
│   ├── services/
│   │   ├── risk-calculator.ts    # E×P×F logic
│   │   ├── document-generator.ts # docx-templates integration
│   │   ├── storage.ts           # Wasabi S3 client
│   │   ├── email.ts             # Resend integration
│   │   └── encryption.ts        # JMBG AES-256-GCM
│   ├── validation/
│   │   └── schemas.ts       # Zod schemas (shared with frontend)
│   └── index.ts            # Hono app entry point
├── templates/
│   └── Akt_Procena_Rizika_Template.docx  # Mustache DOCX template
└── tests/
    ├── unit/
    │   ├── risk-calculator.test.ts
    │   └── validation.test.ts
    ├── integration/
    │   ├── api/             # Endpoint tests
    │   └── rls.test.ts      # Cross-tenant isolation
    └── e2e/                 # Playwright tests (run against full stack)

frontend/
├── src/
│   ├── components/
│   │   ├── auth/            # Login, Register forms
│   │   ├── company/         # Company profile forms
│   │   ├── positions/       # Position wizard
│   │   ├── risk-assessment/ # E/P/F input, risk tables
│   │   ├── documents/       # Document list, download
│   │   ├── admin/           # Admin dashboard
│   │   └── ui/             # shadcn/ui components
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── PositionWizardPage.tsx
│   │   └── AdminPage.tsx
│   ├── services/
│   │   └── api.ts          # TanStack Query hooks
│   ├── stores/
│   │   └── auth.ts         # Zustand auth store
│   ├── i18n/
│   │   ├── sr-Cyrl-RS.ts   # Serbian Cyrillic translations
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css     # Tailwind + custom CSS
│   └── main.tsx
└── tests/
    └── components/         # React Testing Library

shared/                      # (Optional) Shared types between frontend/backend
└── types/
    └── api.ts

.specify/                    # Speckit templates and constitution
├── memory/
│   └── constitution.md
├── templates/
└── scripts/

specs/main/                  # This feature's documentation
├── spec.md
├── plan.md                 # This file
├── research.md             # Phase 0 output
├── data-model.md           # Phase 1 output
├── quickstart.md           # Phase 1 output
├── contracts/              # Phase 1 output
│   └── api-openapi.yaml
└── tasks.md                # Phase 2 output (NOT created by /speckit.plan)
```

**Structure Decision**: Web application (Option 2 from template) with `backend/` and `frontend/` separation. Chosen because:
1. Clear separation of concerns (API vs UI)
2. Independent deployment possible (Vercel serverless functions for backend, static hosting for frontend)
3. Supports future mobile app via shared API
4. TypeScript shared types via `shared/` directory

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - All constitution principles satisfied or justified in Constitution Check section above.

