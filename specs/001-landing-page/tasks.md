# Implementation Tasks: BZR Portal Landing Page & Marketing Site

**Feature**: Landing Page & Marketing Site
**Branch**: `main`
**Generated**: 2025-01-28
**Spec**: [spec.md](./spec.md) | **Plan**: [../main/plan.md](../main/plan.md)

## Overview

Landing page implementation organized by **user story priority** to enable independent, incremental delivery.

**Total Tasks**: 87 tasks across 8 phases
**Parallel Opportunities**: 45 parallelizable tasks marked with [P]
**MVP Scope**: Phase 3 only (User Story 1 - 35 tasks total including setup)

---

## Phase 1: Setup & Infrastructure (8 tasks)

**Objective**: Initialize project structure, install dependencies, configure tooling.

- [ ] T001 Install frontend dependencies (React 18, Vite, shadcn/ui, Tailwind CSS, React Router, React Hook Form, Zod) in frontend/package.json
- [ ] T002 Install backend dependencies (Hono rate limiter, Resend SDK) in backend/package.json
- [ ] T003 Configure Noto Sans font (Google Fonts Cyrillic) in frontend/index.html + tailwind.config.js
- [ ] T004 [P] Create landing directory structure (frontend/src/pages/, frontend/src/components/landing/, frontend/src/lib/i18n/)
- [ ] T005 [P] Configure Vite pre-rendering plugin (vite-plugin-prerender-routes) for SEO
- [ ] T006 [P] Setup Playwright E2E testing (install @playwright/test, create tests/e2e/)
- [ ] T007 [P] Setup Lighthouse CI (.lighthouserc.json with Performance/Accessibility ≥90)
- [ ] T008 Configure environment variables (RESEND_API_KEY, SUPPORT_EMAIL in backend/.env)

---

## Phase 2: Foundational Components (9 tasks)

**Objective**: Create reusable layout components and i18n content.

**Blocking for**: All user story implementations (Phase 3-7)

- [ ] T009 Create Serbian Cyrillic content file (frontend/src/lib/i18n/landing-content-sr.ts)
- [ ] T010 [P] Create LandingNav component (frontend/src/components/layout/LandingNav.tsx)
- [ ] T011 [P] Create MobileMenu component (frontend/src/components/layout/MobileMenu.tsx)
- [ ] T012 [P] Create LandingFooter component (frontend/src/components/layout/LandingFooter.tsx)
- [ ] T013 [P] Implement responsive navigation (hamburger <768px, horizontal ≥768px)
- [ ] T014 [P] Create NotFoundPage component (frontend/src/pages/NotFoundPage.tsx)
- [ ] T015 [P] Setup React Router routes (/, /features, /pricing, /about, /contact, /*) with code splitting
- [ ] T016 [P] Add Tailwind breakpoints (375px, 768px, 1024px, 1920px) in tailwind.config.js
- [ ] T017 [P] Create placeholder brand assets (text logo, default colors)

---

## Phase 3: User Story 1 - Discover Platform Value (P1) (18 tasks)

**Goal**: BZR officer understands platform value within 15 seconds.

**Independent Test**: Load /, verify hero + 3 value props visible, mobile 375px single-column, Cyrillic renders, Lighthouse ≥90.

### 3.1: Homepage Structure (2 tasks)

- [ ] T018 [US1] Create HomePage component (frontend/src/pages/HomePage.tsx)
- [ ] T019 [US1] Integrate LandingNav + LandingFooter in HomePage

### 3.2: Hero Section (5 tasks)

- [ ] T020 [P] [US1] Create HeroSection component (frontend/src/components/landing/HeroSection.tsx)
- [ ] T021 [P] [US1] Implement hero CTA buttons ("Počnite besplatno", "Pogledajte demo")
- [ ] T022 [P] [US1] Add demo placeholder image (frontend/public/images/demo-poster.svg <100KB)
- [ ] T023 [P] [US1] Implement hero background (gradient, WCAG AA 4.5:1 contrast)
- [ ] T024 [P] [US1] Make hero responsive (mobile: single column, desktop: side-by-side)

### 3.3: Value Props Section (4 tasks)

- [ ] T025 [P] [US1] Create ValuePropsSection component (frontend/src/components/landing/ValuePropsSection.tsx)
- [ ] T026 [P] [US1] Create value prop icons (AI: robot, Mobile: phone, Legal: shield)
- [ ] T027 [P] [US1] Implement card content ("10x brže sa AI", "Radite sa telefona", "Usklađeno sa zakonom")
- [ ] T028 [P] [US1] Make responsive (desktop: 3 cols, tablet: 3 or 2+1, mobile: 1 col)

### 3.4: Testing (4 tasks)

- [ ] T029 [P] [US1] Write E2E test (frontend/tests/e2e/landing-homepage.spec.ts) - homepage loads <3s, hero + value props visible, CTA links work
- [ ] T030 [P] [US1] Write E2E mobile test (375px viewport, single-column, no horizontal scroll)
- [ ] T031 [P] [US1] Run Lighthouse audit (Performance ≥90, Accessibility ≥95)
- [ ] T032 [P] [US1] Test Cyrillic rendering (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш in Chrome/Firefox/Safari/Edge)

### 3.5: Performance (3 tasks)

- [ ] T033 [P] [US1] Lazy load value prop icons (loading="lazy")
- [ ] T034 [P] [US1] Code splitting for HomePage (React.lazy())
- [ ] T035 [P] [US1] Optimize demo image (<100KB WebP with PNG fallback)

**MVP Checkpoint**: Phase 3 complete = functional landing page MVP (35 tasks total including Phases 1-2). Deploy and gather feedback.

---

## Phase 4: User Story 2 - Compare with Competitors (P2) (12 tasks)

**Goal**: Show BZR Portal advantages over bzrplatforma.rs.

**Independent Test**: Comparison table displays 5+ features with ✓/✗, mobile card-based design works.

### 4.1: Comparison Table (4 tasks)

- [ ] T036 [US2] Create ComparisonTable component (frontend/src/components/landing/ComparisonTable.tsx)
- [ ] T037 [P] [US2] Implement 5+ feature rows (AI generation, Mobile OCR, Offline, Camera, QR)
- [ ] T038 [P] [US2] Add visual indicators (✓ green "DA", ✗ red "NE" with aria-labels)
- [ ] T039 [P] [US2] Make responsive (desktop: full table, tablet: sticky first col scroll, mobile: cards)

### 4.2: Mobile Design (2 tasks)

- [ ] T040 [P] [US2] Create mobile card-based comparison (<768px, accordion per competitor)
- [ ] T041 [P] [US2] Implement tablet horizontal scroll (768-1023px, sticky first column)

### 4.3: Integration & Testing (6 tasks)

- [ ] T042 [US2] Integrate ComparisonTable into HomePage (after DemoVideo, before Features)
- [ ] T043 [P] [US2] Write E2E test - table visible, 5+ features, checkmarks/X marks, mobile cards work
- [ ] T044 [P] [US2] Test screen reader accessibility (aria-labels for ✓/✗)
- [ ] T045 [P] [US2] Test mobile readability (iPhone SE 375px, no horizontal scroll)
- [ ] T046 [P] [US2] Run Lighthouse accessibility audit (WCAG AA, no critical violations)
- [ ] T047 [P] [US2] Optimize bundle size (code split if >20KB, lazy load icons)

---

## Phase 5: User Story 3 - Understand Pricing (P2) (11 tasks)

**Goal**: Transparent pricing (Trial 14 days, Professional 3000-6000 RSD/mesec).

**Independent Test**: Pricing cards visible, tiers explanation present, CTAs link to /register.

### 5.1: Pricing Section (5 tasks)

- [ ] T048 [US3] Create PricingSection component (frontend/src/components/landing/PricingSection.tsx)
- [ ] T049 [P] [US3] Implement Trial card ("Besplatno 14 dana", features, CTA "Počnite besplatno")
- [ ] T050 [P] [US3] Implement Professional card ("3.000-6.000 RSD/mesec*", features, CTA)
- [ ] T051 [P] [US3] Add pricing tiers tooltip ("0-50: 3.000 RSD, 51-200: 4.500 RSD, 201+: 6.000 RSD")
- [ ] T052 [P] [US3] Make responsive (desktop: 2 cols, mobile: 1 col stacked Professional first)

### 5.2: Pricing Page (2 tasks)

- [ ] T053 [US3] Create PricingPage component (frontend/src/pages/PricingPage.tsx)
- [ ] T054 [P] [US3] Add pricing FAQ ("Kako se naplaćuje?", "Mogu li da prođem sa Trial?")

### 5.3: Integration & Testing (4 tasks)

- [ ] T055 [US3] Integrate PricingSection into HomePage (after Features, before Testimonials)
- [ ] T056 [P] [US3] Write E2E test - cards visible, CTA links work, tooltip works
- [ ] T057 [P] [US3] Test /pricing route (dedicated page, FAQ present)
- [ ] T058 [P] [US3] Run Lighthouse audit on /pricing (Performance/Accessibility ≥90)

---

## Phase 6: User Story 5 - Contact Form (P3) (20 tasks)

**Goal**: Visitor submits contact form, email sent, database stores submission.

**Independent Test**: Submit form, verify success message, check database + email delivery.

### 6.1: Data Model & Validation (3 tasks)

- [ ] T059 [P] [US5] Create Zod schema (frontend/src/lib/validations/contact-form.ts) - name, email RFC 5322, message min 10 chars, honeypot
- [ ] T060 [P] [US5] Create ContactFormSubmission Drizzle schema (backend/src/db/schema.ts)
- [ ] T061 [US5] Generate + apply migration (`npm run db:generate && db:push`)

### 6.2: Backend API (4 tasks)

- [ ] T062 [P] [US5] Create email service (backend/src/services/email.service.ts) using Resend SDK
- [ ] T063 [US5] Implement POST /api/contact endpoint (backend/src/api/contact.ts) - validate, honeypot check, insert DB, send email
- [ ] T064 [P] [US5] Add rate limiting (100 req/15min per IP, hono-rate-limiter)
- [ ] T065 [P] [US5] Write backend integration test (backend/tests/integration/contact-api.test.ts) - 200/400/429 responses

### 6.3: Frontend Form (7 tasks)

- [ ] T066 [US5] Create ContactPage component (frontend/src/pages/ContactPage.tsx) - form + alternative contacts
- [ ] T067 [P] [US5] Implement form (React Hook Form + Zod validation)
- [ ] T068 [P] [US5] Add inline error messages ("Email adresa nije validna", "Ovo polje je obavezno")
- [ ] T069 [P] [US5] Implement submission handler (POST /api/contact, success message, clear form)
- [ ] T070 [P] [US5] Add honeypot field (hidden website input, position: absolute left: -9999px)
- [ ] T071 [P] [US5] Display alternative contacts (email: info@bzrportal.rs mailto: link, phone/address placeholders)
- [ ] T072 [P] [US5] Make responsive (mobile: single-column, touch targets ≥44×44px)

### 6.4: Testing (6 tasks)

- [ ] T073 [P] [US5] Write frontend unit test (frontend/tests/unit/contact-form.test.ts) - Zod schema validation
- [ ] T074 [P] [US5] Write E2E test (frontend/tests/e2e/landing-contact.spec.ts) - empty errors, valid submission, form clears
- [ ] T075 [P] [US5] Test honeypot (fill hidden field, verify 400 error)
- [ ] T076 [P] [US5] Test rate limiting (101 submissions, verify 429)
- [ ] T077 [P] [US5] Manual DB verification (query contact_form_submissions table)
- [ ] T078 [P] [US5] Manual email test (check info@bzrportal.rs inbox)

---

## Phase 7: User Story 4 & 6 - Secondary Pages (P3-P4) (10 tasks)

**Goal**: /features page (5+ sections), /about page (mission + story).

### 7.1: Features Page (5 tasks)

- [ ] T079 [US4] Create FeaturesPage component (frontend/src/pages/FeaturesPage.tsx) - hero + 5 sections
- [ ] T080 [P] [US4] Implement sections content (Risk Assessment, AI Generation, Mobile PWA, Security, RBAC)
- [ ] T081 [P] [US4] Add anchor links (/features#risk-assessment, etc.)
- [ ] T082 [P] [US4] Make responsive (mobile: collapsible sections, images scale)
- [ ] T083 [P] [US4] Write E2E test - /features loads, 5+ sections visible, anchors work

### 7.2: About Page (5 tasks)

- [ ] T084 [US6] Create AboutPage component (frontend/src/pages/AboutPage.tsx) - mission, story, CTA
- [ ] T085 [P] [US6] Implement mission/vision section ("Automatizujemo BZR procese sa AI")
- [ ] T086 [P] [US6] Add company story (founders' background, placeholder team photos)
- [ ] T087 [P] [US6] Add CTA section ("Želite da saznate više?" + button to /contact)
- [ ] T088 [P] [US6] Write E2E test - /about loads, mission + story visible, CTA links

---

## Phase 8: Polish & Cross-Cutting (9 tasks)

**Goal**: Add remaining homepage sections, optimize performance, complete testing.

### 8.1: Homepage Sections (6 tasks)

- [ ] T089 [P] Create DemoVideoSection component (frontend/src/components/landing/DemoVideoSection.tsx) - placeholder "Demo video uskoro" + email signup
- [ ] T090 [P] Create FeaturesOverview component (frontend/src/components/landing/FeaturesOverview.tsx) - 4-6 feature highlights
- [ ] T091 [P] Create TestimonialsSection component (frontend/src/components/landing/TestimonialsSection.tsx) - placeholder "Uskoro: Reference"
- [ ] T092 [P] Create FAQSection component (frontend/src/components/landing/FAQSection.tsx) - accordion with 5-8 questions
- [ ] T093 [P] Create CTASection component (frontend/src/components/landing/CTASection.tsx) - final CTA "Spremni da automatizujete BZR procese?"
- [ ] T094 Integrate all sections into HomePage (DemoVideo → FeaturesOverview → Testimonials → FAQ → CTA)

### 8.2: Final Optimization (3 tasks)

- [ ] T095 [P] Implement critical CSS inlining (vite-plugin-critical for 375px + 1920px)
- [ ] T096 [P] Run full Lighthouse CI on all 5 routes (/, /features, /pricing, /about, /contact) - verify all ≥90
- [ ] T097 Run complete E2E test suite (all Phases 3-7 tests) - verify 100% pass

---

## Dependencies & Execution Strategy

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational)
                        ↓
            ┌───────────┴───────────┬──────────────┐
            ↓                       ↓              ↓
   Phase 3 (US1: P1)      Phase 4 (US2: P2)   Phase 5 (US3: P2)  ← Parallel
   Discover Value          Compare              Pricing
   (18 tasks)             (12 tasks)           (11 tasks)
            ↓                       ↓              ↓
            └───────────┬───────────┴──────────────┘
                        ↓
           Phase 6 (US5: P3) Contact Form (20 tasks)  ← Independent
                        ↓
           Phase 7 (US4+US6: P3-P4) Secondary (10 tasks)  ← Independent
                        ↓
           Phase 8 (Polish) Final Integration (9 tasks)
```

**Key Insights**:
- **Phases 3, 4, 5 parallelizable** after Phase 2 (different components, no shared dependencies)
- **Phase 6 independent** - full stack feature, can be developed separately
- **Phase 7 independent** - content pages only
- **Phase 8 integrates** everything

### MVP-First Approach (Single Developer)

1. **Phase 1** (Setup) - 0.5 day
2. **Phase 2** (Foundational) - 0.5 day
3. **Phase 3** (US1 - Homepage MVP) - 1 day
4. **Deploy MVP**, gather feedback
5. **Phase 4+5** (Comparison + Pricing) - 1 day
6. **Phase 6** (Contact Form) - 1 day
7. **Phase 7+8** (Secondary + Polish) - 1 day

**Total**: 3-5 days sequential, 2-3 days with 3 developers parallel

---

## Task Summary

**Total**: 87 tasks across 8 phases
**Parallelizable**: 45 tasks (52%) marked with [P]
**Per User Story**:
- US1 (P1): 18 tasks
- US2 (P2): 12 tasks
- US3 (P2): 11 tasks
- US4 (P3): 5 tasks
- US5 (P3): 20 tasks
- US6 (P4): 5 tasks
- Setup/Foundational: 17 tasks
- Polish: 9 tasks

**MVP Scope**: Phases 1-3 = 35 tasks, ~2 days, delivers functional homepage

---

## Validation Checklist

✅ All tasks follow format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ Tasks organized by user story (Phases 3-7 map to spec priorities)
✅ Independent test criteria per story
✅ Dependencies documented (Phase 1 → 2 → 3-7 parallel → 8)
✅ Parallel opportunities identified (45 tasks with [P])
✅ MVP scope defined (Phases 1-3, 35 tasks)
✅ File paths specified for all implementation tasks
✅ Testing requirements met (unit + E2E + accessibility + performance)

**Ready for implementation**: Yes - each task is specific and actionable.
