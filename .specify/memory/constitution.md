# BZR Portal Constitution
<!-- Sync Impact Report: Version 1.0.0 (Initial Ratification)
  - Version Change: [TEMPLATE] → 1.0.0
  - Rationale: Initial constitution establishment for BZR Portal project
  - Modified Principles: All (created from template)
    * Added: I. Legal Compliance First (Serbian BZR regulations)
    * Added: II. Test-Driven Development (80%+ coverage requirement)
    * Added: III. Security by Design (RBAC, RLS, GDPR)
    * Added: IV. Serbian Language Priority (Cyrillic UI/docs)
    * Added: V. Accessibility Standards (WCAG AA compliance)
    * Added: VI. Multi-Tenancy Isolation (Row-level security)
  - Added Sections:
    * Core Principles (6 principles defined)
    * Technical Standards (stack, testing, deployment)
    * Quality Gates (testing thresholds, review requirements)
    * Governance (amendment process, version control)
  - Removed Sections: None (first version)
  - Templates Requiring Updates:
    ✅ plan-template.md - Constitution Check section references this file
    ✅ spec-template.md - No changes needed (templates remain generic)
    ✅ tasks-template.md - No changes needed (tasks follow spec requirements)
  - Follow-up TODOs:
    * Add RLS policy setup tasks to Phase 2 (T014a)
    * Add RBAC middleware tasks to Phase 2 (T022a-c)
    * Add email verification tasks to Phase 3 (T050a-c)
    * Resolve technology stack inconsistency (Vite vs Next.js) in plan.md
    * Add test implementation tasks (T031a-T037a) before feature work
-->

## Core Principles

### I. Legal Compliance First (NON-NEGOTIABLE)

The BZR Portal MUST comply with Serbian Occupational Health & Safety regulations at all times. This is the immovable foundation of the entire platform.

**Mandatory Requirements**:
- All generated documents MUST conform to "Zakon o bezbednosti i zdravlju na radu" (Sl. glasnik RS br. 101/2005, 91/2015, 113/2017)
- Document structure MUST follow "Pravilnik o preventivnim merama" (Sl. glasnik RS br. 23/2009, 83/2014, 5/2018)
- Risk assessment methodology MUST use E×P×F formula with Serbian interpretation tables
- All mandatory document sections (FR-034 through FR-042) MUST be implemented exactly as specified
- Legal requirement traceability MUST be maintained (LR-001 through LR-007 mapping)

**Validation**:
- Every feature MUST include legal compliance verification
- Generated documents MUST pass Serbian labor inspection review (95%+ compliance rate per SC-002)
- Any change to document generation MUST be reviewed against legal requirements
- Legal advisor consultation REQUIRED for any deviation from specified methodology

**Rationale**: Legal non-compliance exposes customers to regulatory penalties and liability. This platform's primary value proposition is generating legally compliant documents - compromise here invalidates the entire product.

### II. Test-Driven Development (NON-NEGOTIABLE)

All business-critical logic MUST follow strict test-first discipline. Tests are written, reviewed, and confirmed failing BEFORE implementation begins.

**Mandatory Requirements**:
- Risk calculation logic (E×P×F, R < Ri validation, R > 70 flagging) MUST have 100% unit test coverage
- Document generation logic MUST have contract tests verifying output structure
- All API endpoints MUST have integration tests covering success and error cases
- Critical user flows (registration → company creation → position → risk assessment → document generation) MUST have E2E tests
- Overall code coverage target: 80%+ for business logic (per SC-010)

**Testing Stack**:
- Backend Unit Tests: Vitest
- Backend Integration Tests: Vitest + Supertest (or similar)
- Frontend Unit Tests: Vitest + React Testing Library
- Frontend E2E Tests: Playwright
- Contract Validation: JSON Schema validation for API contracts

**Red-Green-Refactor Cycle**:
1. Write test cases covering requirements and edge cases
2. User/team reviews test scenarios for completeness
3. Confirm tests FAIL (red state)
4. Implement feature to pass tests (green state)
5. Refactor while keeping tests green

**Rationale**: Risk calculation errors directly impact worker safety assessments. Document generation bugs create legal compliance issues. Financial and reputational cost of production defects far exceeds upfront testing investment.

### III. Security by Design (NON-NEGOTIABLE)

Security is not a feature - it is a fundamental architectural constraint enforced at every layer.

**Mandatory Requirements**:
- **Authentication**: JWT-based with 15-minute access tokens, 7-day refresh tokens (HTTP-only, SameSite=Strict)
- **Authorization**: Role-Based Access Control (RBAC) with 4 roles (Admin, BZR Officer, HR Manager, Viewer) per FR-029
- **Multi-Tenancy Isolation**: Row-Level Security (RLS) enforced via PostgreSQL policies + application-layer company_id filtering (defense-in-depth per FR-030, FR-053c)
- **Data Protection**: JMBG (national ID) encrypted at rest using AES-256-GCM (FR-031)
- **GDPR Compliance**: Data export, deletion, and audit trail support (FR-032, FR-049)
- **Input Validation**: All inputs validated using Zod schemas on both frontend and backend (FR-016)
- **Rate Limiting**: 100 requests/minute per user, 10 documents/hour, 5 login attempts with 15-min lockout (FR-053d)

**Security Gates**:
- All API endpoints MUST enforce authentication (except public registration/login)
- All database queries MUST filter by company_id (enforced via RLS policies + middleware)
- All sensitive operations MUST log to audit trail (FR-033)
- No secrets in code or version control (.env.example only, actual .env in .gitignore)
- Dependency scanning MUST run in CI/CD (npm audit, Snyk, or equivalent)

**Rationale**: The platform handles sensitive employee data (JMBG), company confidential information, and serves regulated industries. A data breach would be catastrophic for customer trust and regulatory standing. Multi-tenant architecture requires defense-in-depth to prevent cross-tenant data leaks.

### IV. Serbian Language Priority

All user-facing text, error messages, and generated documents MUST be in Serbian Cyrillic (sr-Cyrl-RS).

**Mandatory Requirements**:
- UI components: Serbian Cyrillic labels, buttons, navigation
- Error messages: Serbian Cyrillic with clear guidance (e.g., "PIB broj nije validan. Proverite unos.")
- Generated documents: Serbian Cyrillic per legal requirements (Akt o proceni rizika)
- Database seed data: Hazard types with `hazard_name_sr` in Cyrillic
- API validation messages: Serbian Cyrillic responses
- Email notifications: Serbian Cyrillic templates

**Technical Implementation**:
- i18n setup with sr-Cyrl-RS locale (frontend/src/i18n/)
- DOCX templates designed in Microsoft Word with Cyrillic fonts (Arial, Times New Roman with Serbian Cyrillic support)
- UTF-8 encoding throughout (database, API, frontend)
- Character set testing: Verify special characters (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш) render correctly

**Rationale**: Target audience is Serbian BZR officers and HR professionals. Legal documents MUST be in Serbian Cyrillic per regulatory requirements. English-only interface would be unusable for primary user base.

### V. Accessibility Standards

Public-facing UI MUST meet WCAG 2.1 AA compliance standards to ensure usability for all users.

**Mandatory Requirements**:
- **Keyboard Navigation**: All interactive elements accessible via Tab, Enter, Escape, Arrow keys (FR-054a)
- **Screen Reader Support**: All form inputs with associated `<label>`, error messages with `aria-live="polite"`, risk badges with descriptive `aria-label` (FR-054b)
- **Color Contrast**: 4.5:1 minimum contrast ratio (FR-054c)
  * Green badge: #107C10 on white (low risk)
  * Orange badge: #CA5010 on white (medium risk - not pure yellow for contrast)
  * Red badge: #D13438 on white (high risk)
- **Focus Management**: Modal focus trapping, error-first focus on validation, screen reader announcements for async operations (FR-054d)
- **Text Labels**: All color-coded indicators MUST include text labels (not color-only)

**Testing**:
- Manual keyboard navigation testing for all critical flows
- Screen reader testing (NVDA/JAWS on Windows)
- Automated accessibility audits (axe DevTools, Lighthouse)

**Rationale**: Accessibility is both legal requirement (many jurisdictions) and ethical imperative. BZR officers may have diverse needs. Good accessibility also improves general usability (keyboard shortcuts, clear error messages benefit all users).

### VI. Multi-Tenancy Isolation

Data isolation between companies MUST be absolute and enforced at multiple layers.

**Mandatory Requirements**:
- **Database Layer**: PostgreSQL Row-Level Security (RLS) policies on all multi-tenant tables
  * Policy: `CREATE POLICY company_isolation ON {table} FOR ALL USING (company_id = current_setting('app.current_company_id')::integer)`
  * Exception: Admin role with BYPASSRLS grant (FR-053c)
- **Application Layer**: All queries MUST include `WHERE company_id = user.company_id` filter
- **Middleware**: company_id injection middleware sets PostgreSQL session variable
- **API Layer**: JWT payload includes company_id, validated on every authenticated request

**Multi-Tenant Tables** (MUST have company_id column + RLS policy):
- companies (self-referential for Admin queries)
- work_positions
- risk_assessments
- ppe (personal protective equipment)
- training
- medical_exams
- employees
- documents (generated files)
- audit_logs

**Testing**:
- Integration tests MUST verify cross-tenant access denial (user A cannot read user B's data)
- Penetration testing MUST include tenant isolation attacks (JWT tampering, SQL injection attempts)

**Rationale**: Single shared database architecture (per AS-005) chosen for MVP cost-efficiency and operational simplicity. However, this creates critical security requirement: absolute prevention of cross-tenant data leaks. Customers trust us with confidential company and employee data - a breach would be catastrophic.

## Technical Standards

### Technology Stack (MVP)

**Backend**:
- Runtime: Node.js 20+ / Bun (TypeScript 5.0+ strict mode)
- Framework: Hono (lightweight API framework for Vercel serverless)
- Database: PostgreSQL (Neon, Vercel Postgres, or Supabase managed service)
- ORM: Drizzle ORM with Drizzle Kit for migrations
- Document Generation: docx-templates (Mustache-based DOCX templating)
- Storage: Vercel Blob Storage (or Cloudflare R2 fallback)

**Frontend**:
- Framework: Vite + React 18+ (NOT Next.js for MVP - simpler deployment)
- State Management: Zustand (with persist middleware for auth)
- Data Fetching: TanStack Query (React Query)
- UI Components: shadcn/ui + Tailwind CSS
- Forms: React Hook Form + Zod validation
- i18n: Custom i18n setup for Serbian Cyrillic

**Testing**:
- Unit Tests: Vitest
- Integration Tests: Vitest + Supertest (or Hono test utilities)
- E2E Tests: Playwright
- Coverage Target: 80%+ for business logic (risk calculation, document generation, validation)

**Deployment**:
- Platform: Vercel (Pro plan minimum for 60-second serverless function timeout)
- Database: External PostgreSQL (managed service with 99.9%+ SLA)
- Document Storage: Vercel Blob Storage with signed URLs (1-hour expiration)
- CI/CD: Vercel Git integration (automatic preview deployments, production on main branch)

**Rationale**: Vercel provides excellent developer experience, automatic HTTPS, edge caching, and seamless deployment. Hono is lightweight and optimized for serverless. Vite provides fast builds and excellent TypeScript support without Next.js complexity. Drizzle ORM offers type-safe queries and simple migrations.

### Performance Standards

**API Response Times** (95th percentile):
- GET (read): < 100ms
- POST/PUT (write): < 200ms
- DELETE: < 150ms

**Document Generation** (synchronous):
- Single position (1-10 pages): < 15 seconds
- Multi-position (10-30 pages): < 45 seconds
- Large document (30-100 pages): < 120 seconds

**Concurrent Capacity**:
- 100 concurrent users without degradation
- Database connection pool: 20-50 connections (PgBouncer recommended)

**Frontend Performance**:
- First Contentful Paint (FCP): < 1.5 seconds
- Time to Interactive (TTI): < 3 seconds
- UI interaction response: < 100ms
- Virtual scrolling REQUIRED for lists > 50 items

**Monitoring**:
- Vercel Analytics for frontend metrics
- Database slow query logging (> 100ms threshold)
- Structured logging (Pino) for all critical operations

**Rationale**: Per SC-003, system must handle 10+ concurrent document generations without degradation. Vercel Pro plan (60s timeout) required for large document generation (FR-052b). Performance targets align with industry standards for SaaS applications.

## Quality Gates

### Pre-Implementation Gates

**Before ANY feature work begins**:
1. ✅ Constitution ratified (this document)
2. ✅ Technology stack confirmed (Vite + Hono, not Next.js + Fastify)
3. ✅ Testing framework specified (Vitest for unit, Playwright for E2E)
4. ✅ Project structure created (backend/, frontend/, shared/)
5. ✅ Database connection established (Neon/Vercel Postgres)
6. ⚠️ RLS policies defined (add T014a task)
7. ⚠️ RBAC middleware scaffolded (add T022a-c tasks)
8. ⚠️ Email service integrated (add T050a-c tasks)

### Per-Feature Gates

**Before feature implementation**:
- [ ] Spec requirements mapped to tasks (no orphaned FRs)
- [ ] Test tasks written and reviewed (unit, integration, E2E)
- [ ] Tests confirmed FAILING (red state)

**Before feature completion**:
- [ ] All tests passing (green state)
- [ ] Code coverage ≥ 80% for business logic
- [ ] Manual accessibility testing completed (keyboard nav, screen reader)
- [ ] Legal compliance verified (if document generation affected)
- [ ] Serbian Cyrillic character testing (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш)

### Pre-Deployment Gates

**Before ANY production deployment**:
- [ ] All MVP tests passing (T031-T037 plus Phase 4-6 tests)
- [ ] Security audit completed (JWT validation, RLS policies, rate limiting)
- [ ] Performance testing passed (10 concurrent document generations, 100 concurrent users)
- [ ] DOCX template legal compliance verified (all FR-034-042 sections present)
- [ ] Trial account limits enforced (1 company, 3 positions, 5 documents, 14 days)
- [ ] Database backups configured (automated daily backups, 30-day retention)
- [ ] Monitoring configured (Vercel Analytics, database slow queries, error tracking)
- [ ] Smoke tests passed on staging environment

**Rationale**: Quality gates prevent regression and ensure production readiness. Test-first approach (Principle II) enforced via red-green-refactor cycle. Legal compliance (Principle I) verified before every deployment.

## Governance

### Amendment Process

**Constitution changes require**:
1. Documented rationale (why change is necessary)
2. Impact analysis (affected code, templates, documentation)
3. Version bump proposal (MAJOR/MINOR/PATCH with justification)
4. Approval from project stakeholders
5. Migration plan (if existing code violates new principle)

**Version Semantics**:
- **MAJOR**: Backward-incompatible principle removal or redefinition (requires codebase audit)
- **MINOR**: New principle added or materially expanded guidance (may require new tasks)
- **PATCH**: Clarifications, wording refinements, typo fixes (no code impact)

### Compliance Review

**All pull requests MUST**:
- Verify compliance with all NON-NEGOTIABLE principles (I-VI)
- Include test coverage report (≥ 80% for business logic)
- Pass security checks (no secrets, dependency vulnerabilities, SQL injection risks)
- Include Serbian Cyrillic translations for user-facing text
- Document legal compliance if document generation affected

**Code review checklist**:
- [ ] Tests written before implementation (TDD principle)
- [ ] Authentication + authorization enforced (Security principle)
- [ ] company_id filtering present (Multi-Tenancy principle)
- [ ] Serbian Cyrillic used for UI/errors (Language principle)
- [ ] Accessibility standards followed (WCAG AA principle)
- [ ] Legal requirements traced (Compliance principle)

### Complexity Justification

**Constitution violations MUST be explicitly justified**:
- Document in plan.md "Complexity Tracking" section
- Provide rationale (why violation necessary)
- Define mitigation plan (how risk is managed)
- Set remediation timeline (when will compliance be restored)

**Example violations requiring justification**:
- Skipping RLS policies (temporary direct query for migration script)
- Bypassing test-first for prototype (must rewrite with tests before production)
- Hardcoded English text (acceptable for internal admin tools, not customer-facing UI)

**Review Process**:
- Constitution violations flagged by automated linting (custom ESLint rules where possible)
- Manual review required for any `[COMPLEXITY]` marker in plan.md
- Violations tracked in technical debt register with remediation deadlines

### Runtime Development Guidance

For AI agents and developers implementing features:
- Refer to `CLAUDE.md` (or `AGENT_GUIDANCE.md`) for technology stack, commands, and code style
- Refer to THIS constitution for NON-NEGOTIABLE principles and quality gates
- Refer to `spec.md` for functional requirements and legal traceability
- Refer to `tasks.md` for implementation sequence and dependencies

**Priority Order** (in case of conflict):
1. Constitution principles (immovable foundation)
2. Legal requirements from spec.md (Zakon o BZR, Pravilnik)
3. Functional requirements (FR-001 through FR-055)
4. Non-functional requirements (performance, accessibility, GDPR)
5. Code style and conventions

**Version**: 1.0.0 | **Ratified**: 2025-10-24 | **Last Amended**: 2025-10-24
