# Landing Page Research & Design Decisions

**Feature**: BZR Portal Landing Page & Marketing Site
**Date**: 2025-01-28
**Status**: Completed

## R001: Serbian Cyrillic Font Selection & Rendering

**Decision**: Google Fonts - **Noto Sans** (Regular 400, Medium 500, Bold 700) with system font fallback chain

**Rationale**:
- **Full Cyrillic coverage**: Noto Sans includes all Serbian Cyrillic characters (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш, Ч, Ћ, Ђ) plus Latin for mixed content
- **Open Source**: SIL Open Font License 1.1 (free for commercial use)
- **Optimized file size**: ~18KB for Regular weight (Latin + Cyrillic subset via Google Fonts API with `?subset=cyrillic`)
- **Cross-browser compatibility**: Tested and supported on Chrome, Firefox, Safari, Edge
- **Professional appearance**: Clean, modern sans-serif suitable for SaaS marketing site

**Fallback chain**:
```css
font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
```

**Alternatives considered**:
- **Roboto** (Google Fonts): Good Cyrillic support but slightly more generic appearance
- **Open Sans** (Google Fonts): Slightly larger file size (~22KB), less distinctive
- **System fonts only** (Arial, Times New Roman): Free but inconsistent rendering across OS, less professional

**Implementation**:
1. Add Google Fonts link to index.html `<head>`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&subset=cyrillic&display=swap" rel="stylesheet">
   ```
2. Update Tailwind config (tailwind.config.js):
   ```js
   theme: {
     extend: {
       fontFamily: {
         sans: ['Noto Sans', ...defaultTheme.fontFamily.sans],
       },
     },
   }
   ```
3. Verification testing: Create test page with all special characters (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш) and verify rendering on Chrome/Firefox/Safari/Edge

**Performance optimization**:
- Use `font-display: swap` to avoid FOIT (Flash of Invisible Text) - already handled by Google Fonts `&display=swap` parameter
- Preconnect to fonts.googleapis.com and fonts.gstatic.com to reduce DNS/TLS latency

---

## R002: Demo Video Hosting & Optimization

**Decision**: **Wasabi S3** bucket (existing infrastructure) with direct `<video>` tag embed for MVP, fallback placeholder image until video ready

**Rationale**:
- **Zero additional cost**: Wasabi already provisioned ($6.99/month flat rate, no egress fees)
- **Direct control**: Full control over video encoding, compression, caching headers
- **No third-party dependency**: Avoids YouTube/Vimeo embed tracking scripts (better privacy, faster page load)
- **Simple integration**: Standard HTML5 `<video>` tag with poster image, fallback to `<img>` if video not loaded

**Video encoding settings**:
- **Hero section video** (max 5MB, max 30 seconds):
  - Codec: H.264 (MP4) for broad compatibility
  - Resolution: 1280×720 (720p) for desktop, 640×360 (360p) for mobile (adaptive with `<source>` tags)
  - Bitrate: ~1200 kbps for 720p, ~500 kbps for 360p
  - Audio: None (silent demo with on-screen text overlays in Serbian Cyrillic)
- **Detailed demo video** (max 15MB, 1-2 minutes):
  - Codec: H.264 (MP4)
  - Resolution: 1920×1080 (1080p) for desktop, 1280×720 for mobile
  - Bitrate: ~2500 kbps for 1080p, ~1200 kbps for 720p
  - Audio: Optional Serbian narration or music (separate audio track)

**Fallback strategy for slow connections (3G)**:
1. **Poster image**: Display static placeholder image (mobile phone scanning document with checkmark icon) until video loads
2. **Lazy loading**: Only load video when hero section becomes visible (Intersection Observer API)
3. **Preload="none"**: Don't preload video metadata until user interaction
4. **Loading spinner**: Show spinner overlay while video buffers (if user clicks play)

**MVP placeholder approach** (per FR-009 - demo video not ready for MVP):
- Use static illustration (SVG or PNG, <100KB) showing OCR workflow: phone → scan → checkmark → database
- Later replace with actual video by updating Wasabi S3 URL (no code changes needed)

**Alternatives considered**:
- **YouTube embed**: Free but adds 3rd-party scripts (~500KB overhead), privacy concerns (Google tracking), less control over player UI
- **Vimeo embed**: Better privacy than YouTube but paid tier required for ad-free ($12/month), still external dependency
- **Vercel Blob storage**: $0.15/GB egress (1000 visitors × 5MB video = 5GB = $0.75/day = $22.50/month) - too expensive vs Wasabi flat rate

**Implementation**:
1. Upload video to Wasabi bucket: `s3://bzr-ai-storage/landing/demo-hero.mp4`
2. HTML5 video tag with poster:
   ```html
   <video poster="/images/demo-poster.jpg" controls preload="none" class="w-full rounded-lg shadow-lg">
     <source src="https://s3.eu-central-1.wasabisys.com/bzr-ai-storage/landing/demo-hero-720p.mp4" type="video/mp4" media="(min-width: 768px)">
     <source src="https://s3.eu-central-1.wasabisys.com/bzr-ai-storage/landing/demo-hero-360p.mp4" type="video/mp4">
     <p>Vaš pregledač ne podržava video playback.</p>
   </video>
   ```
3. Intersection Observer to lazy load when hero section visible

---

## R003: Contact Form Spam Prevention

**Decision**: **Honeypot field + rate limiting** (100 requests/15 minutes per IP)

**Rationale**:
- **Zero user friction**: Invisible to legitimate users (no CAPTCHAs to solve)
- **No third-party dependencies**: No Google reCAPTCHA or Cloudflare Turnstile external scripts
- **GDPR compliant**: No tracking cookies or user data sent to third parties
- **Effective against bots**: Catches 95%+ of unsophisticated bots (automated form fillers)
- **Simple implementation**: Single hidden input field + Hono rate limiter middleware

**Honeypot implementation**:
```tsx
// Hidden field in contact form (invisible to users, visible to bots)
<input
  type="text"
  name="website"  // Common honeypot field name
  id="website"
  autoComplete="off"
  tabIndex={-1}
  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
  aria-hidden="true"
/>
```
- If `website` field has value on submission → reject as spam (legitimate users can't see it, bots auto-fill all inputs)

**Rate limiting implementation** (backend Hono middleware):
```typescript
import { rateLimiter } from 'hono-rate-limiter';

// Apply to /api/contact endpoint
app.use('/api/contact', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Max 100 requests per window per IP
  standardHeaders: 'draft-7',
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1',
  handler: (c) => {
    return c.json({
      success: false,
      error: 'Previše zahteva. Pokušajte ponovo za 15 minuta.'
    }, 429);
  },
}));
```

**Alternatives considered**:
- **reCAPTCHA v3**: Invisible score-based (no checkbox) but adds ~500KB Google scripts, privacy concerns (Google tracking), may block legitimate users in China/Russia
- **Turnstile**: Cloudflare alternative to reCAPTCHA, lighter weight (~100KB) but still external dependency, requires Cloudflare account
- **Email verification**: Send confirmation link before storing submission - high user friction (users wait for email), doesn't prevent spam volume (spammers submit anyway)

**Monitoring and fallback**:
- Log honeypot catches: `logger.warn('Honeypot triggered', { ip, email })`
- If spam volume increases (>10 submissions/day with honeypot bypass), escalate to Turnstile as Phase 2 enhancement

---

## R004: SEO Pre-rendering Strategy

**Decision**: **Vite plugin for static pre-rendering** (vite-plugin-ssr or vite-plugin-prerender-routes) at build time

**Rationale**:
- **Vercel compatibility**: Works with Vercel static hosting (no server-side rendering infrastructure needed)
- **Fast build time**: Pre-renders 5 routes (/, /features, /pricing, /about, /contact) in <30 seconds at build time
- **SEO effectiveness**: Generates fully-rendered HTML for each route → Google/Bing crawl complete content without executing JavaScript
- **Zero runtime overhead**: Pre-rendered HTML served as static files (no SSR server request processing)
- **Maintenance simplicity**: Single Vite plugin configuration, no dual build pipelines

**Implementation** (using vite-plugin-prerender-routes):
1. Install: `npm install -D vite-plugin-prerender-routes`
2. Update vite.config.ts:
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import prerenderRoutes from 'vite-plugin-prerender-routes';

   export default defineConfig({
     plugins: [
       react(),
       prerenderRoutes({
         routes: ['/', '/features', '/pricing', '/about', '/contact'],
         renderer: '@prerenderer/renderer-puppeteer',
       }),
     ],
   });
   ```
3. Build output: `frontend/dist/index.html`, `frontend/dist/features/index.html`, etc.
4. Vercel serves pre-rendered HTML for each route

**Verification testing**:
1. Google Search Console: Submit sitemap.xml → verify all 5 routes indexed within 7 days
2. Curl test: `curl https://bzr-portal1bre.vercel.app/ | grep "Procena rizika za 5 minuta"` → verify hero headline present in HTML source
3. PageSpeed Insights: Check "Crawl" report → ensure no JavaScript rendering delays

**Alternatives considered**:
- **Vite SSR plugin**: Requires Node.js server on Vercel (more expensive than static hosting), added complexity (server-side routing, hydration errors)
- **Next.js migration**: Complete rewrite of React app (~2 weeks effort), architecture overkill for 5 static marketing pages
- **React Snap**: Post-build tool (runs after Vite build) but slower (uses headless Chrome for each route), less maintained than vite-plugin-prerender-routes

---

## R005: Responsive Table Design Pattern

**Decision**: **Card-based design on mobile** (one competitor per card with accordion expand) + **horizontal scroll with sticky first column on tablet**

**Rationale**:
- **Mobile UX (375px-767px)**: Cards avoid horizontal scrolling, easier to read on small screens, touch-friendly accordion expand/collapse
- **Tablet UX (768px-1023px)**: Horizontal scroll acceptable for 4 columns (Funkcionalnost, BZR Portal, bzrplatforma.rs, Manuelni proces) with sticky first column for context
- **Desktop UX (1024px+)**: Full table layout with all 4 columns visible side-by-side
- **Accessibility**: Card-based design more screen-reader friendly (linear navigation) than complex table structure with horizontal scroll

**Implementation** (Tailwind CSS breakpoints):

**Mobile (375px-767px)** - Card-based comparison:
```tsx
<div className="md:hidden">
  {competitors.map(competitor => (
    <Card key={competitor.name}>
      <CardHeader>
        <h3>{competitor.name}</h3>  {/* "BZR Portal", "bzrplatforma.rs", "Manuelni proces" */}
      </CardHeader>
      <CardContent>
        <Accordion>
          {features.map(feature => (
            <AccordionItem key={feature.id}>
              <AccordionTrigger>{feature.name}</AccordionTrigger>  {/* "AI generisanje dokumenata" */}
              <AccordionContent>
                {competitor.features[feature.id] ? (
                  <span className="text-green-600" aria-label="DA"><Check /> DA</span>
                ) : (
                  <span className="text-red-600" aria-label="NE"><X /> NE</span>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  ))}
</div>
```

**Tablet (768px-1023px)** - Horizontal scroll with sticky first column:
```tsx
<div className="hidden md:block lg:hidden overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr>
        <th className="sticky left-0 bg-white z-10">Funkcionalnost</th>  {/* Sticky first column */}
        <th>BZR Portal</th>
        <th>bzrplatforma.rs</th>
        <th>Manuelni proces</th>
      </tr>
    </thead>
    <tbody>
      {features.map(feature => (
        <tr key={feature.id}>
          <td className="sticky left-0 bg-white z-10 font-medium">{feature.name}</td>
          <td>{feature.bzrPortal ? '✓ DA' : '✗ NE'}</td>
          <td>{feature.competitor ? '✓ DA' : '✗ NE'}</td>
          <td>{feature.manual ? '✓ DA' : '✗ NE'}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Desktop (1024px+)** - Full table:
```tsx
<div className="hidden lg:block">
  <table className="w-full">
    {/* Same structure as tablet, no horizontal scroll needed */}
  </table>
</div>
```

**Accessibility considerations**:
- Use `aria-label` on checkmarks: `<span aria-label="DA - AI generisanje dokumenata">✓</span>`
- Add `role="table"` and `role="row"` to card-based structure for screen readers to announce as table
- Ensure focus visible on accordion triggers (keyboard navigation)

**Alternatives considered**:
- **Horizontal scroll only** (all breakpoints): Poor UX on mobile (users miss columns, horizontal scroll frustrating on touch screens)
- **Transpose table** (rows become columns on mobile): Confusing layout (users expect vertical scroll, not horizontal rows of features)
- **Progressive disclosure** (show 2 columns on mobile, "Compare with..." button to expand): Adds interaction friction, hides key competitor comparison

---

## R006: Lighthouse Performance Optimization

**Decision**: Multi-layered optimization strategy targeting Lighthouse Performance ≥90

### Optimization Checklist:

#### 1. **Lazy Loading Images** (Intersection Observer API)
- Implement: Use `loading="lazy"` attribute on all `<img>` tags below fold (value props icons, feature screenshots, testimonial photos)
- Impact: Reduces initial page load by ~500KB-1MB (defers non-critical images)
- Browser compatibility: Supported in Chrome 76+, Firefox 75+, Safari 15.4+, Edge 79+

```tsx
<img
  src="/images/value-prop-ai.svg"
  alt="AI Automatizacija ikona"
  loading="lazy"
  className="w-16 h-16"
/>
```

#### 2. **Code Splitting** (React.lazy() for routes)
- Implement: Split each route into separate bundle (HomePage, FeaturesPage, PricingPage, AboutPage, ContactPage)
- Impact: Reduces initial bundle from ~300KB to ~80KB (homepage only), other routes loaded on demand
- Vite config: No additional configuration needed (Vite automatically code-splits dynamic imports)

```tsx
// App.tsx
import { lazy, Suspense } from 'react';
const HomePage = lazy(() => import('./pages/HomePage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
// ... other routes

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/features" element={<FeaturesPage />} />
    {/* ... */}
  </Routes>
</Suspense>
```

#### 3. **Font Optimization** (preconnect + font-display: swap)
- Already handled by Google Fonts `&display=swap` parameter (see R001)
- Add `<link rel="preconnect">` to index.html (reduces DNS/TLS latency by ~100ms)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

#### 4. **Critical CSS Inlining** (Vite plugin)
- Implement: Use vite-plugin-critical to inline above-the-fold CSS (~10KB) into `<head>`
- Impact: Eliminates render-blocking CSS for initial paint (improves FCP by ~200ms)
- Install: `npm install -D vite-plugin-critical`

```typescript
// vite.config.ts
import critical from 'vite-plugin-critical';

export default defineConfig({
  plugins: [
    react(),
    critical({
      base: 'dist/',
      inline: true,
      minify: true,
      dimensions: [
        { height: 900, width: 375 },  // Mobile
        { height: 900, width: 1920 }, // Desktop
      ],
    }),
  ],
});
```

#### 5. **Video Poster Image** (lightweight placeholder)
- Use optimized JPEG poster image (<50KB) as video placeholder
- Implement: `<video poster="/images/demo-poster.jpg" preload="none">`
- Impact: Defers video load (5MB) until user clicks play, improves LCP (Largest Contentful Paint)

#### 6. **Bundle Size Analysis** (Rollup Visualizer)
- Tool: `npm install -D rollup-plugin-visualizer`
- Run: `npm run build && npx rollup-plugin-visualizer stats.html`
- Target: Homepage bundle <100KB gzipped (React 18 ~40KB, shadcn/ui ~20KB, page code ~30KB)

### Lighthouse CI Configuration (GitHub Actions)

Create `.github/workflows/lighthouse-ci.yml`:
```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install deps
        run: cd frontend && npm ci
      - name: Build
        run: cd frontend && npm run build
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:5173/
            http://localhost:5173/features
            http://localhost:5173/pricing
            http://localhost:5173/about
            http://localhost:5173/contact
          configPath: '.lighthouserc.json'
```

Create `.lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "staticDistDir": "./frontend/dist"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

**Performance targets** (measured on 4G throttling, Moto G4):
- **First Contentful Paint (FCP)**: <1.5 seconds
- **Largest Contentful Paint (LCP)**: <2.5 seconds
- **Time to Interactive (TTI)**: <3.0 seconds
- **Total Blocking Time (TBT)**: <200ms
- **Cumulative Layout Shift (CLS)**: <0.1

**Alternatives considered**:
- **Next.js Image component**: Automatic optimization but requires Next.js migration (rejected per R004)
- **Cloudflare Image Resizing**: Automatic responsive images but adds external dependency + cost ($5/month for 1000+ visitors)
- **Manual webpack optimization**: More control but Vite already optimized (tree-shaking, minification, gzip)

---

## Summary of Design Decisions

| Research Area | Decision | Key Benefit | Implementation Complexity |
|---------------|----------|-------------|---------------------------|
| **R001: Font** | Noto Sans (Google Fonts) | Full Cyrillic support, 18KB size | Low (1 hour) |
| **R002: Video** | Wasabi S3 + placeholder | Zero cost increase, full control | Low (2 hours) |
| **R003: Spam** | Honeypot + rate limiting | No user friction, GDPR compliant | Low (1 hour) |
| **R004: SEO** | Vite pre-render plugin | Static HTML for crawlers, fast builds | Medium (3 hours) |
| **R005: Table** | Card-based mobile, scroll tablet | Best mobile UX, accessible | Medium (4 hours) |
| **R006: Performance** | Lazy load + code split + critical CSS | Lighthouse ≥90 across all metrics | High (6 hours) |

**Total estimated research + implementation time**: 17 hours

**Critical path dependencies**:
1. R001 (Font) → must be decided before UI component styling
2. R004 (SEO) → must be configured before first deployment
3. R006 (Performance) → continuous optimization throughout implementation

**Risk mitigation**:
- **Demo video not ready for MVP**: Use placeholder image per FR-009, swap in video later (no code changes)
- **Lighthouse score <90 on first attempt**: Iterate on R006 optimizations, may require additional lazy loading or bundle size reduction
- **Spam volume exceeds honeypot capacity**: Escalate to Turnstile (Cloudflare) in Phase 2 (1 hour to add)
