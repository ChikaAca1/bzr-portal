# Tasks: BZR Portal - AI-Powered Risk Assessment Platform

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: This task list includes test tasks per spec requirement SC-010 (80%+ code coverage for critical business logic).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
Per plan.md, this is a web application:
- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- **Shared**: `shared/`
- **Templates**: `backend/templates/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure (backend/, frontend/, shared/, .specify/)
- [X] T002 Initialize backend Node.js/Bun project with TypeScript 5.0+ and Hono dependencies
- [X] T003 [P] Initialize frontend Vite+React 18 project with shadcn/ui (NOTE: Using Vite instead of Next.js 14)
- [X] T004 [P] Configure TypeScript strict mode for both backend and frontend
- [X] T005 [P] Setup ESLint and Prettier with shared config in root
- [X] T006 [P] Create .env.example files for backend and frontend with required environment variables
- [X] T007 [P] Setup Vitest configuration for backend unit tests
- [X] T008 [P] Setup Playwright configuration for frontend E2E tests
- [X] T009 Create shared Zod schemas directory in shared/schemas/
- [X] T010 [P] Configure Vercel deployment (vercel.json) for Pro plan with 60s timeout

**Checkpoint**: Project structure ready ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM

- [X] T011 Setup Neon PostgreSQL database (create project, get connection string)
- [X] T012 Initialize Drizzle ORM in backend/src/db/index.ts
- [X] T013 Configure Drizzle Kit for migrations in drizzle.config.ts
- [X] T014 Create base Drizzle schema file backend/src/db/schema/index.ts

### Authentication Infrastructure

- [X] T015 Create User entity schema in backend/src/db/schema/users.ts with trial account fields
- [X] T016 [P] Implement JWT utilities (sign, verify) in backend/src/lib/utils/jwt.ts
- [X] T017 [P] Create auth middleware in backend/src/api/middleware/auth.ts for token verification
- [X] T018 [P] Create trial limit enforcement middleware in backend/src/api/middleware/trial-limits.ts

### API Infrastructure

- [X] T019 Setup Hono app with CORS and error handling in backend/src/index.ts
- [X] T020 [P] Create structured error response utility in backend/src/api/middleware/error-handler.ts
- [X] T021 [P] Setup Pino structured logging in backend/src/lib/logger.ts
- [X] T022 [P] Create rate limiting middleware in backend/src/api/middleware/rate-limit.ts

### Frontend Infrastructure

- [X] T023 Setup Zustand auth store in frontend/src/store/auth.ts with persist middleware
- [X] T024 [P] Setup TanStack Query provider in frontend/src/lib/query-client.ts
- [X] T025 [P] Create API client utility in frontend/src/lib/api-client.ts with JWT header injection
- [X] T026 [P] Setup i18n for Serbian Cyrillic in frontend/src/i18n/sr-Cyrl.json and i18n/index.ts
- [X] T027 Configure Vite for Serbian locale (sr-Cyrl-RS) - NOTE: Using Vite instead of Next.js

### Shared Validation

- [X] T028 [P] Create shared Zod schema for Company in shared/schemas/company.ts with PIB validation
- [X] T029 [P] Create shared Zod schema for WorkPosition in shared/schemas/position.ts
- [X] T030 [P] Create shared Zod schema for RiskAssessment in shared/schemas/risk.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅

---

## Phase 3: User Story 1 - Single Work Position Risk Assessment (Priority: P1) 🎯 MVP

**Goal**: Enable BZR officer to create complete Risk Assessment Act for single work position, generating legally compliant DOCX document.

**Independent Test**: User can input company details, define one work position, assess risks with E×P×F methodology, and download complete DOCX document matching Serbian regulatory requirements.

### Tests for User Story 1 ✅ (Per SC-010: 80%+ coverage requirement)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T031 [P] [US1] Unit test for risk calculation (E×P×F) in backend/tests/unit/lib/risk-calculator.test.ts
- [ ] T032 [P] [US1] Unit test for PIB checksum validation in backend/tests/unit/lib/validators.test.ts
- [ ] T033 [P] [US1] Contract test for POST /api/companies in backend/tests/integration/companies.test.ts
- [ ] T034 [P] [US1] Contract test for POST /api/positions in backend/tests/integration/positions.test.ts
- [ ] T035 [P] [US1] Contract test for POST /api/risks in backend/tests/integration/risks.test.ts
- [ ] T036 [P] [US1] Contract test for POST /api/documents/generate in backend/tests/integration/documents.test.ts
- [ ] T037 [P] [US1] E2E test for complete user journey in frontend/tests/e2e/single-position-assessment.spec.ts

### Database Models for User Story 1

- [X] T038 [P] [US1] Create Company entity schema in backend/src/db/schema/companies.ts with RLS policy
- [X] T039 [P] [US1] Create WorkPosition entity schema in backend/src/db/schema/work-positions.ts with company_id FK
- [X] T040 [P] [US1] Create HazardType reference schema in backend/src/db/schema/hazards.ts
- [X] T041 [P] [US1] Create RiskAssessment entity schema in backend/src/db/schema/risk-assessments.ts
- [X] T042 [US1] Run Drizzle migrations to create all US1 tables (migrations generated)
- [X] T043 [US1] Seed Serbian hazard codes in backend/src/db/seed.ts (45+ hazards ready)

### Business Logic for User Story 1

- [X] T044 [P] [US1] Implement RiskCalculator utility in backend/src/lib/utils/risk-calculator.ts (pure E×P×F logic)
- [X] T045 [P] [US1] Implement PIB/JMBG/activity code validators in backend/src/lib/validators.ts
- [X] T046 [US1] Implement CompanyService in backend/src/services/CompanyService.ts (CRUD with RLS)
- [X] T047 [US1] Implement PositionService in backend/src/services/PositionService.ts
- [X] T048 [US1] Implement RiskAssessmentService in backend/src/services/RiskAssessmentService.ts with validation R < Ri

### API Endpoints for User Story 1

- [X] T049 [P] [US1] Create auth.register tRPC procedure in backend/src/api/routes/auth.ts (trial account creation)
- [X] T050 [P] [US1] Create auth.login tRPC procedure in backend/src/api/routes/auth.ts (JWT issuance)
- [X] T051 [P] [US1] Create companies.create tRPC procedure in backend/src/api/routes/companies.ts
- [X] T052 [P] [US1] Create companies.getById tRPC procedure in backend/src/api/routes/companies.ts
- [X] T053 [P] [US1] Create positions.create tRPC procedure (exists in backend/src/api/routes/positions.ts)
- [X] T054 [P] [US1] Create positions.getById tRPC procedure (exists in backend/src/api/routes/positions.ts)
- [X] T055 [P] [US1] Create risks.create tRPC procedure (exists in backend/src/api/routes/risks.ts with R < Ri validation)
- [X] T056 [P] [US1] Create hazards.list tRPC procedure in backend/src/api/routes/hazards.ts

### Document Generation for User Story 1

- [X] T057 [US1] Design DOCX template in Microsoft Word at backend/templates/Akt_Procena_Rizika_Template.docx with Cyrillic text and Mustache placeholders per FR-034 through FR-042
- [X] T058 [US1] Implement DocumentGenerator service in backend/src/services/DocumentGenerator.ts using docx-templates library
- [X] T059 [US1] Implement Vercel Blob storage utility in backend/src/lib/blob-storage.ts for signed URL generation
- [X] T060 [US1] Create documents.generate tRPC procedure in backend/src/api/routes/documents.ts with Blob Storage upload

### Frontend Components for User Story 1

- [X] T061 [P] [US1] Create Login page in frontend/src/pages/Login.tsx (with tRPC auth.login mutation)
- [X] T062 [P] [US1] Create Register page in frontend/src/pages/Register.tsx (trial account signup with auto-login)
- [ ] T063 [P] [US1] Create CompanyForm component in frontend/src/components/forms/CompanyForm.tsx with PIB validation
- [ ] T064 [P] [US1] Create PositionForm component in frontend/src/components/forms/PositionForm.tsx
- [ ] T065 [P] [US1] Create HazardSelector component in frontend/src/components/forms/HazardSelector.tsx (checklist UI)
- [ ] T066 [P] [US1] Create RiskAssessmentForm component in frontend/src/components/forms/RiskAssessmentForm.tsx with real-time E×P×F calculation
- [X] T067 [P] [US1] Create RiskLevelBadge component in frontend/src/components/ui/RiskLevelBadge.tsx (green/yellow/red per FR-019)
- [ ] T068 [US1] Create multi-step wizard in frontend/src/components/forms/PositionWizard.tsx (Basic Info → Job Description → Risk Assessment)
- [ ] T069 [US1] Create DocumentGenerationModal component in frontend/src/components/modals/DocumentGenerationModal.tsx with progress bar
- [X] T070 [US1] Create Dashboard page in frontend/src/pages/Dashboard.tsx with trial banner and tRPC companies list (FR-028c)

### Integration & Polish for User Story 1

- [ ] T071 [US1] Add error handling and Serbian Cyrillic error messages throughout US1 endpoints
- [ ] T072 [US1] Add audit logging for company/position/risk CRUD operations (FR-033)
- [ ] T073 [US1] Verify all US1 tests pass with 80%+ coverage for risk calculation
- [ ] T074 [US1] Test document generation with Serbian Cyrillic special characters (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш)
- [ ] T075 [US1] Verify trial account limits enforced (1 company, 3 positions, 5 documents)
- [ ] T076 [US1] Verify generated DOCX opens correctly in Microsoft Word 2016+

**Checkpoint**: User Story 1 complete - MVP ready for pilot testing

---

## Phase 4: User Story 2 - PPE and Training Management (Priority: P2)

**Goal**: Enable BZR officer to define Personal Protective Equipment (PPE) requirements and training schedules for each work position based on identified risks.

**Independent Test**: User can add PPE items with EN standards and replacement periods, define training frequencies, and see these reflected in the generated document.

### Tests for User Story 2 ✅

- [ ] T077 [P] [US2] Contract test for POST /api/ppe in backend/tests/integration/ppe.test.ts
- [ ] T078 [P] [US2] Contract test for POST /api/training in backend/tests/integration/training.test.ts
- [ ] T079 [P] [US2] E2E test for PPE/training in document generation in frontend/tests/e2e/ppe-training.spec.ts

### Database Models for User Story 2

- [ ] T080 [P] [US2] Create PPE entity schema in backend/src/db/schema/ppe.ts with position_id FK
- [ ] T081 [P] [US2] Create Training entity schema in backend/src/db/schema/training.ts
- [ ] T082 [P] [US2] Create MedicalExam entity schema in backend/src/db/schema/medical-exams.ts
- [ ] T083 [US2] Run Drizzle migration for US2 tables

### Implementation for User Story 2

- [ ] T084 [US2] Implement PPEService in backend/src/services/PPEService.ts
- [ ] T085 [P] [US2] Create POST /api/ppe endpoint in backend/src/api/ppe/create.ts
- [ ] T086 [P] [US2] Create POST /api/training endpoint in backend/src/api/training/create.ts
- [ ] T087 [P] [US2] Create POST /api/medical-exams endpoint in backend/src/api/medical-exams/create.ts
- [ ] T088 [US2] Update DocumentGenerator to include PPE and Training sections in DOCX (FR-009, FR-039e)
- [ ] T089 [P] [US2] Create PPEForm component in frontend/src/components/forms/PPEForm.tsx
- [ ] T090 [P] [US2] Create TrainingForm component in frontend/src/components/forms/TrainingForm.tsx
- [ ] T091 [US2] Add PPE/Training steps to PositionWizard
- [ ] T092 [US2] Verify US2 tests pass and PPE/Training appear in generated documents

**Checkpoint**: User Story 2 complete - PPE and Training management functional

---

## Phase 5: User Story 3 - Multiple Work Positions (Priority: P3)

**Goal**: Enable BZR officer managing company with 10+ different work positions to create risk assessments for all positions efficiently.

**Independent Test**: User can create 10+ work positions, assess risks for each independently, and generate either individual documents per position or one consolidated document for all positions.

### Tests for User Story 3 ✅

- [ ] T093 [P] [US3] Unit test for virtual scrolling performance with 50+ positions in frontend/tests/unit/components/PositionList.test.tsx
- [ ] T094 [P] [US3] E2E test for consolidated document generation in frontend/tests/e2e/multi-position-document.spec.ts

### Implementation for User Story 3

- [ ] T095 [P] [US3] Create GET /api/positions (list) endpoint in backend/src/api/positions/list.ts with pagination
- [ ] T096 [US3] Update DocumentGenerator to support consolidated multi-position reports (FR-038, FR-040)
- [ ] T097 [US3] Create POST /api/documents/generate-consolidated endpoint in backend/src/api/documents/generate-consolidated.ts
- [ ] T098 [P] [US3] Create PositionList component in frontend/src/components/tables/PositionList.tsx with react-window virtual scrolling (FR-021)
- [ ] T099 [US3] Create position summary table component in frontend/src/components/tables/PositionSummaryTable.tsx
- [ ] T100 [US3] Add document generation options (single vs consolidated) to UI
- [ ] T101 [US3] Verify virtual scrolling works with 50+ positions
- [ ] T102 [US3] Test consolidated document generation with 15+ positions

**Checkpoint**: User Story 3 complete - Multi-position support functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, security, performance, and deployment preparation

### Security Hardening

- [ ] T103 [P] Implement JMBG encryption (AES-256-GCM) in backend/src/lib/encryption.ts per FR-031
- [ ] T104 [P] Implement GDPR data export in backend/src/api/users/export-data.ts per FR-049a
- [ ] T105 [P] Implement GDPR data deletion in backend/src/api/users/delete-data.ts per FR-049b
- [ ] T106 [P] Add XSS protection headers in Hono middleware
- [ ] T107 [P] Add CSRF protection for state-changing operations

### Performance Optimization

- [ ] T108 Optimize database queries with proper indexing on company_id (FR-053c)
- [ ] T109 [P] Setup PgBouncer connection pooling (FR-052c: 20-50 connections)
- [ ] T110 Test document generation under load (10 concurrent requests)

### Monitoring & Observability

- [ ] T111 [P] Setup Vercel Analytics in frontend (FR-052d metrics)
- [ ] T112 [P] Configure Neon slow query logging (>100ms threshold)
- [ ] T113 [P] Add structured logging for all critical operations (document generation, auth, trial limit hits)

### Deployment & Documentation

- [ ] T114 Setup Vercel environment variables (DATABASE_URL, JWT_SECRET, BLOB_TOKEN, etc.)
- [ ] T115 [P] Create deployment checklist in /docs/deployment.md
- [ ] T116 [P] Create user guide for BZR officers in /docs/user-guide-sr-Cyrl.md (Serbian Cyrillic)
- [ ] T117 [P] Document API endpoints in /docs/api-reference.md
- [ ] T118 Perform final E2E test on Vercel preview deployment
- [ ] T119 Deploy to production and smoke test critical paths

---

## Dependencies & Execution Strategy

### Critical Path (Sequential)

```
Phase 1: Setup (T001-T010)
    ↓
Phase 2: Foundational (T011-T030)
    ↓
Phase 3: User Story 1 MVP (T031-T076)
    ↓
Phase 4: User Story 2 (T077-T092)
    ↓
Phase 5: User Story 3 (T093-T102)
    ↓
Phase 6: Polish (T103-T119)
```

### User Story Independence

- **US1 (P1)**: Blocks nothing - can be MVPed independently ✅
- **US2 (P2)**: Extends US1 - adds PPE/Training to existing positions
- **US3 (P3)**: Extends US1+US2 - scales to multiple positions

### Parallel Execution Opportunities

**Within Phase 1 (Setup)**:
- T003, T004, T005, T006, T007, T008, T010 (all marked [P]) can run simultaneously

**Within Phase 2 (Foundational)**:
- Database tasks (T011-T014) must run sequentially
- Auth tasks (T016, T017, T018) can run in parallel after T015
- API infra (T020, T021, T022) can run in parallel
- Frontend infra (T024, T025, T026) can run in parallel after T023
- Shared schemas (T028, T029, T030) can run in parallel

**Within Phase 3 (US1)**:
- All test tasks (T031-T037) can run in parallel
- All database schemas (T038-T041) can run in parallel
- All business logic (T044-T045) can run in parallel
- All API endpoints (T049-T056) can run in parallel after services complete
- All frontend components (T061-T067) can run in parallel

### Recommended MVP Scope

**Minimum Viable Product** = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)

This delivers:
- Trial account registration (hybrid model)
- Single company profile creation
- Single work position risk assessment
- E×P×F risk calculation with validation
- Legally compliant DOCX document generation
- Serbian Cyrillic support throughout

**Estimated Tasks**: 76 tasks (T001-T076)
**Estimated Time**: 15-20 days (per research.md, assuming 4-5 tasks/day average)

**Post-MVP Iterations**:
- **Iteration 2**: Add User Story 2 (PPE/Training) - +16 tasks
- **Iteration 3**: Add User Story 3 (Multi-position) - +10 tasks

---

## Validation Checklist

✅ **All tasks follow checklist format**: `- [ ] [ID] [P?] [Story?] Description with file path`
✅ **User stories organized independently**: Each phase (3-5) is a complete, testable story
✅ **Tests included**: Per SC-010 requirement (80%+ code coverage for critical logic)
✅ **Parallel opportunities marked**: [P] flag indicates tasks that can run simultaneously
✅ **Story labels applied**: [US1], [US2], [US3] map to spec.md user stories
✅ **File paths specified**: Every task includes exact file location
✅ **Dependencies documented**: Critical path and independence graph provided
✅ **MVP scope defined**: Phase 1+2+3 (76 tasks) delivers core value proposition

---

## Summary

- **Total Tasks**: 119
- **MVP Tasks**: 76 (Phase 1-3 only)
- **Tasks per User Story**:
  - US1 (P1): 46 tasks (T031-T076)
  - US2 (P2): 16 tasks (T077-T092)
  - US3 (P3): 10 tasks (T093-T102)
  - Polish: 17 tasks (T103-T119)
- **Parallel Opportunities**: 60 tasks marked [P] (50% parallelizable)
- **Test Coverage**: 11 test tasks for US1 alone (unit, contract, E2E)

**Ready for execution**: Start with Phase 1 (T001-T010) to setup project structure.
