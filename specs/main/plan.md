# Implementation Plan: BZR Portal - AI-Powered Risk Assessment Platform

**Branch**: `main` | **Date**: 2025-10-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/main/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a SaaS platform for Serbian Occupational Health & Safety (BZR) compliance that transforms manual Word/Excel workflows into automated, AI-assisted document generation. The MVP enables BZR officers to create legally compliant "Akt o proceni rizika" documents using the E×P×F risk assessment methodology, reducing document creation time from 2-4 hours to under 10 minutes. The platform uses a multi-tenant architecture with trial account onboarding, role-based access control, and synchronous DOCX generation using template-based approach.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode), Node.js 20+ / Bun runtime
**Primary Dependencies**:
  - Frontend: Vite + React 18+ (NOT Next.js for MVP - simpler deployment), TanStack Query, Zustand, shadcn/ui, Tailwind CSS
  - Backend: Hono (lightweight API framework for Vercel serverless), Drizzle ORM (PostgreSQL)
  - Document Generation: docx-templates (Mustache-based DOCX templating)
  - AI: Anthropic Claude API (Phase 2 - hazard prediction)

**Storage**:
  - Database: PostgreSQL (single shared database with company_id RLS)
  - Document Storage: Vercel Blob Storage (or Cloudflare R2 fallback)
  - Template Storage: Git-versioned DOCX template in backend/templates/

**Testing**: Vitest (unit/integration tests), Playwright (E2E tests), target 80%+ code coverage per SC-010 and constitution Principle II (Test-Driven Development)

**Target Platform**:
  - Deployment: Vercel serverless functions + static hosting
  - Database: Vercel Postgres, Neon, or Supabase (managed PostgreSQL)
  - Vercel Pro plan required (60s function timeout for document generation)

**Project Type**: Web application (backend + frontend separation)

**Performance Goals**:
  - API response times: <200ms (95th percentile) for write operations
  - Document generation: <15s (single position), <45s (10-30 pages), <120s (30-100 pages)
  - Concurrent capacity: 100 concurrent users
  - Document download success rate: >99%

**Constraints**:
  - Vercel serverless function timeout: 60s (Pro), 300s (Enterprise) - MVP uses Pro
  - Trial account limits: 1 company, 3 work positions, 5 documents, 14-day expiration
  - Legal compliance: Serbian BZR regulations (Zakon 101/2005, Pravilnik 5/2018)
  - Document format: DOCX with Cyrillic Serbian text, legal template structure
  - Security: JWT auth, RBAC (4 roles), RLS policies, GDPR compliance, JMBG encryption

**Scale/Scope**:
  - MVP target: 10 pilot companies within 3 months
  - System capacity: 1000+ companies (single database with proper indexing)
  - User base: 100 concurrent users (SC-003)
  - Document complexity: Up to 100 pages, 50+ work positions per company

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: N/A - No project constitution defined yet

The project constitution file (`.specify/memory/constitution.md`) contains only template placeholders. Once the project establishes core principles (e.g., testing requirements, architectural patterns, deployment standards), this section will enforce compliance gates.

**Recommendation**: After MVP phase, consider defining constitution principles around:
- Testing strategy (TDD, coverage requirements, contract testing)
- Deployment standards (CI/CD, staging environments, rollback procedures)
- Security practices (OWASP guidelines, dependency scanning, secret management)
- Code quality gates (linting, type safety, code review requirements)

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
│   │   ├── schema/          # Drizzle ORM schemas (users, companies, positions, risks, etc.)
│   │   ├── migrations/      # Database migration files
│   │   └── seed.ts          # Seed data (hazard types from Serbian regulations)
│   ├── models/              # Business domain models (RiskCalculator, DocumentGenerator)
│   ├── services/            # Business logic (AuthService, RiskAssessmentService, DocumentService)
│   ├── api/                 # API routes (Fastify/Hono)
│   │   ├── auth/
│   │   ├── companies/
│   │   ├── positions/
│   │   ├── risks/
│   │   └── documents/
│   ├── middleware/          # Auth, RLS injection, rate limiting, validation
│   ├── lib/                 # Utilities (validation, encryption, blob storage)
│   └── index.ts             # Server entry point
├── templates/
│   └── Akt_Procena_Rizika_Template.docx  # DOCX template with Mustache placeholders
└── tests/
    ├── unit/                # Unit tests (risk calculation, validation)
    ├── integration/         # API integration tests
    └── e2e/                 # Document generation end-to-end tests

frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── forms/           # Multi-step wizard, risk input forms
│   │   ├── tables/          # Position list, risk assessment tables
│   │   └── layouts/         # Dashboard layout, trial banner
│   ├── pages/               # Route pages (Dashboard, Companies, Positions, Documents)
│   ├── hooks/               # Custom React hooks (useAuth, useRiskCalculation)
│   ├── services/            # API client (TanStack Query wrappers)
│   ├── stores/              # Zustand state management (auth store, company store)
│   ├── lib/                 # Utilities (API client, validation, formatters)
│   └── types/               # TypeScript types (shared with backend via contracts)
└── tests/
    ├── unit/                # Component unit tests (Vitest)
    └── e2e/                 # User flow tests (Playwright)

shared/                      # Shared TypeScript types/schemas (Zod validation)
├── types/
└── schemas/

.specify/                    # Specification infrastructure
├── memory/
├── scripts/
└── templates/
```

**Structure Decision**: Web application with backend/frontend separation.

**Rationale**:
- **Backend** uses Fastify/Hono for API serving, deployed as Vercel serverless functions
- **Frontend** uses React with Next.js (inferred from Vercel deployment), deployed as static site with SSR
- **Shared** directory for type safety across frontend/backend via Zod schemas
- **Templates** directory for DOCX template (version-controlled, loaded at generation time)
- Testing at both unit (business logic, components) and E2E (critical user flows) levels

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: N/A - No constitution violations (no constitution defined yet)

