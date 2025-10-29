# Implementation Plan: BZR Portal Landing Page & Marketing Site

**Branch**: `main` | **Date**: 2025-01-28 | **Spec**: [001-landing-page/spec.md](../001-landing-page/spec.md)
**Input**: Feature specification from `/specs/001-landing-page/spec.md`

## Summary

Create public-facing marketing website with 5 routes (/, /features, /pricing, /about, /contact) to communicate BZR Portal's AI-first + mobile-first value proposition, differentiate from competitors (bzrplatforma.rs), and convert visitors to trial signups. Primary technical approach: React 18 + Vite frontend with shadcn/ui components, mobile-first responsive design (375px-1920px), WCAG AA accessibility, Serbian Cyrillic content, Lighthouse performance optimization (≥90 scores). Single backend API endpoint for contact form submission (POST /api/contact) with Resend email integration and PostgreSQL storage.

**Key Success Metrics**: <3 second page load (95% of visitors), 10%+ conversion to trial signups within 30 days, Lighthouse Performance/Accessibility/SEO all ≥90, zero critical accessibility violations.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode), Node.js 20+
**Primary Dependencies**:
- Frontend: React 18, Vite, shadcn/ui, Tailwind CSS, React Hook Form, Zod, React Router
- Backend: Hono (API framework), Drizzle ORM, Resend (email service)
**Storage**: PostgreSQL (Supabase) for ContactFormSubmission entity
**Testing**: Vitest (unit), Playwright (E2E), Lighthouse CI (performance)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge), mobile-first responsive (375px-1920px)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <3 seconds page load on 4G (target 1.5s), Lighthouse Performance ≥90, First Contentful Paint <1.5s, Time to Interactive <3s
**Constraints**:
- Mobile-first responsive design (375px iPhone SE minimum)
- WCAG AA compliance (4.5:1 contrast, keyboard nav, screen reader support, 44×44px touch targets)
- Serbian Cyrillic (sr-Cyrl-RS) UTF-8 encoding for all content
- SEO-optimized (meta tags, structured data, sitemap, server-rendered HTML)
- Demo video optimization (max 5MB hero, max 15MB detailed)
**Scale/Scope**: Public marketing site, expect 1000+ daily visitors post-launch, 10%+ conversion to trial signups (100+ signups/day target)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Legal Compliance First (NON-NEGOTIABLE)

- [x] **N/A for landing page** - Feature does not generate BZR documents or handle risk assessment logic
- [x] **Legal links placeholder** - Footer includes Privacy Policy and Terms of Service placeholder links (FR-003) to be completed before public launch

### ✅ Principle II: Test-Driven Development (NON-NEGOTIABLE)

- [x] **Unit tests required** - Contact form validation logic (email format, required fields) must have Vitest unit tests
- [x] **E2E tests required** - Playwright E2E tests for critical flows: homepage load → scroll to CTA → click "Počnite besplatno" → redirect to /register
- [x] **Accessibility tests required** - Automated axe DevTools checks for WCAG violations on all 5 routes
- [x] **Performance tests required** - Lighthouse CI checks for Performance/Accessibility/Best Practices/SEO ≥90 scores
- [x] **80%+ coverage target** - Business logic (form validation, email submission) must reach 80%+ coverage

### ✅ Principle III: Security by Design (NON-NEGOTIABLE)

- [x] **Public routes** - All landing pages (/, /features, /pricing, /about, /contact) accessible without authentication (FR-001)
- [x] **Input validation** - Contact form uses Zod schemas for email format (RFC 5322), required fields validation (FR-052)
- [x] **Rate limiting** - Contact form endpoint protected by rate limiting (100 requests/minute per IP) to prevent spam
- [x] **No sensitive data** - ContactFormSubmission entity contains no JMBG, passwords, or company confidential data
- [x] **CSRF protection** - Contact form submission includes CSRF token or uses SameSite cookies

### ✅ Principle IV: Serbian Language Priority

- [x] **Serbian Cyrillic** - All text content in Serbian Cyrillic (sr-Cyrl-RS) per FR-059
- [x] **UTF-8 encoding** - All pages use UTF-8 encoding to support special characters (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш)
- [x] **Error messages** - Contact form validation errors in Serbian Cyrillic ("Email adresa nije validna", "Ovo polje je obavezno") per FR-052
- [x] **SEO meta tags** - All meta tags (`<title>`, `<meta name="description">`, Open Graph tags) in Serbian Cyrillic per FR-066

### ✅ Principle V: Accessibility Standards

- [x] **WCAG AA compliance** - 4.5:1 contrast ratio (FR-061), keyboard navigation (Tab/Shift+Tab/Enter/Escape per FR-064), screen reader support (alt text per FR-062, aria-labels per edge cases)
- [x] **Touch targets** - Minimum 44×44px for buttons/links on mobile (FR-060)
- [x] **Form labels** - All form inputs have associated `<label>` elements with `for` attribute (FR-063)
- [x] **Comparison table accessibility** - Checkmarks (✓) and X marks (✗) have `aria-label` attributes (Edge Cases)
- [x] **200% zoom support** - No horizontal scrolling or text overlap at 200% zoom (Edge Cases)

### ✅ Principle VI: Multi-Tenancy Isolation

- [x] **N/A for landing page** - ContactFormSubmission entity has no company_id (public form, not tenant-specific)
- [x] **No RLS required** - Contact form submissions viewable by admin role only via future admin panel

### ✅ Principle VII: AI-First & Mobile-First Experience (DIFFERENTIATOR)

- [x] **AI-first messaging** - Hero section emphasizes "10x brže sa AI" (FR-006), value prop card explains AI automation (FR-013)
- [x] **Mobile-first design** - Responsive breakpoints 375px-1920px (FR-057), touch-optimized (44×44px targets per FR-060), single-column mobile layout (User Story 1 acceptance scenario)
- [x] **Competitive positioning** - Comparison table highlights AI generation, mobile OCR, offline mode, camera integration, QR codes vs bzrplatforma.rs (FR-020 to FR-024)
- [x] **Demo video** - Hero section displays OCR scanning workflow video/GIF (FR-008) or placeholder (FR-009)
- [x] **Landing page requirements met** - Hero with demo (FR-008), value props emphasize "10x faster" + "Work from phone" (FR-013, FR-014), comparison table present (FR-020)

**Gate Status**: ✅ **PASS** - All constitution principles satisfied. No violations require justification.

## Project Structure

### Documentation (this feature)

```
specs/001-landing-page/
├── spec.md                  # Feature specification (completed)
├── plan.md                  # This file (current)
├── research.md              # Phase 0 output (pending)
├── data-model.md            # Phase 1 output (pending)
├── contracts/               # Phase 1 output (pending)
│   └── contact-api.yaml     # OpenAPI spec for POST /api/contact endpoint
├── quickstart.md            # Phase 1 output (pending)
└── checklists/
    └── requirements.md      # Spec quality checklist (completed)
```

### Source Code (repository root)

```
frontend/
├── src/
│   ├── pages/               # Landing page routes (NEW)
│   │   ├── HomePage.tsx              # / route (hero, value props, comparison, pricing, FAQ, CTA)
│   │   ├── FeaturesPage.tsx          # /features route (detailed feature sections)
│   │   ├── PricingPage.tsx           # /pricing route (pricing cards + FAQ)
│   │   ├── AboutPage.tsx             # /about route (mission, story, team)
│   │   ├── ContactPage.tsx           # /contact route (contact form)
│   │   └── NotFoundPage.tsx          # 404 error page (Serbian Cyrillic)
│   ├── components/          # Reusable UI components (NEW)
│   │   ├── landing/                  # Landing-specific components
│   │   │   ├── HeroSection.tsx       # Hero with demo video + CTAs
│   │   │   ├── ValuePropsSection.tsx # 3 value prop cards (AI, Mobile, Legal)
│   │   │   ├── DemoVideoSection.tsx  # Detailed demo video or placeholder
│   │   │   ├── ComparisonTable.tsx   # Feature comparison table
│   │   │   ├── FeaturesOverview.tsx  # 4-6 feature highlights
│   │   │   ├── PricingSection.tsx    # Trial + Professional pricing cards
│   │   │   ├── TestimonialsSection.tsx # Customer testimonials or placeholder
│   │   │   ├── FAQSection.tsx        # Accordion FAQ list
│   │   │   └── CTASection.tsx        # Final call-to-action
│   │   ├── layout/                   # Layout components
│   │   │   ├── LandingNav.tsx        # Navigation header (logo, links, CTA button)
│   │   │   ├── LandingFooter.tsx     # Footer (quick links, legal, social, copyright)
│   │   │   └── MobileMenu.tsx        # Hamburger menu drawer for mobile
│   │   └── ui/                       # shadcn/ui components (existing)
│   │       ├── button.tsx            # Button component (existing)
│   │       ├── card.tsx              # Card component (existing)
│   │       ├── accordion.tsx         # Accordion component (existing or NEW)
│   │       ├── input.tsx             # Input component (existing)
│   │       ├── textarea.tsx          # Textarea component (existing)
│   │       └── label.tsx             # Label component (existing)
│   ├── lib/                 # Utilities
│   │   ├── i18n/                     # Serbian Cyrillic content (NEW)
│   │   │   └── landing-content-sr.ts # All landing page text content
│   │   └── validations/              # Zod schemas (NEW)
│   │       └── contact-form.ts       # Contact form validation schema
│   └── App.tsx              # Root component with React Router (UPDATE: add landing routes)
└── tests/
    ├── e2e/                 # Playwright E2E tests (NEW)
    │   ├── landing-homepage.spec.ts   # Homepage critical flows
    │   ├── landing-contact.spec.ts    # Contact form submission
    │   └── landing-navigation.spec.ts # Navigation + mobile menu
    └── unit/                # Vitest unit tests (NEW)
        └── contact-form.test.ts       # Form validation logic

backend/
├── src/
│   ├── api/
│   │   └── contact.ts       # POST /api/contact endpoint (NEW)
│   ├── services/
│   │   └── email.service.ts # Resend email sending (NEW or UPDATE existing)
│   └── db/
│       └── schema.ts        # ContactFormSubmission entity (UPDATE)
└── tests/
    └── integration/
        └── contact-api.test.ts # Contact endpoint tests (NEW)
```

**Structure Decision**: Existing **Option 2: Web application** structure (frontend/ + backend/) confirmed. Landing pages added to frontend/src/pages/ with dedicated component directory frontend/src/components/landing/. Single backend endpoint POST /api/contact added to backend/src/api/contact.ts.

## Complexity Tracking

*No constitution violations - section not required.*

## Phase 0: Outline & Research

**Objective**: Resolve unknowns, research best practices, document design decisions.

### Research Tasks

#### R001: Serbian Cyrillic Font Selection & Rendering

**Question**: Which web fonts support full Serbian Cyrillic character set (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш) and render correctly across browsers (Chrome, Firefox, Safari, Edge)?

**Options to research**:
1. Google Fonts with Serbian Cyrillic support (Roboto, Open Sans, Noto Sans)
2. System fonts (Arial, Times New Roman with Cyrillic fallback)
3. Custom web fonts optimized for Serbian

**Decision criteria**: Font file size (<50KB for performance), character coverage (all Serbian Cyrillic glyphs), license (free for commercial use), browser compatibility.

**Output**: Document chosen font stack, fallback chain, and verification testing approach.

---

#### R002: Demo Video Hosting & Optimization

**Question**: Where to host demo video (hero section max 5MB, detailed video max 15MB) for optimal performance and cost?

**Options to research**:
1. Wasabi S3 bucket (existing infrastructure) with CloudFlare CDN
2. Vimeo/YouTube embed (free tier, third-party dependency)
3. Vercel Blob storage (paid after free tier)
4. Self-hosted on Vercel with adaptive streaming

**Decision criteria**: Cost (<$10/month for MVP), bandwidth limits (1000+ visitors/day), video optimization support (adaptive bitrate, multiple resolutions), ease of integration with React.

**Output**: Document chosen hosting solution, video encoding settings (H.264 vs VP9), and fallback strategy for slow connections (3G).

---

#### R003: Contact Form Spam Prevention

**Question**: How to prevent spam submissions on public /contact form without frustrating legitimate users?

**Options to research**:
1. Honeypot field (hidden input field to trap bots)
2. Rate limiting (100 requests/minute per IP via Hono middleware)
3. reCAPTCHA v3 (invisible, score-based, Google dependency)
4. Turnstile (Cloudflare alternative to reCAPTCHA)
5. Email verification (send confirmation link before storing submission)

**Decision criteria**: User friction (invisible vs visible challenge), cost (free tier limits), privacy (GDPR compliance), implementation complexity.

**Output**: Document chosen spam prevention method(s), implementation approach, and fallback for false positives.

---

#### R004: SEO Pre-rendering Strategy

**Question**: How to ensure landing pages are crawlable by search engines (FR-068) despite being React SPA?

**Options to research**:
1. Vite SSR plugin (server-side rendering on Vercel)
2. Vite prerender plugin (static HTML generation at build time)
3. React Snap (post-build pre-rendering tool)
4. Next.js migration (significant architecture change - likely rejected)

**Decision criteria**: Vercel compatibility, build time impact (<5 minutes), SEO effectiveness (Google Search Console indexing verification), maintenance complexity.

**Output**: Document chosen pre-rendering approach, configuration steps, and verification testing plan (Google Search Console).

---

#### R005: Responsive Table Design Pattern

**Question**: How to make comparison table (FR-020 to FR-024) readable on mobile (375px) without horizontal scrolling?

**Options to research**:
1. Horizontal scroll with sticky first column
2. Card-based design (one competitor per card with accordion)
3. Transpose table (rows become columns on mobile)
4. Progressive disclosure (show 2 columns on mobile, expand to full table)

**Decision criteria**: User testing feedback (readability on iPhone SE), accessibility (screen reader support), implementation complexity, Tailwind CSS patterns.

**Output**: Document chosen responsive pattern, Tailwind breakpoint strategy, and accessibility considerations (aria-labels for table structure).

---

#### R006: Lighthouse Performance Optimization

**Question**: How to achieve Lighthouse Performance ≥90 (FR-065) with demo video, images, and multiple sections?

**Options to research**:
1. Lazy loading images (react-lazy-load-image-component or Intersection Observer API)
2. Code splitting (React.lazy() for routes + components)
3. Font optimization (font-display: swap, preload critical fonts)
4. Critical CSS inlining (above-the-fold styles)
5. Video poster image (lightweight placeholder before video loads)

**Decision criteria**: Performance impact (Lighthouse score improvement), implementation effort, browser compatibility.

**Output**: Document optimization checklist, Vite build configuration, and performance testing plan (Lighthouse CI in GitHub Actions).

---

### Research Deliverable: `research.md`

Format:
```markdown
# Landing Page Research & Design Decisions

## R001: Serbian Cyrillic Font Selection

**Decision**: Google Fonts - Noto Sans (regular + bold) with system font fallback
**Rationale**: [explain choice]
**Alternatives considered**: [rejected options]

[... repeat for R002-R006 ...]
```

## Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

### Task 1.1: Data Model Design

**Input**: Key Entities section from spec.md
**Output**: `data-model.md`

**Entities**:

1. **ContactFormSubmission** (NEW)
   - Fields: id (UUID), name (TEXT NOT NULL), email (VARCHAR(255) NOT NULL), company_name (VARCHAR(255) NULLABLE), message (TEXT NOT NULL), submitted_at (TIMESTAMP DEFAULT NOW()), status (ENUM: 'new', 'read', 'replied' DEFAULT 'new')
   - Indexes: INDEX on submitted_at DESC (for admin panel sorting), INDEX on status (for filtering new submissions)
   - Validation: email format RFC 5322, message min 10 characters, name/email required
   - Relationships: None (standalone entity, no foreign keys)

2. **User** (EXISTING - reference only for CTA buttons linking to /register)

3. **Company** (EXISTING - reference only for pricing tier logic)

**Drizzle ORM Schema** (backend/src/db/schema.ts addition):
```typescript
export const contactFormSubmissions = pgTable('contact_form_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }),
  message: text('message').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  status: varchar('status', { enum: ['new', 'read', 'replied'] }).default('new').notNull(),
});
```

---

### Task 1.2: API Contracts

**Input**: Functional Requirements (FR-051 to FR-056) from spec.md
**Output**: `contracts/contact-api.yaml` (OpenAPI 3.0 spec)

**Endpoint**: POST /api/contact

**Request**:
```yaml
openapi: 3.0.0
info:
  title: BZR Portal Landing Page API
  version: 1.0.0
paths:
  /api/contact:
    post:
      summary: Submit contact form
      description: Validates input, sends email to support team, stores submission in database
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, email, message]
              properties:
                name:
                  type: string
                  minLength: 1
                  example: "Marko Marković"
                email:
                  type: string
                  format: email
                  example: "marko@example.rs"
                companyName:
                  type: string
                  nullable: true
                  example: "Primer DOO"
                message:
                  type: string
                  minLength: 10
                  example: "Zanima me više informacija o vašoj platformi."
      responses:
        200:
          description: Contact form submitted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Poruka je poslata. Odgovorićemo u roku od 24 sata."
        400:
          description: Validation error
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  error:
                    type: string
                    example: "Email adresa nije validna"
        429:
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  error:
                    type: string
                    example: "Previše zahteva. Pokušajte ponovo za 1 minut."
        500:
          description: Server error
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  error:
                    type: string
                    example: "Greška pri slanju poruke. Pokušajte ponovo."
```

**Email Notification** (sent via Resend):
- To: info@bzrportal.rs (or support@bzrportal.rs)
- From: noreply@bzrportal.rs
- Subject: "Nova poruka sa kontakt forme - {name}"
- Body (plain text):
  ```
  Ime: {name}
  Email: {email}
  Kompanija: {companyName || 'Nije navedeno'}

  Poruka:
  {message}

  ---
  Poslato: {submittedAt}
  ID: {id}
  ```

---

### Task 1.3: Quickstart Guide

**Input**: User scenarios from spec.md
**Output**: `quickstart.md`

**Format**:
```markdown
# Landing Page Quickstart Guide

## Setup

1. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Run database migration (ContactFormSubmission table):
   ```bash
   cd backend && npm run db:generate && npm run db:push
   ```

3. Configure environment variables (backend/.env):
   ```
   RESEND_API_KEY=re_...  # Resend API key for email sending
   SUPPORT_EMAIL=info@bzrportal.rs  # Email address for contact form notifications
   ```

4. Start development servers:
   ```bash
   # Terminal 1 (frontend)
   cd frontend && npm run dev
   # Runs on http://localhost:5173

   # Terminal 2 (backend)
   cd backend && npm run dev
   # Runs on http://localhost:3000
   ```

## Testing

### Manual Testing

1. Homepage (http://localhost:5173/):
   - Verify hero section displays placeholder image (demo video not ready for MVP)
   - Scroll through all sections (value props, comparison table, pricing, FAQ)
   - Click "Počnite besplatno" CTA → redirects to /register
   - Test mobile view (Chrome DevTools, iPhone SE 375px)

2. Contact Form (http://localhost:5173/contact):
   - Submit empty form → validation errors in Serbian Cyrillic
   - Submit invalid email → "Email adresa nije validna"
   - Submit valid form → success message + email sent to support team
   - Check backend logs for Resend API response
   - Verify database entry: `SELECT * FROM contact_form_submissions ORDER BY submitted_at DESC LIMIT 1;`

### Automated Testing

1. Unit tests:
   ```bash
   cd frontend && npm test  # Vitest unit tests (form validation)
   cd backend && npm test   # Vitest integration tests (contact API)
   ```

2. E2E tests:
   ```bash
   cd frontend && npx playwright test  # Run E2E tests
   npx playwright test --ui  # Debug mode with UI
   ```

3. Lighthouse CI:
   ```bash
   npm run build && npx lhci autorun  # Performance + accessibility checks
   ```

## Deployment

1. Build frontend:
   ```bash
   cd frontend && npm run build
   # Output: frontend/dist/
   ```

2. Deploy to Vercel:
   - Push to main branch → automatic Vercel deployment
   - Verify landing pages: https://bzr-portal1bre.vercel.app/

3. Verify production:
   - Test all 5 routes (/, /features, /pricing, /about, /contact)
   - Submit contact form → verify email delivery
   - Run Lighthouse audit on production URL
```

---

### Task 1.4: Update Agent Context

**Action**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`

**Expected Updates to CLAUDE.md**:
- Add "Landing Page Components" to project structure
- Add `npm run test:e2e` command for Playwright tests
- Add Serbian Cyrillic font handling note
- Document Lighthouse CI integration for performance testing

## Next Steps

After completing Phase 0 (Research) and Phase 1 (Design & Contracts):

1. **Review generated artifacts** (research.md, data-model.md, contracts/, quickstart.md)
2. **Run Constitution Check again** to ensure no violations introduced during design
3. **Proceed to `/speckit.tasks`** to generate actionable task breakdown (tasks.md) from this plan

**Estimated Timeline**:
- Phase 0 (Research): 2-4 hours (font selection, video hosting, spam prevention, SEO, responsive table, performance)
- Phase 1 (Design & Contracts): 1-2 hours (data model, API spec, quickstart guide)
- Implementation (post-tasks generation): 3-5 days (frontend pages, components, backend endpoint, testing, deployment)

**Dependencies**:
- Demo video production (can proceed with placeholder image per FR-009)
- Brand assets (can proceed with placeholder logo + default Tailwind colors per Assumptions)
- Resend API key (required for contact form email sending - provision before testing)
- Legal pages content (Privacy Policy, Terms of Service - placeholder links for MVP per Assumptions)
