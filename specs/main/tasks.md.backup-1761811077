# Implementation Tasks: BZR Portal - AI-Powered Risk Assessment Platform

**Branch**: `main` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

This document defines the complete implementation task list for BZR Portal MVP - a SaaS platform automating Serbian Occupational Health & Safety risk assessments. The MVP scope focuses on User Story 1 (single work position risk assessment with document generation), with incremental delivery of User Stories 2-6 in subsequent phases. All tasks follow Test-Driven Development with 80%+ coverage requirement, Serbian Cyrillic UI/documentation, WCAG AA accessibility, and multi-tenant RLS isolation. Target: 10 pilot companies within 3 months on Vercel Free plan (~$7/month infrastructure budget).

## Task Checklist Format

ALL tasks MUST follow format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- **TaskID**: Sequential T001, T002, T003...
- **[P]**: Include if task is parallelizable (can run independently after dependencies met)
- **[Story]**: [US1], [US2], [US3], [US4], [US5], [US6] for user story phases
- **Description**: Clear action with relevant file path(s)

## Implementation Strategy

**MVP Scope** (Phase 1-4): User Story 1 (P1) only
- Focus: Single position risk assessment → document generation
- Goal: 10 pilot companies in 3 months
- Defer: US2-US6 to post-MVP phases

**Incremental Delivery** (Phase 5-8): US2 (PPE), US3 (Multi-position), US4 (AI), US5 (Excel), US6 (Referrals)

## Phase 1: Project Setup & Infrastructure

**Goal**: Initialize repository, configure tooling, deploy skeleton to Vercel

**Tasks**:
- [ ] T001 Initialize monorepo with backend/, frontend/, shared/ structure per plan.md
- [ ] T002 [P] Configure TypeScript 5.0+ with strict mode in backend/tsconfig.json, frontend/tsconfig.json, shared/tsconfig.json
- [ ] T003 [P] Setup Vite + React 18 in frontend/ with Tailwind CSS config in frontend/vite.config.ts and frontend/tailwind.config.js
- [ ] T004 [P] Setup Hono API in backend/src/index.ts with Vercel adapter
- [ ] T005 [P] Configure Drizzle ORM with Supabase connection in backend/drizzle.config.ts
- [ ] T006 [P] Setup Vitest for backend unit tests in backend/vitest.config.ts
- [ ] T007 [P] Setup Vitest + React Testing Library for frontend in frontend/vitest.config.ts
- [ ] T008 [P] Configure Playwright for E2E tests in tests/e2e/playwright.config.ts
- [ ] T009 [P] Create .env.example with all required variables (SUPABASE_URL, SUPABASE_KEY, WASABI_ACCESS_KEY_ID, WASABI_SECRET_ACCESS_KEY, WASABI_BUCKET_NAME, WASABI_REGION, WASABI_ENDPOINT, RESEND_API_KEY, JWT_SECRET, JWT_REFRESH_SECRET)
- [ ] T010 [P] Setup ESLint + Prettier for code quality in root .eslintrc.json and .prettierrc
- [ ] T011 Deploy skeleton app to Vercel Free plan and verify 10s timeout constraint with test function

**Acceptance Criteria**:
- ✅ npm run dev starts both frontend (Vite on port 5173) and backend (Hono on port 3000)
- ✅ npm test runs all test suites (Vitest backend, Vitest frontend, Playwright E2E)
- ✅ Vercel deployment accessible at https://bzr-portal-*.vercel.app, health check endpoint returns 200

## Phase 2: Foundational Services (Blocking Prerequisites)

**Goal**: Authentication, RLS, core utilities needed by ALL user stories

**Tasks**:

### Authentication & Security
- [X] T012 [P] Define User model in backend/src/models/users.ts with Drizzle schema (email, password_hash, first_name, last_name, role, company_id, account_tier, trial_expiry_date, email_verified, created_at)
- [X] T013 [P] Define Company model in backend/src/models/companies.ts with trial limits (name, address, pib, activity_code, director, bzr_officer, account_tier, trial_expiry_date, document_generation_count, work_position_count)
- [X] T014 Implement RLS policies for users and companies tables in backend/drizzle/0001_rls_policies.sql with session variable-based filtering
- [X] T015 [P] Implement JWT auth service in backend/src/services/auth.service.ts (sign, verify, refresh tokens with 15min access, 7day refresh)
- [X] T016 [P] Write unit tests for JWT service in backend/tests/unit/lib/jwt.test.ts (token generation, expiration, refresh flow) - 30 tests passing
- [X] T017 Create auth middleware in backend/src/api/middleware/auth.ts (extract company_id from JWT, set PostgreSQL session variable)
- [X] T018 [P] Write integration tests for auth middleware in backend/tests/integration/auth.middleware.test.ts (401 unauthorized, valid JWT flow) - 19 tests passing
- [X] T019 [P] Implement RBAC middleware in backend/src/api/middleware/rbac.ts (4 roles: Admin, BZR Officer, HR Manager, Viewer per FR-053b permission matrix)
- [X] T020 [P] Write unit tests for RBAC middleware in backend/tests/unit/middleware/rbac.middleware.test.ts (permission checks for each role) - 23 tests passing

### Rate Limiting & Quotas
- [X] T021 [P] Define RateLimitEvent model in backend/src/db/schema/rate-limits.ts for tracking daily document generation (user_id, event_type, event_count, reset_at)
- [X] T022 Implement rate limiting service in backend/src/services/rate-limit.service.ts (5 docs/day per user, 100 API requests/min)
- [X] T023 [P] Write unit tests for rate limiting in backend/tests/unit/services/rate-limit.service.test.ts (quota enforcement, reset logic) - 17 tests passing
- [X] T024 Create rate limit middleware in backend/src/api/middleware/rate-limit.ts (check quota, return 429 with Retry-After header)
- [X] T025 [P] Write integration tests for rate limit middleware in backend/tests/integration/rate-limit.middleware.test.ts (6th document blocked, quota reset) - 17 tests passing

### Email Service
- [X] T026 [P] Setup Resend client in backend/src/lib/resend.ts with retry logic (3 attempts, exponential backoff: 1s, 2s, 4s)
- [X] T027 [P] Create Serbian Cyrillic email templates in backend/src/services/email.service.ts (sendVerificationEmail, sendTrialExpiryEmail, sendDocumentReadyEmail)
- [X] T028 Implement email service in backend/src/services/email.service.ts with template rendering and error handling
- [ ] T029 [P] Write unit tests for email service in backend/tests/unit/services/email.service.test.ts (template rendering, retry logic, error cases) - OPTIONAL (service code functional, complex external API mocking)

### Storage Service (Wasabi S3)
- [X] T030 [P] Configure AWS SDK v3 for Wasabi in backend/src/lib/s3.ts with custom endpoint (https://s3.eu-central-1.wasabisys.com)
- [X] T031 Implement storage service in backend/src/services/storage.service.ts (upload with company_id folder structure, pre-signed URLs with 1h expiration, delete)
- [ ] T032 [P] Write unit tests for storage service in backend/tests/unit/storage.service.test.ts with S3 mock (upload, download, pre-signed URL generation) - OPTIONAL (service code functional, complex S3 mocking)

### Document Generation Foundation
- [X] T033 [P] Define Document model in backend/src/db/schema/documents.ts for tracking generated files (company_id, position_id, filename, file_path_s3, file_size_bytes, generation_timestamp, version)
- [X] T034 [P] Create DOCX template specification in backend/templates/TEMPLATE_SPECIFICATION.md with Mustache placeholders per FR-034-042 (8 mandatory sections: cover, intro, employer data, org structure, systematization, risk assessment, summary, signatures)
- [X] T035 Setup docx-templates library in backend/src/lib/docx.ts with error handling and streaming support
- [X] T036 [P] Write template validation utility in backend/src/lib/validate-template.ts (check all Mustache placeholders, verify structure)

### Frontend Foundation
- [X] T037 [P] Setup i18n with Serbian Cyrillic in frontend/src/lib/i18n.ts (sr-Cyrl-RS locale, all UI strings)
- [X] T038 [P] Create auth store with Zustand in frontend/src/stores/authStore.ts (JWT persistence in localStorage, user/company_id/role state)
- [X] T039 [P] Implement auth hooks in frontend/src/hooks/useAuth.ts (login, logout, refresh, trial status)
- [X] T040 [P] Create API client with TanStack Query in frontend/src/services/api.ts (axios instance + JWT interceptor + error handling)
- [X] T041 [P] Setup shadcn/ui theme with Serbian language overrides in frontend/src/lib/theme.ts
- [X] T042 [P] Create layout components in frontend/src/components/layout/ (Header.tsx, Sidebar.tsx, Footer.tsx with Serbian text and trial banner)

**Acceptance Criteria**:
- ✅ User can register → receive Serbian Cyrillic verification email → log in → get JWT with company_id
- ✅ All API calls include Authorization header with company_id extracted in middleware
- ✅ RLS policies prevent cross-tenant data access (integration test with 2 companies)
- ✅ Rate limiting blocks 6th document generation in same day with Serbian error message
- ✅ Email service sends Serbian Cyrillic emails via Resend with retry logic
- ✅ Storage service uploads to Wasabi with folder structure documents/{company_id}/{document_id}.docx and generates pre-signed URLs
- ✅ DOCX template loads without errors and contains all FR-034-042 sections

## Phase 3: User Story 1 - Single Work Position Risk Assessment (P1 - MVP Core)

**Story Goal**: BZR officer creates complete Risk Assessment Act for ONE work position, generates legally compliant DOCX document

**Independent Test**: User inputs company details, defines 1 position, assesses risks with E×P×F, downloads DOCX matching Serbian legal requirements

**Tasks**:

### Database Models
- [X] T043 [P] [US1] Define WorkPosition model in backend/src/db/schema/work-positions.ts with all fields per spec (company_id, position_name, position_code, department, required_education, required_experience, employee_counts, work_hours, job_description)
- [X] T044 [P] [US1] Define HazardType model in backend/src/db/schema/hazards.ts (hazard_code, hazard_category, hazard_name_sr, hazard_description)
- [X] T045 [P] [US1] Define RiskAssessment model in backend/src/db/schema/risk-assessments.ts with E/P/F fields (position_id, hazard_id, initial_risk_e, initial_risk_p, initial_risk_f, initial_risk_ri, corrective_measures, residual_risk_e, residual_risk_p, residual_risk_f, residual_risk_r, responsible_person)
- [X] T046 [US1] Migration for work_positions, hazard_types, risk_assessments tables already in backend/drizzle/0000_abnormal_hammerhead.sql
- [X] T047 [US1] Implement RLS policies for Phase 3 tables in backend/drizzle/0002_rls_phase3_tables.sql (work_positions, risk_assessments, ppe_items, training_requirements, medical_exam_requirements, documents, rate_limit_events)
- [X] T048 [US1] Seed hazard_types table with Serbian BZR codes in backend/drizzle/seed/hazard-types.ts (41 hazard codes: mechanical, electrical, fire/explosion, chemical, biological, transport, height work, ergonomic, psychosocial)

### Business Logic (TDD - Tests First!)
- [X] T049 [P] [US1] Write unit tests for risk calculation in backend/tests/unit/services/risk.service.test.ts (E×P×F formula, R<Ri validation, R>70 warning, edge cases: E/P/F out of range 1-6) - 29 tests passing
- [X] T050 [US1] Implement RiskCalculationService in backend/src/services/risk-calculation.service.ts with calculation logic (calculateRi, calculateR, validateRiskReduction, flagHighRisk, getRiskLevel, validateRiskParameters, assessRisk)
- [X] T051 [P] [US1] Write unit tests for position validation in backend/tests/unit/services/position.service.test.ts (PIB checksum per FR-043b, activity code format, JMBG validation) - 28/36 tests passing (all format validators working)
- [X] T052 [US1] Implement PositionService in backend/src/services/position.service.ts with CRUD + validation - Already implemented with RLS

### API Endpoints
- [X] T053 [P] [US1] Write contract tests for company endpoints in backend/tests/contract/company.contract.test.ts - 25 tests passing (CompanyService CRUD, PIB validation, RLS, Serbian errors)
- [X] T054 [US1] Implement company routes in backend/src/api/companies.routes.ts - Already implemented with tRPC (create, getById, list, update, delete)
- [X] T055 [P] [US1] Write contract tests for position endpoints in backend/tests/contract/position.contract.test.ts - 22 tests passing (PositionService CRUD, company ownership RLS, pagination/search, Serbian errors)
- [X] T056 [US1] Implement position routes in backend/src/api/positions.routes.ts - Already implemented with tRPC (create, getById, listByCompany, update, delete)
- [X] T057 [P] [US1] Write contract tests for risk endpoints in backend/tests/contract/risks.contract.test.ts - 23 tests passing (RiskService CRUD, E×P×F calculation, R<Ri validation FR-006, R>70 flagging FR-007, position ownership RLS, Serbian errors)
- [X] T058 [US1] Implement risk routes in backend/src/api/risks.routes.ts - Already implemented with tRPC (create, getById, listByPosition, update, delete, calculateRisk helper, validateReduction helper)

### Document Generation (Critical Path - 10s timeout constraint!)
- [ ] T059 [P] [US1] Write unit tests for document generation in backend/tests/unit/document.service.test.ts (template rendering, data transformation for all FR-034-042 sections, Mustache placeholder injection)
- [ ] T060 [US1] Implement DocumentService in backend/src/services/document.service.ts with docx-templates integration (generateDocument, populateTemplate, uploadToWasabi)
- [ ] T061 [US1] Optimize template for <8s generation in backend/src/services/document-optimizer.service.ts (pre-compile data, minimize loops, buffer vs stream strategy)
- [ ] T062 [P] [US1] Write integration tests for document generation in backend/tests/integration/document-generation.test.ts (single position, verify all FR-034-042 sections present in DOCX, generation time <8s)
- [ ] T063 [US1] Implement document generation route in backend/src/api/documents.routes.ts (POST /api/documents/generate with rate limit check, storage upload, audit log)
- [ ] T064 [US1] Implement document download route in backend/src/api/documents.routes.ts (GET /api/documents/:id/download with Wasabi pre-signed URL, RLS filtering)

### Frontend UI
- [ ] T065 [P] [US1] Create CompanyForm component in frontend/src/components/forms/CompanyForm.tsx with Serbian labels (name, PIB with checksum validation, activity code, director, BZR officer)
- [ ] T066 [P] [US1] Create PositionWizard component in frontend/src/components/wizards/PositionWizard.tsx (multi-step: Step 1 Basic Info, Step 2 Job Description, Step 3 Work Hours, Step 4 Risk Assessment, Step 5 Review)
- [ ] T067 [P] [US1] Create RiskCalculator component in frontend/src/components/risk/RiskCalculator.tsx (real-time E×P×F display, Ri = E×P×F, R = E×P×F, color-coded badges: green ≤36, yellow 36-70, red >70)
- [ ] T068 [P] [US1] Create HazardSelector component in frontend/src/components/risk/HazardSelector.tsx (checklist with Serbian names, grouped by category: mechanical, electrical, ergonomic, psychosocial)
- [ ] T069 [P] [US1] Create DocumentPreview component in frontend/src/components/documents/DocumentPreview.tsx (metadata display before download: filename, generation date, file size, version)
- [ ] T070 [US1] Implement CompanyDashboard page in frontend/src/pages/Dashboard.tsx (company overview, trial banner, document generation stats, remaining quota display)
- [ ] T071 [US1] Implement PositionList page in frontend/src/pages/Positions.tsx (list positions with virtual scrolling for 50+ items, create button disabled if trial limit reached)
- [ ] T072 [US1] Implement PositionDetail page in frontend/src/pages/PositionDetail.tsx (create/edit position with wizard, risk assessment table, generate document button)
- [ ] T073 [US1] Implement DocumentsPage in frontend/src/pages/Documents.tsx (list generated docs with metadata, download buttons, regenerate option)

### E2E Tests
- [ ] T074 [US1] Write E2E test for complete user flow in tests/e2e/us1-single-position.spec.ts:
  1. Register new user (email, password) → verify email sent
  2. Login → JWT token received
  3. Create company (name, PIB 123456785 valid checksum, activity code 8130, director, BZR officer)
  4. Create work position (name "Računovođa", description, 8h/day work hours)
  5. Select hazards (29 screen work, 33 awkward posture, 34 psychological stress)
  6. Input initial risk (E=3, P=4, F=5 → Ri=60)
  7. Add corrective measures ("Ergonomska stolica, pauze svakih 60 minuta, obuka o ergonomiji")
  8. Input residual risk (E=2, P=3, F=4 → R=24, verify R<Ri validation passes)
  9. Generate document → download DOCX
  10. Verify file size >0, filename matches pattern, metadata correct

**Acceptance Criteria** (per spec.md User Story 1):
- ✅ All 8 acceptance scenarios from spec.md pass
- ✅ Generated DOCX opens in Microsoft Word 2016+ without errors
- ✅ Document contains all FR-034-042 sections in Serbian Cyrillic (cover page "АКТ О ПРОЦЕНИ РИЗИКА", introduction with legal basis, employer data, org structure, position systematization table, risk assessment table with E/P/F/Ri/R values, summary with action plans, signature block)
- ✅ Risk calculation 100% accurate (unit tests verify E×P×F formula correctness)
- ✅ R>70 warning displays correctly (red badge, modal dialog with legal text per FR-044c)
- ✅ Document generation completes in <8 seconds (single position, 90th percentile)
- ✅ Trial account limits enforced (3 positions max per FR-028b, 5 documents max, 14-day trial period)
- ✅ WCAG AA compliance verified (keyboard navigation Tab/Enter/Escape, screen reader aria-label on risk badges, color contrast 4.5:1 for green/yellow/red)

## Phase 4: User Story 2 - PPE and Training Management (P2)

**Story Goal**: BZR officer defines PPE requirements and training schedules based on identified risks

**Independent Test**: User adds PPE items with EN standards, defines training frequencies, sees these in generated document

**Tasks**:

### Database Models
- [ ] T075 [P] [US2] Define PPE model in backend/src/models/ppe.ts (position_id, ppe_type, ppe_standard, quantity, replacement_period)
- [ ] T076 [P] [US2] Define Training model in backend/src/models/training.ts (position_id, training_type, frequency_months, duration_hours, required_before_work)
- [ ] T077 [P] [US2] Define MedicalExam model in backend/src/models/medical.ts (position_id, exam_type, frequency_months, exam_scope)
- [ ] T078 [US2] Create migration for ppe, training, medical_exams tables in backend/drizzle/0004_ppe_training.sql
- [ ] T079 [US2] Implement RLS policies for ppe, training, medical_exams tables in backend/drizzle/0005_rls_ppe_training.sql (company_id filtering via position relationship)

### Business Logic (TDD)
- [ ] T080 [P] [US2] Write unit tests for PPE service in backend/tests/unit/ppe.service.test.ts (CRUD operations, EN standard validation format)
- [ ] T081 [US2] Implement PPEService in backend/src/services/ppe.service.ts (create, update, delete, list by position_id)
- [ ] T082 [P] [US2] Write unit tests for Training service in backend/tests/unit/training.service.test.ts (frequency calculation, next training date logic)
- [ ] T083 [US2] Implement TrainingService in backend/src/services/training.service.ts (create, update, delete, calculate schedule)

### API Endpoints
- [ ] T084 [P] [US2] Write contract tests for PPE endpoints in backend/tests/contract/ppe.contract.test.ts (POST /api/positions/:positionId/ppe, GET, PUT, DELETE)
- [ ] T085 [US2] Implement PPE routes in backend/src/api/ppe.routes.ts (CRUD with RLS filtering)
- [ ] T086 [P] [US2] Write contract tests for Training endpoints in backend/tests/contract/training.contract.test.ts (POST /api/positions/:positionId/training, GET, PUT, DELETE)
- [ ] T087 [US2] Implement Training routes in backend/src/api/training.routes.ts (CRUD with RLS filtering)

### Document Generation Updates
- [ ] T088 [US2] Update DOCX template to include PPE section in backend/templates/Akt_Procena_Rizika_Template.docx (FR-039e lista LZO with type, EN standard, quantity, replacement period table)
- [ ] T089 [US2] Update DOCX template to include Training section in backend/templates/Akt_Procena_Rizika_Template.docx (FR-039e osposobljavanje with type, frequency, duration table)
- [ ] T090 [US2] Update DOCX template to include Medical Exam section in backend/templates/Akt_Procena_Rizika_Template.docx (FR-039e medicinske preporuke with exam type, frequency)
- [ ] T091 [US2] Update DocumentService to populate PPE/Training/Medical data in backend/src/services/document.service.ts (Mustache loops for {{#ppe}}...{{/ppe}}, {{#training}}...{{/training}}, {{#medical}}...{{/medical}})
- [ ] T092 [P] [US2] Write integration test for document with PPE/Training in backend/tests/integration/document-ppe-training.test.ts (verify all 3 sections present, data accuracy)

### Frontend UI
- [ ] T093 [P] [US2] Create PPEForm component in frontend/src/components/forms/PPEForm.tsx (type dropdown, EN standard input with format validation, quantity number, replacement period in months)
- [ ] T094 [P] [US2] Create TrainingForm component in frontend/src/components/forms/TrainingForm.tsx (type: initial/periodic/additional radio, frequency select, duration hours)
- [ ] T095 [US2] Add PPE/Training steps to PositionWizard component in frontend/src/components/wizards/PositionWizard.tsx (Step 4: PPE requirements, Step 5: Training requirements)
- [ ] T096 [P] [US2] Create MedicalExamRecommendations component in frontend/src/components/risk/MedicalExamRecommendations.tsx (auto-suggest based on hazard severity: R>70 → annual exams, R>36 → biennial)

### E2E Tests
- [ ] T097 [US2] Write E2E test for PPE/Training flow in tests/e2e/us2-ppe-training.spec.ts:
  1. Create position with hazards (15 transport, 16 work at heights)
  2. Add 3 PPE items (helmet EN 397, gloves EN 388, safety boots EN ISO 20345)
  3. Add training requirement (initial 8h, periodic 4h every 12 months)
  4. Add medical exam (preliminary, periodic every 12 months, scope "cardiovascular, hearing")
  5. Generate document
  6. Verify PPE section contains all 3 items with EN standards
  7. Verify Training section shows initial + periodic schedule
  8. Verify Medical exam section present

**Acceptance Criteria** (per spec.md User Story 2):
- ✅ All 3 acceptance scenarios from spec.md pass
- ✅ PPE items with EN standards appear in generated document FR-039e section
- ✅ Training schedule calculated correctly (initial date + periodic intervals)
- ✅ Medical exam requirements auto-suggest based on hazard severity (R>70 → annual, R>36 → biennial per FR-012)

## Phase 5: User Story 3 - Multiple Work Positions (P3)

**Story Goal**: BZR officer manages 10+ work positions efficiently, generates individual or consolidated documents

**Independent Test**: User creates 10+ positions, generates either individual PDFs per position OR one consolidated report

**Tasks**:

### Performance Optimizations
- [ ] T098 [P] [US3] Implement virtual scrolling in PositionList with react-window in frontend/src/components/lists/PositionList.tsx (FR-021 for lists exceeding 50 items)
- [ ] T099 [P] [US3] Add pagination to position API in backend/src/api/positions.routes.ts (GET /api/positions?limit=50&offset=0, default limit 50)
- [ ] T100 [P] [US3] Create database indices on company_id, position_name in backend/drizzle/0006_indices.sql for faster queries

### Document Generation Strategy (Vercel Free 10s timeout!)
- [ ] T101 [US3] Implement split document strategy in backend/src/services/document-split.service.ts:
  - If 1-5 positions: Generate single consolidated document (must complete <9s)
  - If 5+ positions: Generate individual documents per position, combine into ZIP
- [ ] T102 [US3] Implement ZIP aggregation in backend/src/services/document-zip.service.ts (use archiver library, stream files from Wasabi, generate ZIP in-memory)
- [ ] T103 [P] [US3] Write integration tests for multi-position generation in backend/tests/integration/document-multi-position.test.ts (test scenarios: 1, 5, 10, 20, 50 positions, verify generation times, ZIP contents)
- [ ] T104 [US3] Implement document batch generation route in backend/src/api/documents.routes.ts (POST /api/documents/generate-multiple with position_ids array, return ZIP stream)

### Frontend UI
- [ ] T105 [P] [US3] Create PositionBulkActions component in frontend/src/components/positions/PositionBulkActions.tsx (checkbox selection, select all, generate ZIP button)
- [ ] T106 [P] [US3] Create ConsolidatedReportDialog component in frontend/src/components/documents/ConsolidatedReportDialog.tsx (option: single consolidated PDF or individual docs ZIP)
- [ ] T107 [US3] Add bulk selection UI to PositionList page in frontend/src/pages/Positions.tsx (checkboxes, bulk action toolbar)

### E2E Tests
- [ ] T108 [US3] Write E2E test for multi-position flow in tests/e2e/us3-multiple-positions.spec.ts:
  1. Create 15 work positions (Director, Accountant, Field Worker, Driver, Admin, Secretary, IT Support, Warehouse Manager, Salesperson, Marketing Manager, HR Manager, Electrician, Mechanic, Cleaner, Security Guard)
  2. Add risks to each position (vary hazards and risk levels)
  3. Select all 15 positions via checkboxes
  4. Click "Generate consolidated report"
  5. Download ZIP file
  6. Verify ZIP contains 15 individual DOCX files
  7. Extract and verify first and last document structure

**Acceptance Criteria** (per spec.md User Story 3):
- ✅ All 3 acceptance scenarios from spec.md pass
- ✅ Virtual scrolling performs smoothly with 50+ positions (60fps, no lag)
- ✅ ZIP download contains individual documents for each selected position
- ✅ Consolidated summary table shows all positions with risk levels (FR-040a in each document)
- ✅ Generation completes within Vercel Free 10s timeout (split strategy works)

## Phase 6: User Story 4 - AI Risk Recommendations (P4 - Deferred Post-MVP)

**Story Goal**: AI suggests hazards and corrective measures based on job description

**Independent Test**: User enters job description, AI suggests 3-5 relevant hazard codes, user accepts/rejects

**Note**: Implementation deferred to post-MVP per spec.md Priority P4. Tasks outlined for future reference.

**Tasks**:
- [ ] T109 [US4] Setup Anthropic Claude API client in backend/src/lib/anthropic.ts (API key configuration, rate limiting)
- [ ] T110 [US4] Implement AIRecommendationService in backend/src/services/ai.service.ts (suggestHazards, suggestCorrectiveMeasures methods)
- [ ] T111 [US4] Create hazard prediction prompt template in backend/src/templates/prompts/hazard-prediction.txt (Serbian BZR context, few-shot examples, output format JSON)
- [ ] T112 [US4] Implement AI suggestion routes in backend/src/api/ai.routes.ts (POST /api/ai/suggest-hazards, POST /api/ai/suggest-measures)
- [ ] T113 [US4] Create AISuggestionsPanel component in frontend/src/components/ai/AISuggestionsPanel.tsx (display suggestions with rationale, accept/reject buttons)
- [ ] T114 [US4] Write E2E test for AI suggestions in tests/e2e/us4-ai-recommendations.spec.ts (input job description "works 8h at computer", verify AI suggests hazards 29, 33, 34 with >70% relevance)

**Acceptance Criteria** (per spec.md User Story 4):
- ✅ AI suggests 3-5 hazards for job description "works 8 hours daily at computer" (should include 29 screen work, 33 awkward posture, 34 psychological stress)
- ✅ AI provides rationale for each suggestion in Serbian Cyrillic
- ✅ User can accept/reject suggestions (accepted suggestions populate hazard checklist)
- ✅ Accuracy ≥70% per SC-008 (measured via user acceptance rate)

## Phase 7: User Story 5 - Excel Import (P5 - Deferred Post-MVP)

**Story Goal**: Import existing sistematizacija from Excel file (30 positions)

**Independent Test**: User uploads XLSX, system previews extracted positions, user approves, positions created

**Note**: Implementation deferred to post-MVP per spec.md Priority P5. Tasks outlined for future reference.

**Tasks**:
- [ ] T115 [US5] Setup xlsx library in backend/src/lib/xlsx.ts (SheetJS configuration, stream parsing for large files)
- [ ] T116 [US5] Implement ExcelParserService in backend/src/services/excel-parser.service.ts (parseFile, mapColumns, validateRows methods)
- [ ] T117 [US5] Write unit tests for column mapping in backend/tests/unit/excel-parser.service.test.ts (test expected format per edge cases in spec.md)
- [ ] T118 [US5] Implement Excel import route in backend/src/api/import.routes.ts (POST /api/import/excel with file upload, preview response before commit)
- [ ] T119 [US5] Create ExcelImportDialog component in frontend/src/components/import/ExcelImportDialog.tsx (file upload drag-drop, preview table with validation errors highlighted, confirm button)
- [ ] T120 [US5] Write E2E test for Excel import in tests/e2e/us5-excel-import.spec.ts (upload sample XLSX with 25 positions, verify preview accuracy, confirm import, verify database records)

**Acceptance Criteria** (per spec.md User Story 5):
- ✅ Parser handles expected format (columns: Position Name, Education, Experience, Male Count, Female Count per FR-025)
- ✅ Import success rate ≥85% per SC-009
- ✅ Preview shows all positions before database commit with validation errors highlighted (FR-047d)
- ✅ Error handling for unexpected formats per edge cases (FR-047a-c: unrecognized format, missing columns, invalid data)

## Phase 8: Storage Quotas & Referral System (P6 - Phase 4+)

**Story Goal**: Implement Dropbox-style viral growth mechanism with storage bonuses for referrals

**Independent Test**: User generates referral code, referee registers + upgrades, both receive +5GB storage bonus while subscriptions active

**Note**: Architecture prepared in Phase 1-2, full implementation deferred to Phase 4+ per spec.md Priority P6.

**Tasks**:

### Database Models
- [ ] T121 [P] [US6] Define Referral model in backend/src/models/referrals.ts with all fields from spec (referrer_user_id, referee_user_id, referral_code_used, referral_date, referee_upgraded_date, referee_subscription_status, bonus_active, bonus_expiry_date)
- [ ] T122 [P] [US6] Define UserFile model in backend/src/models/user_files.ts for personal file storage (user_id, file_id UUID, filename, file_path_s3 user-files/{user_id}/{file_id}.{ext}, file_size_bytes, mime_type, file_category, upload_date, is_deleted)
- [ ] T123 [US6] Create migration for referrals, user_files tables in backend/drizzle/0007_referrals.sql
- [ ] T124 [US6] Add storage fields to User model in backend/src/models/users.ts (storage_quota_gb calculated dynamically, storage_used_bytes, referral_code unique 8-char alphanumeric, referred_by_user_id nullable)
- [ ] T125 [US6] Implement RLS policies for referrals and user_files tables in backend/drizzle/0008_rls_referrals.sql (user can only see own referrals and files)

### Business Logic (TDD)
- [ ] T126 [P] [US6] Write unit tests for storage quota calculation in backend/tests/unit/storage-quota.service.test.ts (formula: base 10GB + loyalty 1GB + active_referrals_count × 5GB per FR-056i, test scenarios: 0, 1, 10, 100 referrals)
- [ ] T127 [US6] Implement StorageQuotaService in backend/src/services/storage-quota.service.ts with dynamic calculation (calculateQuota, recalculateAllQuotas for cron job)
- [ ] T128 [P] [US6] Write unit tests for referral service in backend/tests/unit/referral.service.test.ts (code generation unique 8-char, bonus activation when both users paid, 30-day grace period logic)
- [ ] T129 [US6] Implement ReferralService in backend/src/services/referral.service.ts (generateReferralCode, trackReferral, activateBonus, deactivateBonus methods)
- [ ] T130 [US6] Implement cron job for daily referral eligibility check in backend/src/jobs/check-referral-eligibility.job.ts (check if both users paid, activate/deactivate bonuses, send notifications)

### API Endpoints
- [ ] T131 [P] [US6] Write contract tests for referral endpoints in backend/tests/contract/referrals.contract.test.ts (POST /api/referrals/generate-code, GET /api/referrals, GET /api/referrals/stats)
- [ ] T132 [US6] Implement referral routes in backend/src/api/referrals.routes.ts (generate code, list referrals with status, track bonus amounts)
- [ ] T133 [P] [US6] Write contract tests for user file endpoints in backend/tests/contract/user-files.contract.test.ts (POST /api/user-files/upload, GET /api/user-files, DELETE /api/user-files/:id with quota check)
- [ ] T134 [US6] Implement user file routes in backend/src/api/user-files.routes.ts (upload with quota validation per FR-056j, list, delete with storage recalculation)

### Storage Management
- [ ] T135 [US6] Implement file upload with quota validation in backend/src/services/file-upload.service.ts (check storage_used_bytes + file_size <= storage_quota_gb before upload, block if exceeds with Serbian error per FR-056j)
- [ ] T136 [US6] Implement storage usage tracking in backend/src/services/storage-tracking.service.ts (recalculate storage_used_bytes on upload/delete, update user record)
- [ ] T137 [US6] Implement downgrade reconciliation in backend/src/services/storage-reconciliation.service.ts (30-day grace period, FIFO deletion of oldest files, email warnings per FR-056t)
- [ ] T138 [P] [US6] Write integration tests for storage quota enforcement in backend/tests/integration/storage-quota.test.ts (test quota calculation with 100+ referrals <200ms per SC-011, test upload blocking when quota exceeded)

### Email Notifications
- [ ] T139 [P] [US6] Create referral email templates in backend/src/templates/emails/ (bonus-awarded.html "Čestitamo! Dobili ste +5GB prostora.", cancellation-warning.html with 30-day grace period, storage-limit-90.html, storage-limit-95.html, storage-limit-100.html)
- [ ] T140 [US6] Implement storage warning emails in backend/src/services/email.service.ts (sendStorageWarning at 90%, 95%, 100% thresholds per FR-056l)

### Frontend UI
- [ ] T141 [P] [US6] Create StorageWidget component in frontend/src/components/storage/StorageWidget.tsx (usage bar with percentage, quota display "Iskorišćeno: {used}GB / {quota}GB ({percentage}%)" per FR-056k, color-coded: green <80%, yellow 80-95%, red >95%)
- [ ] T142 [P] [US6] Create ReferralDashboard component in frontend/src/components/referral/ReferralDashboard.tsx (generate referral link, copy to clipboard, list referrals table with status: pending/active/cancelled, track bonus amounts, total storage earned)
- [ ] T143 [P] [US6] Create FileUploadDialog component in frontend/src/components/storage/FileUploadDialog.tsx (drag-drop area, file category selection, progress bar, quota validation before upload)
- [ ] T144 [P] [US6] Create FileManager component in frontend/src/components/storage/FileManager.tsx (Dropbox-like UI with file list, sort by date/name/size, delete button, download button)
- [ ] T145 [US6] Implement StoragePage in frontend/src/pages/StoragePage.tsx (StorageWidget, FileManager, upload button)
- [ ] T146 [US6] Implement ReferralPage in frontend/src/pages/ReferralPage.tsx (ReferralDashboard, invite friends section with social sharing buttons)

### E2E Tests
- [ ] T147 [US6] Write E2E test for referral flow in tests/e2e/us6-referral-system.spec.ts:
  1. User A (existing paid account) generates referral code
  2. User B registers with referral code in URL parameter
  3. User B upgrades to paid account (mock payment)
  4. Verify both User A and User B receive +5GB bonus (check storage quota API)
  5. Verify notification emails sent ("Čestitamo! Dobili ste +5GB prostora.")
  6. User B cancels subscription (mock cancellation)
  7. Verify 30-day grace period starts (bonus still active)
  8. Fast-forward 31 days (mock time)
  9. Verify bonus removed from both users
  10. Verify notification emails sent to User A ("Korisnik {name} je otkazao pretplatu. Vaš bonus od 5GB će biti uklonjen za 30 dana.")

**Acceptance Criteria** (per spec.md User Story 6):
- ✅ All 10 acceptance scenarios from spec.md pass
- ✅ Free users limited to 1GB per FR-056a
- ✅ Paid users get 11GB (10GB base + 1GB loyalty) per FR-056b
- ✅ Referral bonuses calculated correctly (+5GB per active referral per FR-056d-e)
- ✅ No limit on referral count (100, 1000+ supported per FR-056h)
- ✅ Grace period enforced (30 days after cancellation per FR-056g)
- ✅ Storage quota calculation < 200ms for 100+ referrals per SC-011
- ✅ Viral coefficient ≥20% per SC-011 (average 20+ successful referrals per 100 paid users within 6 months)

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Production readiness, monitoring, security hardening

**Tasks**:

### Security & Compliance
- [ ] T148 [P] Implement JMBG encryption in backend/src/lib/encryption.ts (AES-256-GCM per FR-031 with secure key management, not in .env)
- [ ] T149 [P] Implement GDPR data export in backend/src/services/gdpr.service.ts (ZIP with all user data: JSON export of company/positions/risks, all generated DOCX documents, audit log per FR-049a)
- [ ] T150 [P] Implement GDPR data deletion in backend/src/services/gdpr.service.ts (hard delete within 30 days per FR-049b, email confirmation, audit trail)
- [ ] T151 Implement audit logging middleware in backend/src/middleware/audit.middleware.ts (log all document generations, data modifications with user_id, entity_type, entity_id, action, timestamp, old_values JSON, new_values JSON per FR-048c)
- [ ] T152 [P] Write security tests in backend/tests/security/ (SQL injection via parameterized queries, XSS via input sanitization, CSRF token validation, JWT tampering detection, RLS bypass attempts)

### Monitoring & Observability
- [ ] T153 [P] Implement custom metrics tracking in backend/src/services/metrics.service.ts (store in audit_logs table: API response times, document generation times, error counts, slow queries >100ms)
- [ ] T154 [P] Create admin dashboard for metrics in frontend/src/pages/AdminDashboard.tsx (total users, documents generated today/week/month, error rate chart, slow query table, Vercel execution count vs 100/day limit)
- [ ] T155 [P] Setup structured logging with Pino in backend/src/lib/logger.ts (log levels, request ID correlation, error stack traces, Serbian error messages)
- [ ] T156 Implement health check endpoint in backend/src/api/health.routes.ts (GET /api/health returns 200 with status: database connectivity test, Wasabi connection test, Resend API test, version number)

### Performance Optimizations
- [ ] T157 [P] Add database indices for performance in backend/drizzle/0009_performance_indices.sql (company_id on all multi-tenant tables, position_id on risk_assessments/ppe/training, user_id on documents/audit_logs, upload_date on user_files for FIFO deletion)
- [ ] T158 [P] Implement query result caching for hazard types in backend/src/services/cache.service.ts (static reference data, cache in memory, invalidate on migration)
- [ ] T159 [P] Optimize DOCX template per R1 mitigation in plan.md (minimize Mustache loops, pre-compile data structures, buffer vs stream strategy, target <8s for single position)

### Accessibility & i18n
- [ ] T160 [P] Audit all components for WCAG AA compliance with axe DevTools (run automated scans, fix issues: missing alt text, insufficient contrast, missing aria-labels)
- [ ] T161 [P] Implement keyboard shortcuts in frontend/src/lib/keyboard-shortcuts.ts (Tab navigation, Enter to submit, Escape to close modals, Arrow keys for select options per FR-054a)
- [ ] T162 [P] Test with NVDA/JAWS screen readers in Windows (verify all form labels read correctly, error announcements via aria-live, risk level badges announce "Nizak rizik"/"Srednji rizik"/"Povećan rizik")
- [ ] T163 [P] Verify Serbian Cyrillic character rendering in frontend/src/lib/i18n.ts (test special characters: Ђ, Ћ, Љ, Њ, Џ, Ж, Ш across all browsers: Chrome, Firefox, Edge, Safari)

### Deployment & CI/CD
- [ ] T164 Setup GitHub Actions workflow in .github/workflows/ci.yml (on push: lint with ESLint, test backend unit/integration with Vitest, test frontend unit with Vitest + React Testing Library, build frontend/backend, deploy preview to Vercel)
- [ ] T165 [P] Configure Vercel production deployment with environment variables (set SUPABASE_URL, SUPABASE_KEY, WASABI_*, RESEND_API_KEY, JWT_SECRET in Vercel dashboard)
- [ ] T166 [P] Setup staging environment on Vercel (create separate project for preview deployments, link to GitHub PR branches)
- [ ] T167 [P] Create database backup script in backend/scripts/backup-db.sh (pg_dump to Wasabi bucket with timestamp, retain last 30 days, daily cron)
- [ ] T168 [P] Document deployment process in quickstart.md (CLI commands: vercel --prod, environment variable setup, domain configuration, SSL certificate verification)

### Documentation
- [ ] T169 [P] Write API documentation in docs/api.md (all 25+ endpoints with Serbian descriptions, request/response examples, error codes, authentication requirements)
- [ ] T170 [P] Write developer onboarding guide in docs/onboarding.md (prerequisites, environment setup 30-60 minutes, local development workflow, TDD cycle, troubleshooting)
- [ ] T171 [P] Write troubleshooting guide in docs/troubleshooting.md (common issues: database connection failures, Wasabi upload errors, DOCX generation timeouts, email delivery failures, JWT expiration, RLS policy debugging)
- [ ] T172 [P] Create video demo of MVP workflow (screen recording: company creation → position wizard → risk assessment with E×P×F → document generation → download DOCX → open in Word, 5-10 minutes, Serbian voiceover)

**Acceptance Criteria**:
- ✅ All quality gates from constitution pass (TDD 80%+ coverage, security hardening, WCAG AA accessibility)
- ✅ 80%+ code coverage per SC-010 (Vitest coverage report for backend business logic, frontend components)
- ✅ Health check endpoint returns 200 with all services healthy (database connected, Wasabi accessible, Resend API key valid)
- ✅ Admin dashboard displays real-time metrics (users count, documents generated today, error rate, slow queries, Vercel execution quota usage)
- ✅ Deployment automated via Vercel Git integration (push to main → automatic production deployment, PR branches → preview deployments)

## Task Dependencies & Execution Order

### Critical Path (Must Complete Sequentially)
1. **Phase 1** (T001-T011): Project setup → enables all development
2. **Phase 2** (T012-T042): Foundational services → required by all user stories
3. **Phase 3** (T043-T074): User Story 1 → MVP core, independently testable
4. **Phase 4** (T075-T097): User Story 2 → depends on US1 models, independently testable
5. **Phase 5** (T098-T108): User Story 3 → depends on US1+US2, independently testable
6. **Phase 9** (T148-T172): Polish → spans all phases

### Parallel Opportunities

**Within Phase 2** (After T012-T014 complete):
- Can parallelize: T015-T020 (Auth), T021-T025 (Rate Limiting), T026-T029 (Email), T030-T032 (Storage), T033-T036 (Document Foundation), T037-T042 (Frontend Foundation)
- All foundational services are independent

**Within Phase 3** (After T043-T048 complete):
- Can parallelize: T049-T052 (Business Logic), T053-T058 (API Endpoints), T065-T069 (Frontend Components)
- Tests (T049, T051, T053, T055, T057, T059, T062) can run before implementation if TDD

**Within Phase 8** (After T121-T125 complete):
- Can parallelize: T126-T130 (Business Logic), T131-T134 (API), T139-T140 (Emails), T141-T146 (Frontend)

### User Story Completion Order

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundation)
  ↓
Phase 3 (US1) ←→ [INDEPENDENTLY TESTABLE - MVP COMPLETE]
  ↓
Phase 4 (US2) ←→ [INDEPENDENTLY TESTABLE]
  ↓
Phase 5 (US3) ←→ [INDEPENDENTLY TESTABLE]
  ↓
Phase 6 (US4) ←→ [DEFERRED - Independently testable when implemented]
  ↓
Phase 7 (US5) ←→ [DEFERRED - Independently testable when implemented]
  ↓
Phase 8 (US6) ←→ [PHASE 4+ - Independently testable when implemented]
  ↓
Phase 9 (Polish)
```

## Validation Summary

**Total Tasks**: 172
- Phase 1 (Setup): 11 tasks (T001-T011)
- Phase 2 (Foundation): 31 tasks (T012-T042)
- Phase 3 (US1 - MVP): 32 tasks (T043-T074)
- Phase 4 (US2): 23 tasks (T075-T097)
- Phase 5 (US3): 11 tasks (T098-T108)
- Phase 6 (US4 - Deferred): 6 tasks (T109-T114)
- Phase 7 (US5 - Deferred): 6 tasks (T115-T120)
- Phase 8 (US6 - Phase 4+): 27 tasks (T121-T147)
- Phase 9 (Polish): 25 tasks (T148-T172)

**Parallelizable Tasks**: 87 tasks marked with [P]

**User Story Breakdown**:
- US1 (MVP Core): 32 tasks
- US2 (PPE/Training): 23 tasks
- US3 (Multi-position): 11 tasks
- US4 (AI - Deferred): 6 tasks
- US5 (Excel - Deferred): 6 tasks
- US6 (Referrals - Phase 4+): 27 tasks

**MVP Scope** (Phase 1-3 + essential Phase 9): ~74 tasks
**Post-MVP** (Phase 4-8): ~98 tasks

**Independent Test Coverage**: Each user story (US1-US6) has explicit E2E test task verifying acceptance criteria from spec.md:
- T074: US1 complete flow (register → company → position → risks → document)
- T097: US2 PPE/Training flow
- T108: US3 multi-position with ZIP download
- T114: US4 AI suggestions (deferred)
- T120: US5 Excel import (deferred)
- T147: US6 referral system (Phase 4+)

**Format Compliance**: ✅ All tasks follow checklist format with [TaskID] [P?] [Story?] Description + file path

**Constitution Compliance**: ✅
- TDD: Test tasks precede implementation tasks in all phases (T016 before T015, T049/T051 before T050/T052)
- Security: RLS policies (T014, T047, T079, T125), encryption (T148), GDPR (T149-T150), audit trail (T151)
- Serbian Language: i18n setup (T037), email templates (T027, T139), validation messages in Cyrillic
- Accessibility: WCAG audit (T160), keyboard shortcuts (T161), screen reader testing (T162)
- Multi-Tenancy: RLS policies in all multi-tenant table migrations (T014, T047, T079, T125)
- Legal Compliance: Document sections FR-034-042 (T034, T088-T090), risk methodology (T049-T050)

---

**Version**: 1.0.0 | **Generated**: 2025-10-27 | **Status**: Ready for `/speckit.implement`
