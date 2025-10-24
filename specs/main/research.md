# Research: BZR Portal Technical Decisions

**Feature**: BZR Portal - AI-Powered Risk Assessment Platform
**Date**: 2025-10-22 (Updated from 2025-10-21)
**Status**: Phase 0 Complete

## Purpose

This document resolves technical uncertainties identified during planning and provides rationale for technology choices, architectural patterns, and implementation approaches. Updated to reflect clarifications from `/speckit.clarify` session.

---

## 1. Testing Framework Selection

### Decision

**Unit Testing**: Vitest
**E2E Testing**: Playwright
**Component Testing**: Vitest + React Testing Library

### Rationale

**Vitest**:
- Native ESM support, crucial for modern TypeScript/Vite/Next.js projects
- 10-20x faster than Jest for TypeScript projects due to esbuild transpilation
- Built-in TypeScript support without additional configuration
- Compatible with Jest API (minimal migration burden)
- Excellent watch mode for TDD workflow
- Native mocking capabilities for Drizzle ORM and API endpoints

**Playwright**:
- Best-in-class cross-browser E2E testing (Chromium, Firefox, WebKit)
- Vercel deployment testing support (can test preview deployments)
- Codegen feature for rapid test authoring
- Built-in test retry and video recording for debugging
- Better stability than Cypress for multi-step workflows (document generation flows)

**React Testing Library**:
- Component testing philosophy aligned with user behavior ("test what users see")
- Excellent accessibility testing support (critical for FR-054 requirements)
- Works seamlessly with Vitest
- Strong community support with shadcn/ui components

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Jest** | Slower TypeScript compilation, requires additional configuration for ESM modules |
| **Cypress** | Less stable for long-running operations (document generation >60s), higher flakiness rate |
| **Selenium** | More complex setup, slower execution, less modern API than Playwright |

### Implementation Notes

- Target 80%+ code coverage per SC-010
- Critical paths for testing:
  - Risk calculation logic (E×P×F formula, validation)
  - Document generation (template rendering, Serbian Cyrillic encoding)
  - Authentication flow (JWT, trial account limits)
  - RLS policy enforcement (multi-tenancy isolation)

---

## 2. API Framework: Fastify vs Hono

### Decision (UPDATED 2025-10-22)

**Hono** (recommended for Vercel serverless deployment)

### Rationale

**Hono Advantages**:
- Designed for edge/serverless environments (Vercel, Cloudflare Workers)
- Ultra-lightweight (12KB vs Fastify 60KB) - critical for cold start performance
- Native TypeScript support with excellent type inference
- Middleware pattern compatible with Express/Fastify (easy learning curve)
- Built-in Vercel adapter
- Faster benchmarks for serverless cold starts (4x faster than Express, 2x faster than Fastify)

**Fastify Advantages** (if choosing Fastify instead):
- More mature ecosystem, larger plugin library
- Better for traditional Node.js server deployments
- Schema validation with Ajv built-in (though Zod can be used with both)

**Recommendation**: Use **Hono** for MVP given Vercel serverless deployment (AS-006 from spec.md clarifications). Hono's edge-first design reduces cold start latency, critical for document generation endpoints.

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Express** | Outdated architecture, poor TypeScript support, slower than modern alternatives |
| **NestJS** | Over-engineered for MVP, heavy runtime overhead for serverless functions |
| **tRPC** | Requires tight frontend/backend coupling, less flexibility for mobile apps (future) |

---

## 3. Frontend Framework: Next.js Configuration

### Decision (UPDATED 2025-10-22)

**Next.js 14+ (App Router)** with React 18

### Rationale

- **Vercel-first**: Native integration with deployment platform (per clarifications, Vercel chosen)
- **App Router**: Server Components reduce client bundle size (critical for performance)
- **API Routes**: Can handle auth endpoints without separate backend deployment
- **Static Generation**: Spec pages, marketing content pre-rendered for speed
- **Middleware**: Edge middleware for JWT validation, RLS context injection
- **Serverless Functions**: Deploy backend API as Next.js API routes on Vercel

**Configuration**:
```typescript
// next.config.js
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverActions: true, // For form submissions
  },
  i18n: {
    locales: ['sr-Cyrl'], // Serbian Cyrillic
    defaultLocale: 'sr-Cyrl',
  },
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Vite + React Router** | Requires separate backend deployment, no SSR benefits, more complex Vercel setup |
| **Remix** | Less mature Vercel integration, steeper learning curve for team |
| **SvelteKit** | Smaller ecosystem, React preferred per CLAUDE.md technology stack |

---

## 4. Database: PostgreSQL Provider Selection

### Decision (UPDATED 2025-10-22)

**Neon** (recommended) or **Vercel Postgres** (alternative)

**Architecture**: Single shared PostgreSQL database with company_id-based row-level security (RLS) for all tenants (per clarifications Q1)

### Rationale

**Neon**:
- **Serverless-native**: Pay-per-use pricing, auto-scale to zero (cost-effective for MVP)
- **Branching**: Database branching for dev/staging environments (matches git workflow)
- **Connection pooling**: Built-in pgbouncer, critical for Vercel serverless (FR-052c)
- **Storage efficiency**: 8TB limit, adequate for 1000+ companies
- **Cost**: Free tier includes 10GB storage, 100 hours compute/month

**Vercel Postgres** (alternative):
- Tighter Vercel integration (simpler environment variables)
- Based on Neon infrastructure (same underlying tech)
- Higher pricing ($10/month minimum vs Neon free tier)

**Multi-Tenancy Implementation**:
```sql
-- Enable RLS on all tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY company_isolation ON companies
  FOR ALL USING (company_id = current_setting('app.current_company_id')::integer);

CREATE POLICY position_isolation ON work_positions
  FOR ALL USING (company_id = current_setting('app.current_company_id')::integer);
```

**Recommendation**: Use **Neon** for MVP due to free tier and database branching (valuable for testing migrations).

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Supabase** | Includes unnecessary features (auth, realtime, storage) that duplicate Vercel services |
| **PlanetScale** | MySQL-based, requires schema changes for RLS implementation (PostgreSQL native) |
| **AWS RDS** | Manual connection pooling required, higher operational complexity |
| **Separate databases per tenant** | Over-engineered for MVP; single DB with RLS adequate for 1000+ companies |

---

## 5. Document Storage: Vercel Blob vs Cloudflare R2

### Decision (UPDATED 2025-10-22)

**Vercel Blob** (primary), **Cloudflare R2** (fallback if cost-prohibitive)

Per clarifications Q5: Vercel chosen as deployment platform, so Vercel Blob is natural choice.

### Rationale

**Vercel Blob**:
- Native Vercel integration (simpler API, automatic CDN)
- Signed URL generation built-in (FR-050b requirement)
- $0.15/GB storage, $0.10/GB egress (competitive for MVP scale)
- Automatic HTTPS, compression, cache headers

**Cost Analysis (MVP scale)**:
- 10 companies × 20 documents/company × 2MB/doc = 400MB storage → $0.06/month
- 200 downloads/month × 2MB = 400MB egress → $0.04/month
- **Total: ~$0.10/month** (negligible for MVP)

**Cloudflare R2** (fallback):
- Zero egress fees (critical if downloads exceed expectations)
- Requires manual integration (S3-compatible API)
- $0.015/GB storage (10x cheaper than Vercel)
- **Use if**: Document downloads exceed 10GB/month egress

**Recommendation**: Start with **Vercel Blob** for simplicity. Monitor costs and migrate to R2 if egress >10GB/month.

### Implementation Notes

```typescript
// Example: Vercel Blob integration
import { put } from '@vercel/blob';

const blob = await put('documents/akt-123.docx', docxBuffer, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN,
});
// Returns: { url: 'https://...', downloadUrl: '...' }
```

---

## 6. Document Generation: Synchronous vs Asynchronous

### Decision (UPDATED 2025-10-22)

**Synchronous generation with real-time progress indicator**

Per clarifications Q2: User waits for generation (15-60s typical, up to 120s for large docs), sees progress bar, gets immediate download.

### Rationale

- **Simpler architecture**: No job queue infrastructure (BullMQ/Redis) needed for MVP
- **Better UX for expected duration**: Documents take 15-60s, users willing to wait with feedback
- **Immediate error handling**: User sees failures instantly, can retry immediately
- **Vercel Pro plan**: 60s function timeout adequate for multi-position documents (FR-052b)

**Implementation**:
```typescript
// Backend: Stream progress to frontend
export async function generateDocument(companyId, positionIds) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  writer.write({ progress: 0, status: 'Loading data...' });
  const data = await loadData(companyId, positionIds);

  writer.write({ progress: 30, status: 'Rendering template...' });
  const docx = await renderTemplate(data);

  writer.write({ progress: 80, status: 'Uploading document...' });
  const url = await uploadToBlob(docx);

  writer.write({ progress: 100, status: 'Complete!', url });
  return stream.readable;
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Async with job queue** | Over-engineered for MVP; requires Redis/BullMQ infrastructure |
| **Hybrid (sync <30s, async >30s)** | Most complex; requires size estimation logic; defer to post-MVP |

---

## 7. DOCX Generation Library

### Decision (UPDATED 2025-10-22)

**docx-templates** (Mustache-based templating)

Per clarifications Q3: Template-based approach chosen over programmatic generation.

### Rationale

**docx-templates Advantages**:
- **Visual template design**: Create template in Microsoft Word with proper Serbian Cyrillic formatting
- **Legal stakeholder review**: Non-developers can review/edit template without code changes
- **Mustache syntax**: Simple `{{variable}}` placeholders, `{{#loop}}...{{/loop}}` for tables
- **Preserves complex formatting**: Tables, section breaks, headers/footers, page numbers
- **Active maintenance**: Last updated 2024, good Cyrillic support

**Template Structure** (per FR-034 through FR-042):
```mustache
АКТ О ПРОЦЕНИ РИЗИКА

Послодавац: {{company.name}}
Адреса: {{company.address}}
ПИБ: {{company.pib}}

{{#positions}}
  Радно место: {{position_name}}
  Одељење: {{department}}

  {{#risks}}
    Опасност: {{hazard_code}} - {{hazard_name_sr}}
    Иницијални ризик: E={{E_initial}} P={{P_initial}} F={{F_initial}} Ri={{Ri}}
    Мере: {{corrective_measures}}
    Резидуал ризик: E={{E_residual}} P={{P_residual}} F={{F_residual}} R={{R}}
  {{/risks}}
{{/positions}}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **docx (programmatic)** | 1000+ LOC for template structure, hard to maintain legal formatting |
| **officegen** | Simpler API but less control over complex Serbian legal document structure |
| **docxtemplater** | Requires commercial license for table features (€100+/year) |

---

## 8. User Registration & Trial Accounts

### Decision (UPDATED 2025-10-22)

**Hybrid registration**: Self-registration creates trial account with limits, upgrade after verification call

Per clarifications Q4: Hybrid approach chosen (not open self-registration, not admin-only).

### Rationale

- **Low barrier to entry**: Users can start immediately without sales call
- **Qualify leads**: Trial limits (1 company, 3 positions, 5 documents, 14 days) prevent spam
- **Controlled upgrade**: Verification call ensures proper onboarding and compliance understanding
- **Growth-friendly**: Can scale to self-serve upgrade (Stripe checkout) post-MVP

**Trial Account Limits** (FR-028b):
```typescript
const TRIAL_LIMITS = {
  companies: 1,
  workPositions: 3,
  documentsGenerated: 5,
  durationDays: 14,
};

// Middleware: Check trial limits before expensive operations
export async function enforceTrialLimits(user, action) {
  if (user.accountTier === 'trial') {
    if (action === 'generateDocument' && user.documentCount >= TRIAL_LIMITS.documentsGenerated) {
      throw new Error('Trial limit reached. Contact support to upgrade.');
    }
  }
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Open self-registration** | High spam risk for B2B compliance software; no qualification |
| **Admin-invited only** | Slow onboarding; limits viral growth potential |

---

## 9. State Management: Zustand Configuration

### Decision

**Zustand** with persist middleware for auth state, ephemeral stores for UI state

### Rationale

- **Simplicity**: No boilerplate vs Redux (critical for MVP velocity)
- **Performance**: Selective re-renders, no Context Provider overhead
- **TypeScript**: Excellent type inference
- **Size**: 3KB vs Redux 20KB
- **DevTools**: Redux DevTools compatible for debugging

**Store Architecture**:
```typescript
// stores/auth.ts
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      accountTier: 'trial',
      login: (user, token) => set({ user, token, accountTier: user.accountTier }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' } // localStorage persistence
  )
);

// stores/company.ts (ephemeral)
export const useCompanyStore = create((set) => ({
  selectedCompanyId: null,
  setCompany: (id) => set({ selectedCompanyId: id }),
}));
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Redux Toolkit** | Over-engineered for this application scope, higher learning curve |
| **Jotai/Recoil** | Atom-based architecture less intuitive for centralized auth state |
| **React Context** | Performance issues for frequently updating state (risk calculations) |

---

## 10. Form Validation: Zod + React Hook Form

### Decision

**Zod** (schema validation) + **React Hook Form** (form state management)

### Rationale

**Zod**:
- **Type safety**: Infer TypeScript types from schemas (single source of truth)
- **Shared validation**: Same schemas used in frontend and backend (FR-016)
- **Serbian validation**: Custom refinements for PIB, JMBG checksums (FR-043)
- **Error messages**: Localization support for Serbian Cyrillic

**React Hook Form**:
- **Performance**: Uncontrolled inputs, minimal re-renders
- **Multi-step wizard**: Excellent support for complex form flows (FR-017)
- **Zod integration**: `@hookform/resolvers/zod` for seamless validation

**Example Schema**:
```typescript
// shared/schemas/company.ts
export const companySchema = z.object({
  name: z.string().min(3).max(255),
  pib: z.string().length(9).refine(validatePIBChecksum, {
    message: "PIB број није валидан. Проверите унос.",
  }),
  activity_code: z.string().length(4).regex(/^\d{4}$/),
});

export type Company = z.infer<typeof companySchema>;
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Yup** | Less type-safe, requires separate TypeScript types, slower performance |
| **Formik** | Controlled inputs (performance issues), less active maintenance |
| **Native validation** | No shared frontend/backend schemas, manual error handling |

---

## 11. Authentication: JWT Strategy

### Decision

**JWT** with short-lived access tokens (15min) + long-lived refresh tokens (7 days)

### Rationale

**Security**:
- Access token short TTL reduces exposure window
- Refresh tokens stored in HTTP-only cookies (XSS protection)
- Token rotation on refresh (prevents replay attacks)
- JWT payload includes: `{ userId, companyId, role, accountTier, trialExpiry }`

**Implementation**:
```typescript
// middleware/auth.ts
import { jwtVerify, SignJWT } from 'jose';

export async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}

// RLS context injection (FR-053c)
export async function setRLSContext(db, userId, companyId) {
  await db.execute(sql`
    SET LOCAL app.current_user_id = ${userId};
    SET LOCAL app.current_company_id = ${companyId};
  `);
}
```

**Trial Account Enforcement**:
- Middleware checks `accountTier` and `trialExpiry` from JWT
- Enforce limits before expensive operations (document generation)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Session-based** | Requires session store (Redis), incompatible with serverless edge deployment |
| **OAuth only** | Over-engineered for B2B SaaS, users expect email/password |
| **Magic links** | Poor UX for frequent login (BZR officers work daily) |

---

## 12. Serbian Cyrillic Handling

### Decision

**UTF-8** encoding throughout stack, **Cyrillic Serbian** (sr-Cyrl-RS) as primary locale

### Rationale

**DOCX Template**:
- Design in Word with Cyrillic text (АКТ О ПРОЦЕНИ РИЗИКА)
- Font: "Times New Roman" or "Calibri" (universal Cyrillic support)
- docx-templates preserves encoding when injecting data

**Database**:
- PostgreSQL: UTF-8 encoding (default, supports all Unicode)
- Collation: `sr_RS.UTF-8` for Serbian sort order

**Frontend**:
- HTML: `<html lang="sr-Cyrl-RS">`
- Meta charset: `<meta charset="UTF-8">`
- Input validation: Accept both Cyrillic and Latin input, store in Cyrillic

**Translation Files** (i18n):
```typescript
// i18n/sr-Cyrl.json
{
  "auth.login": "Пријава",
  "company.name": "Назив предузећа",
  "risk.high": "Повећан ризик",
  "error.pibInvalid": "ПИБ број није валидан. Проверите унос.",
}
```

### Implementation Notes

- Avoid hardcoded text in components (use i18n keys)
- Test document generation with special characters: Ђ, Ћ, Љ, Њ, Џ, Ж, Ш
- Ensure PIB/JMBG validation handles Cyrillic error messages

---

## 13. Error Handling Strategy

### Decision

**Structured error codes** + **Serbian error messages** + **Error ID tracking**

### Rationale

**Error Code System**:
```typescript
enum ErrorCode {
  // Authentication 1000-1999
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,

  // Validation 2000-2999
  INVALID_PIB = 2001,
  INVALID_JMBG = 2002,

  // Business Logic 3000-3999
  RESIDUAL_RISK_TOO_HIGH = 3001,
  TRIAL_LIMIT_EXCEEDED = 3002,

  // Document Generation 4000-4999
  TEMPLATE_ERROR = 4001,
  STORAGE_FAILED = 4002,
}
```

**Error Response Format**:
```typescript
{
  errorCode: 3001,
  message: "Резидуал ризик (R=120) мора бити мањи од иницијалног ризика (Ri=180).",
  errorId: "err_abc123xyz", // UUID for support tracking
  timestamp: "2025-10-22T10:30:00Z",
  path: "/api/risks/123",
}
```

**Logging** (FR-033 audit requirement):
- Structured logging (Pino or Winston)
- Log level: INFO (success operations), ERROR (failures)
- Include: userId, companyId, action, errorId, timestamp

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Generic HTTP codes only** | Poor debuggability, no support tracking |
| **English error messages** | Violates Serbian language requirement |
| **Unstructured errors** | Hard to parse for monitoring/alerting |

---

## 14. Performance Monitoring

### Decision (UPDATED 2025-10-22)

**Vercel Analytics** + **PostgreSQL slow query logging**

Per clarifications Q5: Vercel chosen as platform, so Vercel Analytics natural choice.

### Rationale

**Vercel Analytics**:
- Built-in (no setup required)
- Core Web Vitals tracking (LCP, FID, CLS per FR-052d)
- Serverless function duration/cold starts
- Free tier adequate for MVP (1000 events/month)

**Database Monitoring**:
- Neon: Built-in query performance dashboard
- Enable `log_min_duration_statement = 100ms` (flag slow queries)
- Monitor connection pool utilization (FR-052c: 20-50 connections)

**Custom Metrics** (if needed post-MVP):
- Document generation duration histogram
- Trial conversion rate funnel
- API error rate by endpoint

### Deferred to Post-MVP

- **Sentry** (error tracking) - only if error volume high
- **DataDog** (APM) - only if performance issues undiagnosed
- **PostHog** (product analytics) - only after 100+ users

---

## 15. AI Integration Strategy (Phase 2)

### Decision (DEFERRED to Phase 2)

**Direct Anthropic SDK** for hazard prediction and mitigation suggestions

Per User Story 4 (Priority P4), AI is "AI-powered differentiator but not essential for MVP."

### Rationale for Phase 2 Deferral

- **MVP focus**: Core document generation (User Story 1) validates business model first
- **Risk reduction**: Don't block MVP on AI quality validation
- **Manual workflow**: Users can select hazards manually (existing workflow)

**Phase 2 Implementation Plan**:
```typescript
// services/ai/hazard-predictor.ts
import Anthropic from '@anthropic-ai/sdk';

export async function predictHazards(jobDescription: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `
    You are Serbian occupational health & safety expert.
    Job description: ${jobDescription}

    Suggest 3-5 most relevant hazard codes from this list:
    06 - Падање са висине
    07 - Пад предмета
    29 - Рад на екрану
    33 - Неприродан положај
    34 - Психички стрес
    ...

    Return JSON: [{ code: "29", confidence: 0.85, rationale: "8h daily screen work" }]
  `;

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(response.content[0].text);
}
```

**Success Criteria for AI (SC-008)**:
- ≥70% relevance score based on user acceptance of suggestions
- Measured across 50+ real positions during pilot phase

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **LangChain** | Over-engineered for simple prompt-completion pattern in Phase 2 |
| **OpenAI GPT-4** | Anthropic Claude 3.5 Sonnet superior reasoning for structured outputs |

---

## Summary of Resolved Decisions

| Unknown | Decision | Section |
|---------|----------|---------|
| Testing framework | Vitest + Playwright | 1 |
| API framework | Hono | 2 |
| Frontend framework | Next.js 14 App Router | 3 |
| Database provider | Neon PostgreSQL | 4 |
| Multi-tenancy | Single DB + RLS | 4 |
| Document storage | Vercel Blob (R2 fallback) | 5 |
| Document generation | Synchronous with progress | 6 |
| DOCX library | docx-templates | 7 |
| User registration | Hybrid (trial + verification) | 8 |
| State management | Zustand | 9 |
| Form validation | Zod + React Hook Form | 10 |
| Auth strategy | JWT (15min/7d) | 11 |
| Cyrillic handling | UTF-8 + sr-Cyrl-RS | 12 |
| Error handling | Structured codes + Error ID | 13 |
| Monitoring | Vercel Analytics + Neon logs | 14 |
| AI integration | Deferred to Phase 2 | 15 |

All **NEEDS CLARIFICATION** items from Technical Context have been resolved.

---

**Next Steps**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md)
