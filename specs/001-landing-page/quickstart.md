# Landing Page Quickstart Guide

**Feature**: BZR Portal Landing Page & Marketing Site
**Last Updated**: 2025-01-28
**Estimated Setup Time**: 30 minutes

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database access (Supabase credentials in `.env`)
- Resend API key (for contact form email sending)
- Git repository cloned

## Setup

### 1. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

### 2. Run Database Migration (ContactFormSubmission Table)

```bash
cd backend

# Generate migration from schema
npm run db:generate

# Apply migration to database
npm run db:push

# Verify table created
# (Connect to Supabase via psql or Supabase dashboard)
# Expected table: contact_form_submissions
```

**Verify migration success**:
```sql
-- Run in Supabase SQL Editor or psql
SELECT * FROM contact_form_submissions LIMIT 1;
-- Expected: Empty result (no rows yet) but no error

\d contact_form_submissions
-- Expected: Table structure with columns: id, name, email, company_name, message, submitted_at, status
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
# Supabase PostgreSQL (existing)
DATABASE_URL=postgresql://postgres:[password]@[host].supabase.co:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email Service (NEW - Resend)
RESEND_API_KEY=re_...  # Get from https://resend.com/api-keys
SUPPORT_EMAIL=info@bzrportal.rs  # Email address for contact form notifications

# JWT Secrets (existing)
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# CORS (existing)
CORS_ORIGIN=http://localhost:5173  # Frontend dev URL

# Storage (existing)
STORAGE_TYPE=s3
WASABI_ACCESS_KEY=...
WASABI_SECRET_KEY=...
WASABI_BUCKET=bzr-ai-storage
```

**Frontend** (`frontend/.env` - optional for dev):
```env
# Backend API URL (dev default: http://localhost:3000)
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Start Development Servers

**Terminal 1 (Frontend)**:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 (Backend)**:
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

**Verify servers running**:
- Frontend: Open http://localhost:5173/ → should see homepage (or 404 if landing routes not implemented yet)
- Backend: Open http://localhost:3000/api/health → should see `{"status":"ok"}`

---

## Testing

### Manual Testing

#### 1. Homepage (http://localhost:5173/)

**Test Steps**:
1. Load homepage
2. Verify hero section displays placeholder image (demo video not ready for MVP)
3. Scroll through all sections:
   - Value propositions (3 cards: AI, Mobile, Legal)
   - Comparison table (BZR Portal vs bzrplatforma.rs vs Manual)
   - Pricing (Trial + Professional cards)
   - FAQ (accordion list)
   - Final CTA section
4. Click "Počnite besplatno" CTA → should redirect to `/register` (or 404 if auth routes not implemented yet)
5. Test mobile view:
   - Open Chrome DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Select iPhone SE (375px width)
   - Verify single-column layout, no horizontal scrolling, 44×44px touch targets

**Expected Behavior**:
- All text in Serbian Cyrillic (no missing characters: Ђ, Ћ, Љ, Њ, Џ, Ж, Ш)
- Smooth scrolling
- Navigation header sticky on scroll
- Footer visible at bottom

---

#### 2. Contact Form (http://localhost:5173/contact)

**Test Steps**:

**A. Validation Errors** (Serbian Cyrillic messages):
1. Submit empty form → "Ime je obavezno", "Email je obavezan", "Poruka je obavezna"
2. Submit invalid email (`marko@invalid`) → "Email adresa nije validna"
3. Submit message <10 characters → "Poruka mora imati najmanje 10 karaktera"

**B. Successful Submission**:
1. Fill form:
   - Ime: "Marko Marković"
   - Email: "marko.test@example.rs"
   - Kompanija: "Test DOO" (optional)
   - Poruka: "Testiranje kontakt forme za BZR Portal landing page."
2. Click "Pošalji"
3. Verify success message: "Poruka je poslata. Odgovorićemo u roku od 24 sata."
4. Verify form fields cleared

**C. Backend Verification**:
1. Check backend logs (Terminal 2) for Resend API response:
   ```
   INFO: Contact form submitted { email: 'marko.test@example.rs', id: 'uuid-here' }
   INFO: Email sent via Resend { id: 're_...' }
   ```

2. Check database (Supabase SQL Editor or psql):
   ```sql
   SELECT * FROM contact_form_submissions ORDER BY submitted_at DESC LIMIT 1;
   ```
   Expected result:
   ```
   id        | name             | email                    | company_name | message                        | submitted_at             | status
   ----------|------------------|--------------------------|--------------|--------------------------------|--------------------------|-------
   uuid-here | Marko Marković  | marko.test@example.rs    | Test DOO     | Testiranje kontakt forme...   | 2025-01-28 14:30:00+00  | new
   ```

3. Check email inbox (info@bzrportal.rs or support@bzrportal.rs):
   - Subject: "Nova poruka sa kontakt forme - Marko Marković"
   - Body contains: name, email, company, message, timestamp, ID

**D. Rate Limiting Test**:
1. Submit contact form 101 times in <15 minutes (use script or manual spam)
2. 101st request → 429 error: "Previše zahteva. Pokušajte ponovo za 15 minuta."

**E. Honeypot Test** (bot detection):
1. Open browser console
2. Inspect contact form → find hidden `website` input field
3. Fill `website` field with any value (e.g., "http://spam.com")
4. Submit form → 400 error: "Greška pri slanju poruke. Pokušajte ponovo." (generic message to not reveal honeypot)

---

#### 3. Other Routes

**Test Steps**:
- http://localhost:5173/features → detailed feature sections (Risk Assessment, AI Generation, Mobile PWA, Security, RBAC)
- http://localhost:5173/pricing → pricing cards (Trial + Professional) + FAQ
- http://localhost:5173/about → company mission, story, team (optional)
- http://localhost:5173/non-existent-route → 404 error page in Serbian Cyrillic with helpful links (Homepage, Features, Contact)

---

### Automated Testing

#### 1. Unit Tests (Vitest)

**Frontend unit tests** (form validation logic):
```bash
cd frontend
npm test

# Run specific test file
npm test -- contact-form.test.ts

# Watch mode (re-run on file changes)
npm test -- --watch
```

**Backend integration tests** (contact API endpoint):
```bash
cd backend
npm test

# Run specific test file
npm test -- contact-api.test.ts

# Coverage report
npm run test:coverage
# Target: 80%+ coverage for contact API logic
```

---

#### 2. E2E Tests (Playwright)

**Setup Playwright** (first time only):
```bash
cd frontend
npx playwright install  # Installs Chrome, Firefox, Safari test browsers
```

**Run E2E tests**:
```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test landing-homepage.spec.ts

# Debug mode with UI (step through tests)
npx playwright test --ui

# Headed mode (see browser actions)
npx playwright test --headed

# Generate test report
npx playwright show-report
```

**Expected test files**:
- `tests/e2e/landing-homepage.spec.ts`:
  - Homepage loads within 3 seconds
  - Hero section displays placeholder image
  - CTA buttons link to /register
  - Mobile view (375px) works without horizontal scroll
- `tests/e2e/landing-contact.spec.ts`:
  - Empty form shows validation errors
  - Valid submission displays success message
  - Form clears after successful submission
- `tests/e2e/landing-navigation.spec.ts`:
  - Navigation links work (/, /features, /pricing, /about, /contact)
  - Mobile hamburger menu opens/closes
  - Active route highlighted in nav

---

#### 3. Lighthouse CI (Performance + Accessibility)

**Setup Lighthouse CI** (first time only):
```bash
cd frontend
npm install -D @lhci/cli
```

**Run Lighthouse CI**:
```bash
# Build frontend first
npm run build

# Run Lighthouse CI on all routes
npx lhci autorun

# Or run manually on single route
npx lighthouse http://localhost:5173/ --view
```

**Expected scores** (per `.lighthouserc.json`):
- Performance ≥90
- Accessibility ≥95
- Best Practices ≥90
- SEO ≥90

**Common issues and fixes**:
- **Performance <90**: Check bundle size (`npm run build` → check dist/ folder size), enable code splitting, lazy load images
- **Accessibility <95**: Add missing `alt` text to images, ensure ARIA labels on icons, fix color contrast ratio
- **SEO <90**: Add missing meta tags (`<title>`, `<meta name="description">`), ensure server-rendered HTML (pre-rendering)

---

## Deployment

### 1. Build Frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
# Expected files: index.html, assets/ (JS/CSS bundles), images/, sitemap.xml
```

**Verify build output**:
```bash
ls -lh dist/
# Total size should be <500KB (excluding images/videos)
```

### 2. Deploy to Vercel

**Automatic deployment** (GitHub Actions sync):
1. Push changes to `main` branch:
   ```bash
   git add .
   git commit -m "feat: landing page - homepage, contact form, pricing"
   git push origin main
   ```
2. GitHub Actions syncs to `chikaAcaFaca/bzr-portal1` repo
3. Vercel auto-deploys from `bzr-portal1` repo
4. Deployment URL: https://bzr-portal1bre.vercel.app/

**Manual deployment** (if needed):
```bash
cd frontend
vercel deploy --prod
# Follow prompts to deploy to Vercel
```

### 3. Deploy Backend (Render.com)

Backend should already be deployed from previous work. Verify contact API endpoint works:

```bash
curl -X POST https://bzr-portal-backend.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.rs",
    "message": "Testing contact form from deployment."
  }'

# Expected response:
# {"success":true,"message":"Poruka je poslata. Odgovorićemo u roku od 24 sata."}
```

---

### 4. Verify Production

**Frontend URLs**:
- Homepage: https://bzr-portal1bre.vercel.app/
- Features: https://bzr-portal1bre.vercel.app/features
- Pricing: https://bzr-portal1bre.vercel.app/pricing
- About: https://bzr-portal1bre.vercel.app/about
- Contact: https://bzr-portal1bre.vercel.app/contact

**Test Checklist**:
- [ ] All 5 routes load without errors
- [ ] Serbian Cyrillic text renders correctly (no missing characters)
- [ ] Contact form submission works (check email delivered to info@bzrportal.rs)
- [ ] Mobile view works on real device (iPhone, Android)
- [ ] Page load <3 seconds (test with Chrome DevTools throttling to 4G)
- [ ] Run Lighthouse audit on production URL:
  ```bash
  npx lighthouse https://bzr-portal1bre.vercel.app/ --view
  ```
  Expected scores: Performance ≥90, Accessibility ≥95, Best Practices ≥90, SEO ≥90

---

## Troubleshooting

### Problem: Contact form submission returns 500 error

**Possible causes**:
1. Resend API key not configured or invalid
2. Database connection failure
3. Email sending failure

**Debug steps**:
1. Check backend logs (Render.com dashboard → Logs)
2. Verify `RESEND_API_KEY` environment variable set correctly
3. Test Resend API directly:
   ```bash
   curl https://api.resend.com/emails \
     -H "Authorization: Bearer re_..." \
     -H "Content-Type: application/json" \
     -d '{"from":"noreply@bzrportal.rs","to":"info@bzrportal.rs","subject":"Test","text":"Test"}'
   ```
4. Verify database connection (check `DATABASE_URL` in backend/.env)

---

### Problem: Serbian Cyrillic characters not rendering (boxes or question marks)

**Possible causes**:
1. Font not loaded (Google Fonts link missing)
2. UTF-8 encoding not set in HTML `<meta>` tag
3. Font file doesn't include Cyrillic subset

**Debug steps**:
1. Verify index.html includes:
   ```html
   <meta charset="UTF-8">
   <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&subset=cyrillic&display=swap" rel="stylesheet">
   ```
2. Check Network tab in DevTools → verify font file loaded (fonts.gstatic.com)
3. Test specific characters in browser console:
   ```javascript
   document.body.innerHTML = 'Ђ Ћ Љ Њ Џ Ж Ш';
   ```

---

### Problem: Lighthouse Performance score <90

**Common causes**:
1. Large bundle size (>300KB)
2. Images not lazy-loaded
3. No code splitting (all routes in single bundle)
4. Video auto-plays on page load

**Fixes**:
1. Check bundle size:
   ```bash
   cd frontend
   npm run build
   ls -lh dist/assets/
   # Main JS bundle should be <100KB gzipped
   ```
2. Enable lazy loading for images:
   ```tsx
   <img src="/images/feature.png" loading="lazy" alt="..." />
   ```
3. Add code splitting for routes (see research.md R006)
4. Set video `preload="none"` to defer loading until user interaction

---

## Next Steps

After completing local testing and deployment:

1. **Monitor contact form submissions** → Check Supabase `contact_form_submissions` table daily for new inquiries
2. **Respond to inquiries within 24 hours** → Per success criteria SC-006 (95%+ response rate)
3. **Run weekly Lighthouse audits** → Ensure performance/accessibility scores remain ≥90
4. **Gather user feedback** → Use heatmap tool (Hotjar, Microsoft Clarity) to track scroll depth and CTA clicks
5. **Iterate on conversion rate** → A/B test headlines, CTA button text, pricing display to improve 10%+ conversion goal

---

## Useful Commands Reference

```bash
# Frontend
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production (output: dist/)
npm test             # Run Vitest unit tests
npx playwright test  # Run Playwright E2E tests
npx lighthouse URL   # Run Lighthouse audit

# Backend
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # (Not needed - tsx runtime)
npm start            # Start production server
npm test             # Run Vitest integration tests
npm run db:generate  # Generate Drizzle migration
npm run db:push      # Apply migration to database

# Database
npm run db:studio    # Open Drizzle Studio (visual DB editor)
# Connect to Supabase: psql "postgresql://postgres:[password]@[host].supabase.co:5432/postgres"
```

---

## Support

**Questions or issues?**
- Check [spec.md](./spec.md) for functional requirements
- Check [plan.md](./plan.md) for technical architecture
- Check [research.md](./research.md) for design decisions
- Open issue on GitHub repository
- Contact: info@bzrportal.rs
