# BZR Portal Implementation Status

**Last Updated**: 2025-10-22
**Current Phase**: Phase 3 (MVP - User Story 1)

## Executive Summary

- **Phase 1**: ✅ COMPLETE (10/10 tasks)
- **Phase 2**: ✅ COMPLETE (20/20 tasks)
- **Phase 3**: 🔄 IN PROGRESS (0/46 MVP tasks complete)

**Total Progress**: 30/76 tasks complete (39%)

---

## ✅ Phase 1: Project Setup COMPLETE

All infrastructure setup tasks completed:

- ✅ Directory structure (backend/, frontend/, shared/, .specify/)
- ✅ TypeScript 5.0+ strict mode configured
- ✅ Backend: Hono + Drizzle ORM + Vitest
- ✅ Frontend: Vite + React 18 + Playwright
- ✅ ESLint + Prettier configured
- ✅ .env.example files created with all required variables
- ✅ Vercel deployment config (vercel.json with 60s timeout)
- ✅ All ignore files created

**Key Note**: Project uses **Vite** (not Next.js 14 as originally planned)

---

## ✅ Phase 2: Foundational Infrastructure COMPLETE

All 20 core infrastructure tasks completed:

### Database & ORM ✅
- Drizzle ORM initialized with PostgreSQL connection
- All schemas created: companies, users, workPositions, hazardTypes, riskAssessments, ppe, training, medicalExams
- Migration system configured

### Authentication ✅
- User schema with RBAC (4 roles: admin, bzr_officer, hr_manager, viewer)
- JWT utilities: 15min access tokens + 7day refresh tokens
- Auth middleware with Bearer token extraction
- **Trial limits middleware**: Enforces 1 company, 3 positions, 5 documents, 14-day expiration

### API Infrastructure ✅
- Hono app with CORS and error handling
- tRPC integration (type-safe RPC instead of REST)
- Pino structured JSON logging
- Rate limiting: 20 req/min (anonymous), 100 req/min (authenticated), 5 req/min (document generation)

### Frontend Infrastructure ✅
- Zustand auth store with persist middleware
- TanStack Query configured with query keys factory
- API client with automatic JWT injection
- i18n configured for Serbian Cyrillic (sr-Cyrl-RS)
- Comprehensive Serbian translations (200+ keys)

### Shared Validation ✅
- Company schema with PIB modulo-11 checksum validation
- WorkPosition schema with labor law constraints
- RiskAssessment schema with E×P×F validation (R < Ri enforcement)

---

## 🔄 Phase 3: MVP User Story 1 (IN PROGRESS)

**Goal**: Enable BZR officer to create risk assessment for one work position, generate legally compliant DOCX document

**Progress**: 0/46 tasks complete

### Tests (T031-T037) - Priority: HIGH ⚠️

**Status**: Not started (should be written FIRST per TDD)

- [ ] T031: Unit test for E×P×F calculator
- [ ] T032: Unit test for PIB checksum validation
- [ ] T033-T036: Contract tests for API endpoints
- [ ] T037: E2E test for complete user journey

### Database (T038-T043) - Partially Complete

**Existing schemas** (already created):
- ✅ companies.ts: userId, PIB, activity code, director, bzrResponsiblePerson
- ✅ work-positions.ts: companyId FK, employee counts, shift/night work indicators
- ✅ hazards.ts: hazardTypes reference table (code, nameSr, category)
- ✅ risk-assessments.ts: E×P×F factors, corrective measures

**Still needed**:
- [ ] T042: Run Drizzle migrations (`npm run db:generate && npm run db:push`)
- [ ] T043: Seed Serbian hazard codes (codes: 06, 07, 10, 15, 29, 33, 34, 35, 36)

### Business Logic (T044-T048) - 1/5 Complete

**Existing**:
- ✅ T044: RiskCalculator (backend/src/lib/utils/risk-calculator.ts)
  - calculateRisk(E, P, F) → R
  - getRiskLevel(R) → 'low' | 'medium' | 'high'
  - validateRiskReduction(Ri, R) → boolean

**Still needed**:
- [ ] T045: Validators (PIB, activity code) in backend/src/lib/validators.ts
- [ ] T046: CompanyService (CRUD with RLS enforcement)
- [ ] T047: PositionService (CRUD with company ownership)
- [ ] T048: RiskAssessmentService (with R < Ri validation)

### API Endpoints (T049-T056) - 0/8 Complete

**Infrastructure exists** (tRPC configured), need to create procedures:

- [ ] T049: auth.register (trial account creation)
- [ ] T050: auth.login (JWT issuance)
- [ ] T051: companies.create
- [ ] T052: companies.byId
- [ ] T053: positions.create
- [ ] T054: positions.byId
- [ ] T055: risks.create (with R < Ri validation)
- [ ] T056: hazards.list

### Document Generation (T057-T060) - Priority: HIGH ⚠️

**Core MVP feature** - generate "Akt o proceni rizika" DOCX

- [ ] T057: Design Word template (Akt_Procena_Rizika_Template.docx)
  - Serbian Cyrillic text with special chars (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш)
  - Mustache placeholders: {{company.name}}, {{#risks}}...{{/risks}}
  - 8 mandatory sections per Serbian regulations

- [ ] T058: DocumentGenerator service using docx-templates library

- [ ] T059: Blob storage utility (Vercel Blob Storage or Cloudflare R2)

- [ ] T060: documents.generate tRPC procedure
  - Synchronous with progress streaming
  - 60s timeout (Vercel Pro plan)

### Frontend Components (T061-T070) - Priority: HIGH ⚠️

**User-facing MVP features**:

- [ ] T061: Login page
- [ ] T062: Register page (trial account signup)
- [ ] T063: CompanyForm (with PIB validation UI)
- [ ] T064: PositionForm
- [ ] T065: HazardSelector (checklist with 45+ hazards)
- [ ] T066: RiskAssessmentForm (E×P×F inputs with real-time Ri/R calculation)
- [ ] T067: RiskLevelBadge (green ≤36, yellow ≤70, red >70)
- [ ] T068: PositionWizard (multi-step: Basic Info → Job Description → Risk Assessment)
- [ ] T069: DocumentGenerationModal (with progress bar)
- [ ] T070: Dashboard (with trial banner: "Пробни налог - X дана преостало")

### Integration & Polish (T071-T076) - Priority: MEDIUM

- [ ] T071: Serbian Cyrillic error messages throughout
- [ ] T072: Audit logging for CRUD operations (FR-033)
- [ ] T073: Verify 80%+ test coverage for risk calculation
- [ ] T074: Test Serbian Cyrillic special characters in DOCX
- [ ] T075: Verify trial limits enforced (1 company, 3 positions, 5 docs)
- [ ] T076: Verify DOCX opens in Microsoft Word 2016+

---

## Critical Path to MVP Completion

**Estimated effort: 3-4 weeks**

### Week 1: Backend Core
1. Run migrations and seed hazard codes (T042-T043)
2. Create service layer (T045-T048): CompanyService, PositionService, RiskAssessmentService
3. Create tRPC procedures (T049-T056): auth, companies, positions, risks, hazards

### Week 2: Document Generation
4. Design DOCX template in Microsoft Word with Serbian Cyrillic (T057)
5. Implement DocumentGenerator service (T058-T060)
6. Test document generation with sample data

### Week 2-3: Frontend
7. Auth pages (T061-T062): Login, Register
8. Form components (T063-T067): Company, Position, Risk, HazardSelector, RiskLevelBadge
9. Wizard and Dashboard (T068-T070): PositionWizard, DocumentGenerationModal, Dashboard

### Week 3: Testing & Polish
10. Write all tests (T031-T037)
11. Integration and polish (T071-T076)
12. End-to-end validation

---

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ / Bun
- **Framework**: Hono (serverless-optimized)
- **API**: tRPC (type-safe RPC)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Auth**: JWT (access + refresh tokens)
- **Document**: docx-templates (Mustache)
- **Storage**: Vercel Blob Storage
- **Testing**: Vitest + Playwright
- **Logging**: Pino (structured JSON)

### Frontend
- **Framework**: Vite + React 18
- **State**: Zustand + TanStack Query
- **UI**: shadcn/ui (Radix UI + Tailwind)
- **Forms**: React Hook Form + Zod
- **i18n**: i18next (Serbian Cyrillic)
- **Routing**: React Router v6
- **Testing**: Vitest + Playwright

### Deployment
- **Platform**: Vercel Pro (60s function timeout)
- **Region**: Frankfurt (fra1)
- **Database**: Neon (serverless Postgres)

---

## Files Created During This Session

### Phase 1
- `.gitignore`, `.dockerignore`, `.eslintignore`, `.prettierignore`, `.vercelignore`
- `.prettierrc`, `.eslintrc.json`
- `backend/.env.example`, `frontend/.env.example`
- `vercel.json`
- `shared/schemas/` directory

### Phase 2
- `backend/src/api/middleware/trial-limits.ts` (enforce trial account limits)
- `backend/src/lib/logger.ts` (Pino structured logging)
- `backend/src/api/middleware/rate-limit.ts` (token bucket algorithm)
- `shared/schemas/company.ts` (with PIB validation)
- `shared/schemas/position.ts` (with labor law constraints)
- `shared/schemas/risk.ts` (with E×P×F validation)
- `shared/schemas/index.ts` (schema exports)
- `frontend/src/store/auth.ts` (Zustand auth store)
- `frontend/src/i18n/index.ts`, `frontend/src/i18n/sr-Cyrl.json` (Serbian i18n)
- `frontend/src/lib/query-client.ts` (TanStack Query config)
- `frontend/src/lib/api-client.ts` (fetch wrapper with JWT)

---

## Next Immediate Actions

**1. Run database setup:**
```bash
cd backend
npm run db:generate  # Generate SQL migrations from schemas
npm run db:push      # Apply migrations to Neon database
npm run db:seed      # Seed hazard codes (06, 07, 10, 15, 29, 33, 34, 35, 36)
```

**2. Create service layer** (backend/src/services/):
- CompanyService.ts
- PositionService.ts
- RiskAssessmentService.ts
- DocumentGenerator.ts

**3. Create tRPC routers** (backend/src/api/trpc/routers/):
- auth.ts
- companies.ts
- positions.ts
- risks.ts
- hazards.ts
- documents.ts

**4. Design DOCX template** (backend/templates/):
- Use Microsoft Word with Serbian Cyrillic font
- Create template structure per Serbian BZR regulations
- Add Mustache placeholders for dynamic data

**5. Implement frontend pages/components** following T061-T070

---

## Risk Assessment

### High Risk ⚠️
- **DOCX template complexity**: Ensuring Serbian Cyrillic renders correctly, legal compliance
- **Document generation timeout**: 60s Vercel limit may be tight for >30 page documents

### Medium Risk
- **Trial account edge cases**: Concurrent operations, limit enforcement
- **PIB validation**: Ensuring modulo-11 checksum implementation is correct
- **RLS enforcement**: PostgreSQL RLS policies configuration

### Low Risk
- **Auth/JWT**: Standard, well-tested pattern
- **Frontend forms**: React Hook Form + Zod is battle-tested

---

## Completion Checklist

Before declaring MVP complete, verify:

- [ ] User can register trial account (self-service)
- [ ] User can create 1 company with PIB validation
- [ ] User can create up to 3 work positions per company
- [ ] User can assess risks using E×P×F methodology (1-6 scale)
- [ ] System validates R < Ri (residual risk must be lower than initial)
- [ ] User can generate DOCX document (synchronous, <60s)
- [ ] Generated document opens in Microsoft Word 2016+
- [ ] Serbian Cyrillic text renders correctly (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш)
- [ ] Trial limits enforced (1 company, 3 positions, 5 documents)
- [ ] Trial banner shows days remaining
- [ ] All tests pass with 80%+ coverage for risk calculation
- [ ] Document matches legal requirements (8 mandatory sections)

---

## Documentation References

- **Feature Spec**: `specs/main/spec.md` (user stories, requirements)
- **Implementation Plan**: `specs/main/plan.md` (technical context, architecture)
- **Tasks**: `specs/main/tasks.md` (detailed task breakdown)
- **Research**: `specs/main/research.md` (technical decisions, best practices)
- **Data Model**: `specs/main/data-model.md` (database schema, validation rules)

---

**Status**: Ready to proceed with Phase 3 MVP implementation following the critical path outlined above.
