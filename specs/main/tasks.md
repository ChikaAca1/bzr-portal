# Implementation Tasks: BZR Portal

**Feature**: BZR Portal - AI-Powered Risk Assessment Platform
**Branch**: `main`
**Generated**: 2025-10-29
**Source**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md)

---

## Overview

This task breakdown organizes implementation by user story priority to enable independent, incremental delivery. Each story includes test-first development per Constitution Principle II (TDD).

**MVP Scope**: User Story 1 (P1) - Single Work Position Risk Assessment

**Total Tasks**: 181
- **Test Tasks**: 53
- **Implementation Tasks**: 128

---

## Task Organization

### Phases

1. **Phase 1: Setup** (T001-T015) - Project initialization
2. **Phase 2: Foundational** (T016-T050) - Auth, RBAC, RLS (BLOCKING for all stories)
3. **Phase 3: User Story 1 - MVP** (T051-T116) - Core risk assessment workflow
4. **Phase 4: User Story 2 - PPE & Training** (T117-T141) - Additional compliance
5. **Phase 5: User Story 3 - Multiple Positions** (T142-T153) - Scaling
6. **Phase 6: Polish & Production** (T154-T181) - Deployment readiness

### Parallelization

- **[P] marker**: Tasks can run in parallel (different files, no incomplete dependencies)
- **[US#] marker**: User Story affiliation ([US1], [US2], [US3])

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize project structure, install dependencies, configure tooling

- [x] T001 Initialize Git repository with .gitignore for Node.js, TypeScript, .env files
- [x] T002 Create project structure: backend/, frontend/, shared/, .specify/, specs/
- [x] T003 [P] Initialize backend package.json with Hono, Drizzle ORM, docx-templates, AWS SDK v3, Resend, Vitest in backend/package.json
- [x] T004 [P] Initialize frontend package.json with Vite, React 18, TanStack Query, Zustand, shadcn/ui in frontend/package.json
- [x] T005 [P] Configure TypeScript strict mode in backend/tsconfig.json
- [x] T006 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [x] T007 [P] Configure ESLint + Prettier with Serbian Cyrillic support in .eslintrc.json
- [x] T008 [P] Setup Vitest configuration in backend/vitest.config.ts
- [x] T009 [P] Setup Playwright configuration in frontend/playwright.config.ts
- [x] T010 Create .env.example with environment variables (DATABASE_URL, WASABI_*, RESEND_API_KEY, JWT_SECRET, ENCRYPTION_KEY)
- [x] T011 [P] Configure Drizzle ORM in backend/drizzle.config.ts
- [x] T012 [P] Configure Vercel deployment (10s timeout, /api/* routing) in vercel.json
- [x] T013 [P] Setup Tailwind CSS with Noto Sans (Cyrillic) and mobile breakpoints in frontend/tailwind.config.ts
- [x] T014 [P] Create shared TypeScript types in shared/types/api.ts
- [ ] T015 Initialize Husky pre-commit hooks in .husky/pre-commit

**Validation**: Run `npm install` in backend/ and frontend/, verify no errors

---

## Phase 2: Foundational Infrastructure (BLOCKING)

**Goal**: Implement authentication, authorization, RLS required by ALL user stories

**Test Coverage**: 80%+ for auth, RBAC, RLS per Constitution

### Database Foundation

- [x] T016 Create users schema (id, email, password_hash, role, company_id, account_tier, trial_expiry_date, email_verified, email_verification_token, email_verified_at) in backend/src/db/schema/users.ts
- [x] T017 Create companies schema (id, name, address, activity_code, pib, director, bzr_responsible_person) in backend/src/db/schema/companies.ts
- [x] T018 Create audit_logs schema (id, user_id, entity_type, action, timestamp, old_values, new_values) in backend/src/db/schema/audit-logs.ts
- [x] T019 Generate initial database migration using Drizzle Kit in backend/src/db/migrations/
- [x] T020 Create PostgreSQL RLS policies SQL for users/companies tables in backend/src/db/migrations/0002_rls_policies.sql
- [x] T021 Create seed script for hazard types (hazard_code, hazard_name_sr, effective_date) in backend/src/db/seed/hazard-types.ts

### Authentication & Security - Tests First (TDD)

- [ ] T022 [P] Write password validation tests (bcrypt, 8+ chars, complexity) in backend/tests/unit/auth/password.test.ts
- [x] T023 [P] Write JWT tests (15-min access, 7-day refresh, payload structure) in backend/tests/unit/lib/jwt.test.ts
- [ ] T024 [P] Write email verification token tests (7-day expiry, single-use) in backend/tests/unit/auth/verification.test.ts
- [ ] T025 [P] Write password reset token tests (15-60 min expiry) in backend/tests/unit/auth/reset-token.test.ts
- [ ] T026 [P] Write registration tests (POST /api/auth/register) in backend/tests/integration/auth/register.test.ts
- [ ] T027 [P] Write email verification tests (POST /api/auth/verify-email) in backend/tests/integration/auth/verify.test.ts
- [ ] T028 [P] Write login tests (POST /api/auth/login) in backend/tests/integration/auth/login.test.ts
- [ ] T029 [P] Write password reset tests (POST /api/auth/forgot-password, POST /api/auth/reset-password) in backend/tests/integration/auth/password-reset.test.ts

### Authentication & Security - Implementation

- [x] T030 Implement password hashing service using bcrypt in backend/src/services/password.ts
- [x] T031 Implement JWT service (access/refresh token generation) in backend/src/services/jwt.ts
- [x] T032 Implement email verification token service in backend/src/services/verification-token.ts
- [x] T033 Implement password reset token service in backend/src/services/reset-token.ts
- [x] T034 Implement Resend email service (Serbian Cyrillic templates) in backend/src/services/email.ts
- [x] T035 Create Serbian Cyrillic email templates (verification, password reset) in backend/src/templates/emails/
- [x] T036 Implement registration endpoint with trial account creation in backend/src/api/routes/auth.ts
- [x] T037 Implement email verification endpoint (sets trial_expiry_date = now + 14 days) in backend/src/api/routes/auth.ts
- [x] T038 Implement login endpoint with JWT issuance in backend/src/api/routes/auth.ts
- [x] T039 Implement password reset request endpoint in backend/src/api/routes/auth.ts
- [x] T040 Implement password reset completion endpoint in backend/src/api/routes/auth.ts

### RBAC & RLS Middleware - Tests First

- [x] T041 [P] Write RBAC middleware tests (Admin, BZR Officer, HR Manager, Viewer) in backend/tests/unit/middleware/rbac.middleware.test.ts
- [x] T042 [P] Write RLS middleware tests (company_id session variable injection) in backend/tests/integration/auth.middleware.test.ts
- [x] T043 [P] Write cross-tenant access denial tests (user A cannot read user B's data) in backend/tests/integration/rls/cross-tenant.test.ts
- [x] T044 [P] Write rate limiting tests (5 docs/day, 100 req/min) in backend/tests/integration/rate-limit.middleware.test.ts

### RBAC & RLS Middleware - Implementation

- [x] T045 Implement JWT authentication middleware in backend/src/api/middleware/auth.ts
- [x] T046 Implement RBAC authorization middleware in backend/src/api/middleware/rbac.ts
- [x] T047 Implement RLS middleware (sets PostgreSQL app.current_company_id) in backend/src/api/middleware/rls.middleware.ts
- [x] T048 Implement rate limiting middleware (hono-rate-limiter) in backend/src/api/middleware/rate-limit.ts
- [x] T049 Implement audit logging service in backend/src/services/audit-logger.ts
- [x] T050 Implement structured logging (Pino) in backend/src/services/logger.ts

**Validation**: All Phase 2 tests passing, cross-tenant isolation verified

---

## Phase 3: User Story 1 - Single Work Position Risk Assessment (MVP)

**Priority**: P1 (MVP)

**Goal**: BZR officer creates complete Risk Assessment Act for ONE position, generates legally compliant DOCX

**Independent Test**: User creates company, defines position, assesses risks with E×P×F, downloads DOCX matching Serbian requirements (FR-034-042)

**Prerequisites**: Phase 2 complete

### Database Schema

- [x] T051 Create work_positions schema (id, company_id, position_name, department, required_education, employees_male, employees_female, work_hours_daily, job_description) in backend/src/db/schema/work-positions.ts
- [x] T052 Create risk_assessments schema (id, position_id, hazard_id, initial_e, initial_p, initial_f, initial_ri, corrective_measures, residual_e, residual_p, residual_f, residual_r) in backend/src/db/schema/risk-assessments.ts
- [x] T053 Create hazard_types schema (id, hazard_code, hazard_name_sr, hazard_description, effective_date) in backend/src/db/schema/hazards.ts
- [ ] T054 Generate database migration for US1 entities in backend/src/db/migrations/
- [ ] T055 Create indexes on work_positions(company_id), risk_assessments(position_id) in backend/src/db/migrations/
- [ ] T056 Apply PostgreSQL RLS policies to work_positions, risk_assessments in backend/src/db/migrations/

### Validation Schemas

- [ ] T057 [P] Create Zod schema for company validation (PIB checksum per FR-043b) in backend/src/validation/schemas.ts
- [x] T057a [P] Implement PIB modulo-11 checksum validation function with unit tests per FR-043b algorithm in backend/src/validation/pib-validator.ts (used by T057 Zod schema)
- [ ] T058 [P] Create Zod schema for work position validation in backend/src/validation/schemas.ts
- [ ] T059 [P] Create Zod schema for risk assessment validation (R < Ri per FR-044b) in backend/src/validation/schemas.ts

### Risk Calculator - Tests First (TDD - CRITICAL)

- [x] T060 [P] [US1] Write Ri = E × P × F tests in backend/tests/unit/services/risk-calculator.test.ts
- [x] T061 [P] [US1] Write R < Ri validation tests in backend/tests/unit/services/risk-calculator.test.ts
- [x] T062 [P] [US1] Write R > 70 high-risk flagging tests in backend/tests/unit/services/risk-calculator.test.ts
- [x] T063 [P] [US1] Write E/P/F range (1-6) validation tests in backend/tests/unit/services/risk-calculator.test.ts

### Risk Calculator - Implementation

- [x] T064 [US1] Implement risk calculator service (calculateRi, validateReduction, isHighRisk) in backend/src/services/risk-calculator.ts

### Company Management - Tests First

- [x] T065 [P] [US1] Write company creation tests (POST /api/companies) in backend/tests/contract/company.contract.test.ts
- [x] T066 [P] [US1] Write company retrieval tests (GET /api/companies/:id) in backend/tests/contract/company.contract.test.ts
- [x] T067 [P] [US1] Write company update tests (PATCH /api/companies/:id) in backend/tests/contract/company.contract.test.ts

### Company Management - Implementation

- [x] T068 [US1] Implement CompanyService (create, findById, update) in backend/src/services/company-service.ts
- [x] T069 [US1] Implement company API routes (POST, GET, PATCH /api/companies/:id) in backend/src/api/routes/companies.ts

### Work Position Management - Tests First

- [x] T070 [P] [US1] Write position creation tests (POST /api/positions) in backend/tests/contract/position.contract.test.ts
- [x] T071 [P] [US1] Write position retrieval tests (GET /api/positions/:id) in backend/tests/contract/position.contract.test.ts
- [x] T072 [P] [US1] Write position list tests (GET /api/companies/:companyId/positions) in backend/tests/contract/position.contract.test.ts

### Work Position Management - Implementation

- [x] T073 [US1] Implement PositionService (create, findById, findByCompany) in backend/src/services/position-service.ts
- [x] T074 [US1] Implement position API routes (POST, GET, DELETE /api/positions/:id) in backend/src/api/routes/positions.ts

### Risk Assessment Management - Tests First

- [x] T075 [P] [US1] Write risk creation tests (POST /api/risks) in backend/tests/contract/risk.contract.test.ts
- [x] T076 [P] [US1] Write risk retrieval tests (GET /api/positions/:positionId/risks) in backend/tests/contract/risk.contract.test.ts
- [x] T077 [P] [US1] Write duplicate hazard prevention tests in backend/tests/contract/risk.contract.test.ts

### Risk Assessment Management - Implementation

- [x] T078 [US1] Implement RiskService (create, findByPosition, update) in backend/src/services/risk-service.ts
- [x] T079 [US1] Implement risk assessment API routes (POST, GET, PATCH /api/risks/:id) in backend/src/api/routes/risks.ts

### Document Generation - Template Creation (PREREQUISITE)

- [x] T084 [US1] Create DOCX template with FR-034-042 sections in backend/templates/Akt_Procena_Rizika_Template.docx
  - **Acceptance Criteria**:
    - ✅ Cover page with company name placeholder {{company_name}}
    - ✅ Section 1: Uvod with legal basis text
    - ✅ Section 2: Podaci o poslodavcu with {{company_address}}, {{company_pib}}, {{company_director}}
    - ✅ Sections 3-8 per FR-034 through FR-042
    - ✅ Signature block with blank lines for manual signing
    - ✅ Serbian Cyrillic font (Noto Sans or equivalent) for all text
    - ✅ Mustache syntax validated (no syntax errors when rendering with sample data)

### Document Generation - Tests First (DEPENDS ON T084)

- [x] T080 [P] [US1] Write template data compilation tests in backend/tests/unit/services/document-generator.test.ts
  - **Prerequisites**: T084 (template must exist)
- [x] T081 [P] [US1] Write document timeout tests (< 8s per FR-052b) in backend/tests/unit/services/document-generator.test.ts
  - **Prerequisites**: T084
- [x] T082 [P] [US1] Write generation endpoint tests (POST /api/documents/generate) in backend/tests/integration/api/documents.test.ts
  - **Prerequisites**: T084
- [x] T083 [P] [US1] Write download tests (GET /api/documents/:id/download) in backend/tests/integration/api/documents.test.ts
  - **Prerequisites**: T084

### Document Generation - Implementation

- [x] T085 [US1] Implement Wasabi S3 client (upload, generatePresignedUrl) in backend/src/services/storage.ts
- [x] T086 [US1] Implement document generator (docx-templates integration) in backend/src/services/document-generator.ts
  - **Prerequisites**: T084 (uses template file)
- [x] T087 [US1] Implement document API routes (POST /api/documents/generate, GET download) in backend/src/api/routes/documents.ts

### Frontend - Company & Position Forms

- [x] T088 [P] [US1] Create Serbian Cyrillic i18n translations in frontend/src/i18n/sr-Cyrl-RS.ts
- [x] T089 [P] [US1] Create i18n utility function (t()) in frontend/src/i18n/index.ts
- [x] T090 [P] [US1] Setup shadcn/ui components (button, form, input, select, table) in frontend/src/components/ui/
- [x] T091 [US1] Create Zustand auth store (user, accessToken, login, logout) in frontend/src/stores/auth.ts
- [x] T092 [US1] Create TanStack Query hooks for companies (useCompanies, useCreateCompany) in frontend/src/services/api/companies.ts
- [x] T093 [US1] Create CompanyForm component with PIB validation in frontend/src/components/forms/CompanyForm.tsx
- [x] T094 [US1] Create TanStack Query hooks for positions (usePositions, useCreatePosition) in frontend/src/services/api/positions.ts
- [x] T095 [US1] Create PositionForm component in frontend/src/components/forms/PositionWizard.tsx

### Frontend - Risk Assessment Wizard

- [x] T096 [P] [US1] Create TanStack Query hooks for risks (useRisks, useCreateRisk, useHazardTypes) in frontend/src/services/api/risks.ts
- [x] T097 [P] [US1] Create HazardSelector component in frontend/src/components/risk-assessment/HazardSelector.tsx
- [x] T098 [US1] Create RiskInputs (E/P/F with real-time Ri calculation) in frontend/src/components/risk-assessment/RiskInputs.tsx
- [x] T099 [US1] Create CorrectiveMeasures textarea (20-char minimum) in frontend/src/components/risk-assessment/CorrectiveMeasures.tsx
- [x] T100 [US1] Create ResidualRiskInputs (R < Ri validation, R > 70 warning) in frontend/src/components/risk-assessment/ResidualRiskInputs.tsx
- [x] T101 [US1] Create RiskTable with color-coded badges (green ≤36, yellow 36-70, red >70) in frontend/src/components/risk-assessment/RiskTable.tsx

### Frontend - Document Generation

- [x] T102 [P] [US1] Create TanStack Query hooks for documents (useGenerateDocument, useDocumentDownload) in frontend/src/services/api/documents.ts
- [x] T103 [US1] Create GenerateDocument button with progress indicator in frontend/src/components/documents/GenerateDocument.tsx
- [x] T104 [US1] Create DocumentList component in frontend/src/components/documents/DocumentList.tsx
- [x] T105 [US1] Create DocumentPreview modal in frontend/src/components/documents/DocumentPreview.tsx

### Frontend - Pages & Routing

- [x] T106 [P] [US1] Create LoginPage in frontend/src/pages/LoginPage.tsx
- [x] T107 [P] [US1] Create RegisterPage in frontend/src/pages/RegisterPage.tsx
- [x] T108 [P] [US1] Create VerifyEmailPage in frontend/src/pages/VerifyEmailPage.tsx
- [x] T109 [P] [US1] Create ForgotPasswordPage in frontend/src/pages/ForgotPasswordPage.tsx
- [x] T110 [P] [US1] Create ResetPasswordPage in frontend/src/pages/ResetPasswordPage.tsx
- [x] T111 [US1] Create DashboardPage with trial banner in frontend/src/pages/DashboardPage.tsx
- [x] T112 [US1] Create CompanyProfilePage in frontend/src/pages/CompanyProfilePage.tsx
- [x] T113 [US1] Create PositionWizardPage (multi-step) in frontend/src/pages/PositionWizardPage.tsx
- [x] T114 [US1] Create DocumentsPage in frontend/src/pages/DocumentsPage.tsx
- [x] T115 [US1] Setup React Router with protected routes in frontend/src/main.tsx

### E2E Testing (User Story 1 Acceptance)

- [x] T116 [US1] Write complete US1 E2E test: register → verify → company → position → risks → generate → download in frontend/tests/e2e/user-story-1.spec.ts

**Phase 3 Validation**: E2E test T116 passes, DOCX opens in Word with all FR-034-042 sections

---

## Phase 4: User Story 2 - PPE & Training Management

**Priority**: P2

**Goal**: BZR officer defines PPE items and training schedules

**Prerequisites**: Phase 3 complete

### Database Schema

- [x] T117 Create ppe schema (id, position_id, ppe_type, en_standard, quantity) in backend/src/db/schema/ppe.ts
- [x] T118 Create training schema (id, position_id, training_type, frequency_months, duration_hours) in backend/src/db/schema/training.ts
- [x] T119 Create medical_exams schema (id, position_id, exam_type, frequency_months) in backend/src/db/schema/medical-exams.ts
- [ ] T120 Generate US2 migration in backend/src/db/migrations/
- [ ] T121 Apply RLS policies for US2 in backend/src/db/migrations/

### Backend - Tests First

- [ ] T122 [P] [US2] Write PPE endpoint tests (POST, GET, DELETE /api/ppe) in backend/tests/integration/api/ppe.test.ts
- [ ] T123 [P] [US2] Write training endpoint tests in backend/tests/integration/api/training.test.ts
- [ ] T124 [P] [US2] Write medical exam endpoint tests in backend/tests/integration/api/medical-exams.test.ts
- [ ] T125 [P] [US2] Write PPE document generation tests in backend/tests/unit/services/document-generator-ppe.test.ts

### Backend - Implementation

- [ ] T126 [US2] Implement PPEService in backend/src/services/ppe-service.ts
- [ ] T127 [US2] Implement TrainingService in backend/src/services/training-service.ts
- [ ] T128 [US2] Implement MedicalExamService in backend/src/services/medical-exam-service.ts
- [ ] T129 [US2] Implement PPE routes in backend/src/api/routes/ppe.ts
- [ ] T130 [US2] Implement training routes in backend/src/api/routes/training.ts
- [ ] T131 [US2] Implement medical exam routes in backend/src/api/routes/medical-exams.ts
- [ ] T132 [US2] Update document generator for PPE/training sections in backend/src/services/document-generator.ts
- [ ] T133 [US2] Update DOCX template with PPE/training sections in backend/templates/Akt_Procena_Rizika_Template.docx

### Frontend

- [ ] T134 [P] [US2] Create PPE API hooks in frontend/src/services/api/ppe.ts
- [ ] T135 [P] [US2] Create training API hooks in frontend/src/services/api/training.ts
- [ ] T136 [P] [US2] Create medical exam API hooks in frontend/src/services/api/medical-exams.ts
- [ ] T137 [US2] Create PPEManager component in frontend/src/components/ppe/PPEManager.tsx
- [ ] T138 [US2] Create TrainingManager component in frontend/src/components/training/TrainingManager.tsx
- [ ] T139 [US2] Create MedicalExamManager component in frontend/src/components/medical-exams/MedicalExamManager.tsx
- [ ] T140 [US2] Update PositionWizardPage with PPE/training steps in frontend/src/pages/PositionWizardPage.tsx

### E2E Testing

- [ ] T141 [US2] Write US2 E2E test: position → PPE → training → medical → generate → verify sections in frontend/tests/e2e/user-story-2.spec.ts

**Phase 4 Validation**: E2E test T141 passes, document includes PPE/training/medical sections

---

## Phase 5: User Story 3 - Multiple Work Positions

**Priority**: P3

**Goal**: Manage company with 10+ positions, generate consolidated or individual documents

**Prerequisites**: Phase 4 complete

### Backend - Tests First

- [ ] T142 [P] [US3] Write document split strategy tests (>5 positions → individual + ZIP) in backend/tests/unit/services/document-split.test.ts
- [ ] T143 [P] [US3] Write consolidated document tests (POST /api/documents/generate-consolidated) in backend/tests/integration/api/documents-consolidated.test.ts
- [ ] T144 [P] [US3] Write performance tests for 15+ positions in backend/tests/performance/positions-list.test.ts

### Backend - Implementation

- [ ] T145 [US3] Implement document split service in backend/src/services/document-split.ts
- [ ] T146 [US3] Update document generator for multiple positions in backend/src/services/document-generator.ts
- [ ] T147 [US3] Add consolidated generation endpoint in backend/src/api/routes/documents.ts
- [ ] T148 [US3] Update DOCX template with summary section in backend/templates/Akt_Procena_Rizika_Template.docx

### Frontend

- [ ] T149 [P] [US3] Implement virtual scrolling (>50 items) in frontend/src/components/positions/PositionList.tsx
- [ ] T150 [US3] Add bulk selection UI in frontend/src/components/positions/PositionSelector.tsx
- [ ] T151 [US3] Add consolidated generation button in frontend/src/components/documents/GenerateConsolidatedDocument.tsx
- [ ] T152 [US3] Update DocumentList for consolidated documents in frontend/src/components/documents/DocumentList.tsx

### E2E Testing

- [ ] T153 [US3] Write US3 E2E test: 10 positions → assess risks → consolidated report → verify summary in frontend/tests/e2e/user-story-3.spec.ts

**Phase 5 Validation**: E2E test T153 passes, consolidated document with summary table

---

## Phase 6: Polish & Production Readiness

**Goal**: Performance optimization, monitoring, admin features, deployment

**Prerequisites**: Phase 5 complete

### Admin Dashboard

- [ ] T154 [P] Create AdminPage with user list in frontend/src/pages/AdminPage.tsx
- [ ] T155 [P] Create AccountUpgrade component in frontend/src/components/admin/AccountUpgrade.tsx
- [ ] T156 [P] Implement upgrade endpoint (PATCH /api/admin/users/:id/upgrade) in backend/src/api/routes/admin.ts

### Trial Account Enforcement

- [ ] T157 [P] Implement trial limits middleware (3 positions, 5 docs, 14 days) in backend/src/api/middleware/trial-limits.ts
- [ ] T158 [P] Create TrialBanner component in frontend/src/components/trial/TrialBanner.tsx
- [ ] T159 [P] Create TrialExpiryModal (view-only mode) in frontend/src/components/trial/TrialExpiryModal.tsx

### Unverified Account Cleanup

- [ ] T160 [P] Create daily cron job to purge unverified accounts >7 days in backend/src/jobs/cleanup-unverified.ts
- [ ] T161 [P] Implement resend verification endpoint (POST /api/auth/resend-verification) in backend/src/api/routes/auth.ts

### Performance Optimization

- [ ] T162 [P] Optimize database queries with EXPLAIN ANALYZE in backend/src/db/migrations/
- [ ] T163 [P] Implement document generation caching in backend/src/services/document-generator.ts
- [ ] T164 [P] Setup Pino structured logging in backend/src/index.ts
- [ ] T165 [P] Implement health check endpoint (GET /api/health) in backend/src/api/routes/health.ts
- [ ] T166 [P] Create metrics tracking service in backend/src/services/metrics.ts

### Accessibility & i18n

- [ ] T167 [P] Manual keyboard testing (Tab, Enter, Escape) documented in specs/main/accessibility-checklist.md
- [ ] T168 [P] Screen reader testing (NVDA) documented in specs/main/accessibility-checklist.md
- [ ] T169 [P] Cyrillic character testing (Ђ, Ћ, Љ, Њ, Џ) documented in specs/main/cyrillic-test.md

### Deployment Preparation

- [ ] T170 [P] Document Vercel environment variables in docs/deployment/vercel-env-vars.md
- [ ] T171 [P] Document Supabase setup in docs/deployment/supabase-setup.md
- [ ] T172 [P] Document Wasabi setup in docs/deployment/wasabi-setup.md
- [ ] T173 [P] Document Resend setup in docs/deployment/resend-setup.md
- [ ] T174 [P] Generate encryption key documented in docs/deployment/encryption-key.md
- [ ] T174a [P] Implement JMBG encryption service using Node.js crypto module (AES-256-GCM with random IV, key from env ENCRYPTION_KEY) in backend/src/services/encryption.ts with unit tests (required by FR-031, FR-049c)
- [ ] T175 [P] Create production deployment checklist in docs/deployment/production-checklist.md

### Final Integration Testing

- [ ] T176 Test complete user journey documented in specs/main/integration-test-report.md
- [ ] T177 Test cross-tenant isolation documented in specs/main/security-test-report.md
- [ ] T178 Test trial limits enforcement documented in specs/main/trial-limits-test.md
- [ ] T179 Test admin upgrade workflow documented in specs/main/admin-upgrade-test.md
- [ ] T180 Performance test (10 concurrent docs) documented in specs/main/performance-test-report.md
- [ ] T181 Word compatibility test documented in specs/main/word-compatibility-test.md

**Phase 6 Validation**: All integration tests pass, deployment checklist complete

---

## Dependencies & Execution Order

### Phase Dependencies (Sequential)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational - BLOCKING)
    ↓
Phase 3 (User Story 1 - MVP)
    ↓
Phase 4 (User Story 2 - PPE & Training)
    ↓
Phase 5 (User Story 3 - Multiple Positions)
    ↓
Phase 6 (Polish & Production)
```

### MVP Definition

**Minimum Viable Product = Phases 1 + 2 + 3** (Tasks T001-T116)
- Delivers: Single position risk assessment with document generation
- Timeline: ~6-8 weeks (2 developers)
- Validates: Core value proposition (2-4 hours → 10 minutes)

### Parallel Execution Examples

**Phase 2 Auth Tests** (Can run simultaneously after schemas created):
- T022, T023, T024, T025 (Unit tests)
- T026, T027, T028, T029 (Integration tests)

**Phase 3 Frontend Components** (After API working):
- T088, T089, T090 (i18n and shadcn/ui setup)
- T092-T095 (Company/position forms)
- T096-T101 (Risk assessment components)
- T102-T105 (Document components)
- T106-T110 (Auth pages)

---

## Implementation Strategy

### Test-First Enforcement

Per Constitution Principle II (TDD), EVERY implementation task has corresponding test task(s) with lower ID numbers.

**Example**:
- T060-T063: Risk calculator tests (WRITE FIRST)
- T064: Risk calculator implementation (IMPLEMENT AFTER, make tests pass)

**Validation**: Before marking any implementation task complete, confirm its test task(s) are passing.

### Incremental Delivery Plan

1. **Week 1-2**: Phase 1 + Phase 2 (Setup + Foundational)
2. **Week 3-4**: Phase 3 Part 1 (Backend for US1)
3. **Week 5-6**: Phase 3 Part 2 (Frontend for US1)
4. **Week 7**: Phase 4 (User Story 2)
5. **Week 8**: Phase 5 + Phase 6 (Multiple Positions + Polish)

---

## Validation Checklist

**Phase 1**: ✅ `npm install` succeeds in both backend/ and frontend/
**Phase 2**: ✅ All auth tests passing, cross-tenant test T043 passing
**Phase 3**: ✅ E2E test T116 passing, DOCX opens in Word with all sections
**Phase 4**: ✅ E2E test T141 passing, document includes PPE/training
**Phase 5**: ✅ E2E test T153 passing, consolidated document with summary
**Phase 6**: ✅ Integration tests T176-T181 passing

**Final MVP Acceptance Criteria**:
- ✅ User can register, verify, create company in < 5 minutes
- ✅ User can create position with risk assessment in < 10 minutes
- ✅ System generates legally compliant DOCX in < 8 seconds
- ✅ Generated document passes Serbian inspection (95%+ compliance per SC-002)
- ✅ Risk calculation 100% accurate (E×P×F verified per SC-004)
- ✅ Cross-tenant isolation verified
- ✅ 80%+ test coverage for business logic

---

**Next Command**: Start with Phase 1 tasks (T001-T015) to initialize project structure
