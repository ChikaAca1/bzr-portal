# Feature Specification: BZR Portal Landing Page & Marketing Site

**Feature Branch**: `001-landing-page`
**Created**: 2025-01-28
**Status**: Draft
**Input**: User description: "Landing page za BZR Portal platformu. Hero section sa demo video/GIF prikazom AI + mobile-first funkcionalnosti (skeniranje papirnog dokumenta Obrazac 6 telefonom → OCR ekstrakcija → instant digitalni podaci u bazi). Value propositions naglašavaju: 1) AI automatizaciju - '10x brže sa AI' (Akt o Proceni Rizika generisan za 5 minuta umesto 2+ sata manuelnog rada), 2) Mobile-first pristup - 'Radite sa telefona' (terenski rad, offline PWA mod, direktan pristup kameri za skeniranje dokumenata), 3) Pravnu usaglašenost sa srpskim zakonima o BZR. Comparison table istice prednosti nad bzrplatforma.rs: AI generisanje dokumenata (mi DA, oni NE), Mobile OCR skeniranje (mi DA, oni NE), Offline mod (mi DA, oni NE), Kamera integracija za fotografisanje opreme (mi DA, oni NE), QR kod skeniranje opreme (mi DA, oni NE). Sekcije landing page: Hero (sa demo), Value Props (AI/Mobile/Legal compliance), Demo Video (detaljniji prikaz workflow-a), Comparison Table (mi vs konkurencija), Features Overview (risk assessment, dokument generisanje, multi-tenancy, RBAC), Pricing (Trial 14 dana besplatno, Professional plan ~3000-6000 RSD/mesec), Testimonials/Social Proof (placeholder za buduće), FAQ (najčešća pitanja), CTA (Poziv na akciju - registracija ili demo booking). Dizajn mora biti mobile-first responsive (375px+ iPhone SE do 1920px+ desktop), shadcn/ui komponente + Tailwind CSS, srpski ćirilica tekst, WCAG AA pristupačnost. Landing page rute: / (homepage), /features (detaljne funkcionalnosti), /pricing (cenovnik), /about (o nama), /contact (kontakt forma)."

## User Scenarios & Testing

### User Story 1 - Discover Platform Value (Priority: P1)

BZR officer from a small Serbian company (50-200 employees) visits the homepage to understand if BZR Portal can solve their pain point: spending 2+ hours per position creating risk assessment documents manually. They need to quickly see what the platform does, how it saves time with AI, and whether it complies with Serbian BZR regulations.

**Why this priority**: This is the primary conversion funnel entry point. If users don't understand value within 10-15 seconds, they bounce. Hero section + value props must immediately communicate: "AI saves 10x time on BZR documents, works from your phone, legally compliant."

**Independent Test**: Load homepage on mobile (375px) and desktop (1920px), verify hero section displays demo video/GIF showing OCR scanning workflow, verify all three value propositions visible above fold, verify Serbian Cyrillic text renders correctly.

**Acceptance Scenarios**:

1. **Given** visitor lands on homepage, **When** page loads, **Then** hero section displays AI + mobile-first demo (video/GIF) showing document scanning workflow, headline in Serbian Cyrillic emphasizes "10x brže sa AI", and primary CTA button is visible (e.g., "Počnite besplatno" or "Zakažite demo")
2. **Given** visitor scrolls to value propositions section, **When** section becomes visible, **Then** three key benefits are displayed with icons: (1) AI Automatizacija (2h → 5min), (2) Rad sa telefona (terenski rad, offline), (3) Pravna usaglašenost (srpski zakoni o BZR)
3. **Given** visitor is using mobile device (375px-767px), **When** homepage loads, **Then** layout is single-column, touch targets are minimum 44×44px, text is readable without zoom, and demo video is optimized for mobile bandwidth

---

### User Story 2 - Compare with Competitors (Priority: P2)

BZR officer who is already aware of bzrplatforma.rs (or other competitors) needs to see clear differentiation: Why should they choose BZR Portal instead? They want objective comparison showing AI generation, mobile OCR, offline mode, camera integration, and QR code features that competitors lack.

**Why this priority**: Conversion-critical for users in decision stage. Comparison table provides social proof ("we're better than incumbents") and addresses objections ("why not just use existing tool?"). Directly supports pricing justification.

**Independent Test**: Navigate to comparison table section on homepage (or dedicated /features page), verify table displays 5+ feature rows (AI generation, mobile OCR, offline mode, camera integration, QR codes) with BZR Portal marked "DA" (✓) and bzrplatforma.rs marked "NE" (✗).

**Acceptance Scenarios**:

1. **Given** visitor scrolls to comparison section, **When** section becomes visible, **Then** comparison table displays with header "Zašto BZR Portal?" and columns: "Funkcionalnost", "BZR Portal", "bzrplatforma.rs", and "Manuelni proces"
2. **Given** comparison table is rendered, **When** user views feature rows, **Then** minimum 5 features are compared: (1) AI generisanje dokumenata, (2) Mobile OCR skeniranje, (3) Offline mod, (4) Kamera integracija, (5) QR kod skeniranje opreme, with visual indicators (✓ for DA, ✗ for NE)
3. **Given** visitor is on mobile device, **When** viewing comparison table, **Then** table is horizontally scrollable OR redesigned as card-based comparison (one competitor per card) to maintain readability on small screens

---

### User Story 3 - Understand Pricing & Trial (Priority: P2)

Decision-maker (company director, HR manager, or BZR officer) needs to understand cost before committing. They want transparency: free trial duration, what's included in trial, professional plan price in RSD, and clear upgrade path. Budget-conscious SMEs need reassurance that platform is affordable (~3000-6000 RSD/month competitive with bzrplatforma.rs 1500-6000 RSD/month).

**Why this priority**: Pricing transparency builds trust and reduces sales friction. Free 14-day trial removes risk barrier. Clear pricing (not hidden behind "Contact Us") improves conversion for self-service signups.

**Independent Test**: Navigate to pricing section (on homepage or /pricing route), verify free trial details (14 days, feature limits) and Professional plan pricing (RSD range, key features included) are clearly displayed.

**Acceptance Scenarios**:

1. **Given** visitor navigates to pricing section, **When** section loads, **Then** pricing cards display: (1) Trial plan (14 dana besplatno, limitations: 1 company, 3 positions, 5 documents), (2) Professional plan (3000-6000 RSD/mesec, unlimited positions/documents, AI generation, mobile OCR, priority support)
2. **Given** visitor clicks on pricing CTA button (e.g., "Počnite sa Trial planom"), **When** button is clicked, **Then** user is redirected to registration page (/register) with trial plan pre-selected
3. **Given** visitor wants detailed pricing, **When** they view pricing cards, **Then** tooltip or expandable section explains: "Cena zavisi od broja zaposlenih" with tiers (e.g., 0-50: 3000 RSD, 51-200: 4500 RSD, 201+: 6000 RSD)

---

### User Story 4 - View Detailed Features (Priority: P3)

Technically-savvy BZR officer or IT admin wants to explore platform capabilities in depth before signing up. They navigate to /features page to read about: risk assessment workflow (E×P×F calculation), document generation (Akt o Proceni Rizika structure), multi-tenancy (data isolation), RBAC (role-based access), AI integration (DeepSeek R1/Claude), mobile PWA (offline capabilities).

**Why this priority**: Secondary page for detail-oriented users. Not critical for initial conversion but supports trust-building and answers "how does it work?" questions. Reduces post-signup confusion and support tickets.

**Independent Test**: Navigate to /features route, verify dedicated sections for: (1) Risk Assessment, (2) AI Document Generation, (3) Mobile-First & OCR, (4) Security & Compliance, (5) Multi-Tenancy & RBAC, each with screenshots/illustrations and Serbian Cyrillic descriptions.

**Acceptance Scenarios**:

1. **Given** visitor clicks "Sve funkcionalnosti" link in navigation or footer, **When** /features page loads, **Then** page displays organized sections: Hero (overview), Risk Assessment, AI Document Generation, Mobile-First & OCR, Security & Compliance, Multi-Tenancy, with anchor links for quick navigation
2. **Given** visitor scrolls to AI Document Generation section, **When** section is visible, **Then** content explains: "AI generiše Akt o Proceni Rizika za 5 minuta koristeći DeepSeek R1 ili Claude, umesto 2+ sata manuelnog rada. Automatski popunjava hazard types, E×P×F vrednosti, korektivne mere."
3. **Given** visitor is on mobile device (375px-767px), **When** viewing /features page, **Then** screenshots/illustrations are responsive (scale to fit screen), text remains readable, and sections collapse/expand for easier navigation

---

### User Story 5 - Contact Sales or Support (Priority: P3)

Visitor has specific questions (custom pricing for 500+ employees, on-premise deployment, integration with existing HR system) that aren't answered on landing page. They need to contact sales or support via /contact page with contact form or email/phone details.

**Why this priority**: Enables high-value leads (large enterprises, custom requirements) to reach out. Not critical for self-service trial signups but essential for enterprise deals. Contact form reduces spam vs showing public email.

**Independent Test**: Navigate to /contact route, verify contact form with fields (Name, Email, Company, Message) and submit button, OR display contact email/phone if form is not implemented in MVP.

**Acceptance Scenarios**:

1. **Given** visitor clicks "Kontakt" link in navigation or footer, **When** /contact page loads, **Then** page displays contact form with fields: Ime, Email, Kompanija, Poruka (textarea), and "Pošalji" button
2. **Given** visitor fills out contact form and clicks "Pošalji", **When** form is submitted, **Then** validation checks email format, all required fields filled, displays success message "Poruka je poslata. Odgovorićemo u roku od 24 sata.", and sends email notification to BZR Portal support team
3. **Given** visitor prefers direct contact, **When** viewing /contact page, **Then** alternative contact methods are displayed: email (info@bzrportal.rs or support@bzrportal.rs), phone number (optional), and business address (optional)

---

### User Story 6 - Read About Company (Priority: P4)

Visitor wants to learn about BZR Portal team, mission, and company background before trusting them with sensitive employee data. They navigate to /about page to read company story, team bios (optional), and why they built this platform.

**Why this priority**: Low priority for MVP. About page builds credibility but rarely impacts conversion directly. Can be placeholder text initially and improved post-launch based on feedback.

**Independent Test**: Navigate to /about route, verify page displays company mission/vision, brief story about why BZR Portal was created, and optional team section.

**Acceptance Scenarios**:

1. **Given** visitor clicks "O nama" link in navigation or footer, **When** /about page loads, **Then** page displays: company mission ("Automatizujemo BZR procese sa AI"), brief story (founders' background in occupational safety or SaaS), and vision for Serbian BZR market
2. **Given** visitor reads /about page, **When** page is displayed, **Then** content is in Serbian Cyrillic, includes placeholder for team photos (optional for MVP), and ends with CTA to start trial or contact sales

---

### Edge Cases

- **Mobile device with slow connection (3G)**: What happens when hero demo video takes >5 seconds to load? Display loading spinner or low-res placeholder image, ensure page content (text, CTAs) renders immediately without blocking on video load.
- **Screen reader user accessing comparison table**: How are checkmarks (✓) and X marks (✗) announced? Use `aria-label` attributes (e.g., `aria-label="DA - AI generisanje dokumenata"`) to ensure accessibility.
- **User navigates to non-existent route (e.g., /pricing-2024)**: Display 404 error page in Serbian Cyrillic with helpful links (Homepage, Features, Contact) to keep user on site.
- **User with JavaScript disabled**: Does landing page gracefully degrade? Ensure core content (hero text, value props, comparison table, pricing) is server-rendered or static HTML, not dependent on JS to render.
- **User zooms to 200% on desktop browser (accessibility)**: Does layout break or text overlap? Verify WCAG AA compliance with zoom test, ensure no horizontal scrolling required and text remains readable.

## Requirements

### Functional Requirements

#### Landing Page Routes & Navigation

- **FR-001**: System MUST provide public landing page routes accessible without authentication: `/` (homepage), `/features`, `/pricing`, `/about`, `/contact`
- **FR-002**: System MUST display persistent navigation header on all landing pages with links: Logo (links to /), Funkcionalnosti (/features), Cenovnik (/pricing), O nama (/about), Kontakt (/contact), CTA button "Počnite besplatno" or "Prijava" (links to /register or /login)
- **FR-003**: System MUST display footer on all landing pages with links: quick links (Features, Pricing, About, Contact), legal (Privacy Policy, Terms of Service - placeholder links for MVP), social media icons (optional placeholder for MVP), copyright text "© 2025 BZR Portal. Sva prava zadržana."
- **FR-004**: System MUST support responsive navigation: desktop (horizontal menu), tablet (horizontal menu with smaller font), mobile (hamburger menu icon with slide-out drawer)
- **FR-005**: Navigation links MUST highlight current page (active state with underline or color change)

#### Hero Section (Homepage /)

- **FR-006**: Homepage hero section MUST display headline in Serbian Cyrillic emphasizing AI + time savings, e.g., "Procena rizika za 5 minuta umesto 2 sata - uz pomoć AI"
- **FR-007**: Hero section MUST display subheadline explaining mobile-first value, e.g., "Radite sa telefona, skenirajte dokumente kamerom, generišite akte automatski"
- **FR-008**: Hero section MUST display demo video or animated GIF (max 30 seconds, max 5MB) showing OCR workflow: (1) User photographs paper Obrazac 6 document with phone, (2) AI OCR extracts text, (3) Structured data appears in BZR Portal database, (4) Akt o Proceni Rizika generated
- **FR-009**: If demo video not ready for MVP, hero section MUST display placeholder illustration or static image showing mobile phone scanning document with checkmark icon
- **FR-010**: Hero section MUST display two CTA buttons: primary "Počnite besplatno (14 dana)" linking to /register, secondary "Pogledajte demo" linking to demo video section OR booking calendar (if available)
- **FR-011**: Hero section background MUST use brand colors (define in design system: primary, secondary, accent) with subtle gradient or geometric pattern, ensuring WCAG AA contrast ratio (4.5:1) for text

#### Value Propositions Section (Homepage /)

- **FR-012**: Value props section MUST display three key benefits as cards with icons: (1) AI Automatizacija, (2) Mobile-First, (3) Pravna usaglašenost
- **FR-013**: AI Automatizacija card MUST include: icon (robot or sparkles), headline "10x brže sa AI", description "Akt o Proceni Rizika generisan za 5 minuta umesto 2+ sata manuelnog rada. AI predlaže hazarde, E×P×F vrednosti, i korektivne mere."
- **FR-014**: Mobile-First card MUST include: icon (phone or camera), headline "Radite sa telefona", description "Terenski rad bez interneta (offline PWA), skenirajte dokumente kamerom (OCR), fotografišite opremu, skenirajte QR kodove."
- **FR-015**: Pravna usaglašenost card MUST include: icon (shield or checkmark), headline "Usklađeno sa zakonom", description "Svi dokumenti u skladu sa Zakonom o BZR (Sl. glasnik RS br. 101/2005) i Pravilnikom o preventivnim merama (Sl. glasnik RS br. 23/2009)."
- **FR-016**: Value props cards MUST be responsive: desktop (3 columns side-by-side), tablet (3 columns or 2+1 stacked), mobile (1 column stacked)

#### Demo Video Section (Homepage /)

- **FR-017**: Homepage MUST include dedicated demo video section (after value props) with larger embedded video (1-2 minutes) showing detailed workflow: (1) User login, (2) Create company, (3) Add work position, (4) Add hazards with AI suggestions, (5) Calculate E×P×F risk, (6) Generate Akt document
- **FR-018**: Demo video section MUST include video player controls: play/pause, volume, fullscreen, captions (Serbian Cyrillic subtitles optional for MVP)
- **FR-019**: If demo video not ready for MVP, section MUST display placeholder text "Demo video uskoro" with email signup form "Obavestite me kada je spreman" to capture leads

#### Comparison Table Section (Homepage /)

- **FR-020**: Comparison table section MUST display headline "Zašto BZR Portal?" and subheadline "Uporedite nas sa konkurencijom i manuelnim procesom"
- **FR-021**: Comparison table MUST include columns: "Funkcionalnost", "BZR Portal", "bzrplatforma.rs", "Manuelni proces"
- **FR-022**: Comparison table MUST include minimum 5 feature rows:
  - AI generisanje dokumenata (BZR Portal: ✓ DA, bzrplatforma.rs: ✗ NE, Manuelni: ✗ NE)
  - Mobile OCR skeniranje (BZR Portal: ✓ DA, bzrplatforma.rs: ✗ NE, Manuelni: ✗ NE)
  - Offline mod (PWA) (BZR Portal: ✓ DA, bzrplatforma.rs: ✗ NE, Manuelni: ✗ NE)
  - Kamera integracija za opremu (BZR Portal: ✓ DA, bzrplatforma.rs: ✗ NE, Manuelni: ✗ NE)
  - QR kod skeniranje (BZR Portal: ✓ DA, bzrplatforma.rs: ✗ NE, Manuelni: ✗ NE)
- **FR-023**: Comparison table MUST use visual indicators: green checkmark icon (✓) with text "DA" for yes, red X icon (✗) with text "NE" for no, ensuring color is not sole indicator (WCAG AA compliance)
- **FR-024**: Comparison table MUST be responsive: desktop (full table), tablet (horizontal scroll if needed), mobile (redesign as comparison cards - one competitor per card with accordion/tabs OR horizontal scroll with sticky first column)

#### Features Overview Section (Homepage /)

- **FR-025**: Features overview section MUST display 4-6 feature highlights with icons and brief descriptions: (1) Risk Assessment (E×P×F calculation), (2) AI Document Generation, (3) Multi-Tenancy (data isolation), (4) RBAC (role permissions), (5) Mobile PWA, (6) Wasabi storage
- **FR-026**: Each feature highlight MUST include: icon, headline (2-4 words), description (1-2 sentences), optional "Saznajte više" link to /features page with anchor (e.g., /features#risk-assessment)
- **FR-027**: Features overview MUST be responsive: desktop (2 columns or 3 columns), tablet (2 columns), mobile (1 column stacked)

#### Pricing Section (Homepage / and /pricing route)

- **FR-028**: Pricing section MUST display two pricing tiers as cards: (1) Trial (Probni plan), (2) Professional (Profesionalni plan)
- **FR-029**: Trial pricing card MUST include: headline "Probni plan", price "Besplatno 14 dana", feature list (1 kompanija, 3 radna mesta, 5 dokumenata, sve AI funkcije, mobile OCR), CTA button "Počnite besplatno" linking to /register
- **FR-030**: Professional pricing card MUST include: headline "Profesionalni plan", price "3.000-6.000 RSD/mesec" with asterisk footnote "*Cena zavisi od broja zaposlenih", feature list (Neograničene kompanije, neograničena radna mesta, neograničeni dokumenti, sve AI funkcije, prioritetna podrška, offline mod), CTA button "Kontaktirajte nas" linking to /contact OR "Izaberite plan" linking to /register with plan selection
- **FR-031**: Pricing section MUST include pricing tiers explanation (tooltip or expandable section): "Cena zavisi od broja zaposlenih: 0-50 zaposlenih: 3.000 RSD/mesec, 51-200: 4.500 RSD/mesec, 201+: 6.000 RSD/mesec"
- **FR-032**: Pricing cards MUST be responsive: desktop (2 columns side-by-side with Professional plan visually emphasized), tablet (2 columns), mobile (1 column stacked with Professional plan first)

#### Testimonials / Social Proof Section (Homepage /)

- **FR-033**: Testimonials section MUST display 2-3 customer testimonials (placeholder content for MVP until real customers available): quote text, customer name, job title, company name (anonymized if needed), optional photo
- **FR-034**: If no real testimonials available for MVP, section MUST display placeholder: "Uskoro: Reference naših klijenata" with email signup form OR omit section entirely until post-launch
- **FR-035**: Testimonials MUST be responsive: desktop (3 columns or carousel), tablet (2 columns or carousel), mobile (1 column or carousel)

#### FAQ Section (Homepage /)

- **FR-036**: FAQ section MUST display accordion-style list with minimum 5-8 common questions and answers in Serbian Cyrillic:
  - "Kako radi AI generisanje dokumenata?" → "AI analizira opis radnog mesta, predlaže relevantne hazarde, E×P×F vrednosti, i korektivne mere. BZR službenik može da pregleda i izmeni sve predloge pre generisanja finalnog dokumenta."
  - "Da li je platforma usklađena sa srpskim zakonima o BZR?" → "Da, svi generisani dokumenti prate strukturu iz Pravilnika o preventivnim merama i Zakona o BZR."
  - "Kako radi mobile OCR skeniranje?" → "Fotografišite papirni dokument telefonom, AI OCR ekstraktuje tekst, i strukturirani podaci se automatski čuvaju u bazi."
  - "Šta je uključeno u besplatni trial?" → "14 dana besplatno, 1 kompanija, 3 radna mesta, 5 dokumenata, sve AI funkcije."
  - "Koliko košta posle trial perioda?" → "3.000-6.000 RSD/mesec u zavisnosti od broja zaposlenih."
  - "Da li platforma radi offline?" → "Da, PWA mod omogućava popunjavanje formi bez interneta, a podaci se sinhronizuju kada se vratite online."
  - "Kako je obezbeđena sigurnost podataka?" → "PostgreSQL RLS (Row-Level Security), RBAC, JMBG enkripcija (AES-256-GCM), multi-tenancy izolacija."
  - "Mogu li da izvezem podatke?" → "Da, podržavamo DOCX izvoz Akta o Proceni Rizika, Excel izvoz (opciono), i GDPR data export."
- **FR-037**: FAQ accordion items MUST expand/collapse on click, with smooth animation (max 300ms), and only one item open at a time (accordion behavior) OR allow multiple items open (collapsible behavior) - choose based on UX testing
- **FR-038**: FAQ section MUST include "Nemate odgovor na svoje pitanje?" text with link to /contact page

#### Call-to-Action (CTA) Section (Homepage /)

- **FR-039**: Homepage MUST include final CTA section (after FAQ, before footer) with headline "Spremni da automatizujete BZR procese?", subheadline "Počnite besplatno danas - bez kreditne kartice", and CTA button "Počnite besplatno (14 dana)" linking to /register
- **FR-040**: CTA section background MUST use contrasting color (e.g., dark background with white text) to stand out from rest of page, ensuring WCAG AA contrast ratio

#### /features Route (Detailed Features Page)

- **FR-041**: /features page MUST display hero section with headline "Sve funkcionalnosti BZR Portal platforme" and subheadline "Automatizacija, AI, mobile-first, i pravna usaglašenost"
- **FR-042**: /features page MUST include detailed sections (each with heading, description, screenshots/illustrations, and list of capabilities):
  - **Risk Assessment**: E×P×F calculation, hazard database (Serbian hazard types), risk matrix (R < Ri validation), high-risk flagging (R > 70)
  - **AI Document Generation**: Akt o Proceni Rizika structure (FR-034 through FR-042 from main spec), AI suggestions (hazards, corrective measures), DeepSeek R1/Claude integration
  - **Mobile-First & OCR**: Responsive design (375px+), PWA offline mode, camera integration (document scanning, equipment photos), QR code scanning
  - **Security & Compliance**: Multi-tenancy isolation (RLS), RBAC (4 roles), JMBG encryption, GDPR compliance (data export, deletion, audit trail)
  - **Multi-Tenancy & RBAC**: Company isolation, 4 user roles (Admin, BZR Officer, HR Manager, Viewer), role permissions matrix
- **FR-043**: Each feature section on /features page MUST include anchor link for deep linking (e.g., /features#risk-assessment) to enable navigation from homepage
- **FR-044**: /features page MUST be responsive with same breakpoints as homepage (375px mobile, 768px tablet, 1024px desktop, 1920px wide desktop)

#### /pricing Route (Pricing Page)

- **FR-045**: /pricing page MUST display same pricing cards as homepage pricing section (Trial, Professional) with additional details if needed
- **FR-046**: /pricing page MAY include pricing FAQ section (separate from homepage FAQ) with billing-specific questions: "Kako se naplaćuje?", "Mogu li da prođem sa Trial na Professional?", "Koje metode plaćanja podržavate?"

#### /about Route (About Page)

- **FR-047**: /about page MUST display company mission/vision section with headline "Naša misija" and description explaining why BZR Portal was created (e.g., "Automatizujemo BZR procese sa AI da bi BZR službenici mogli da se fokusiraju na bezbednost zaposlenih umesto administraciju.")
- **FR-048**: /about page MUST display company story section with brief history (founders' background, problem they solved, vision for Serbian BZR market)
- **FR-049**: /about page MAY include team section (optional for MVP) with photos and bios of founders/key team members
- **FR-050**: /about page MUST include CTA section at end: "Želite da saznate više?" with button linking to /contact or /register

#### /contact Route (Contact Page)

- **FR-051**: /contact page MUST display contact form with fields: Ime (text input, required), Email (email input, required, validated), Kompanija (text input, optional), Poruka (textarea, required, min 10 characters), "Pošalji" submit button
- **FR-052**: Contact form MUST validate inputs on submit: email format (RFC 5322), required fields not empty, display inline error messages in Serbian Cyrillic (e.g., "Email adresa nije validna", "Ovo polje je obavezno")
- **FR-053**: Contact form MUST display success message after submit: "Poruka je poslata. Odgovorićemo u roku od 24 sata." and clear form fields
- **FR-054**: Contact form submit MUST send email notification to BZR Portal support team (info@bzrportal.rs or support@bzrportal.rs) with form data (Name, Email, Company, Message) using Resend email service
- **FR-055**: /contact page MUST display alternative contact methods: email address (clickable mailto: link), phone number (optional, clickable tel: link), business address (optional, with Google Maps embed or link)
- **FR-056**: /contact page MAY include "Često postavljana pitanja" link to homepage FAQ section as alternative to form submission

#### Design System & Responsiveness

- **FR-057**: All landing pages MUST be mobile-first responsive with breakpoints: 375px (iPhone SE minimum), 768px (tablet), 1024px (small desktop), 1920px (wide desktop)
- **FR-058**: All landing pages MUST use shadcn/ui components (Button, Card, Accordion, Dialog, Input, Textarea, Label, etc.) styled with Tailwind CSS
- **FR-059**: All landing pages MUST display text in Serbian Cyrillic (sr-Cyrl-RS locale) with UTF-8 encoding
- **FR-060**: All interactive elements (buttons, links, form inputs) MUST have minimum 44×44px touch target size on mobile for WCAG AA compliance
- **FR-061**: All color combinations MUST meet WCAG AA contrast ratio minimum (4.5:1 for normal text, 3:1 for large text 18pt+)
- **FR-062**: All images/videos MUST have descriptive `alt` text in Serbian Cyrillic for screen readers
- **FR-063**: All form inputs MUST have associated `<label>` elements with `for` attribute linking to input `id`
- **FR-064**: All landing pages MUST support keyboard navigation: Tab (next element), Shift+Tab (previous element), Enter (activate button/link), Escape (close modal/drawer)

#### Performance & SEO

- **FR-065**: Homepage initial page load MUST be under 3 seconds on 4G connection (target: 1.5 seconds) measured by Lighthouse performance score
- **FR-066**: All landing pages MUST include meta tags for SEO: `<title>` (unique per page), `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">` (Open Graph for social sharing)
- **FR-067**: All landing pages MUST include structured data (JSON-LD schema.org markup) for Organization, WebPage, and FAQPage (for FAQ section)
- **FR-068**: All landing pages MUST be crawlable by search engines: no `noindex` meta tag, server-rendered or pre-rendered HTML (not client-side only React), sitemap.xml generated
- **FR-069**: Demo video file size MUST be optimized: max 5MB for hero section short video, max 15MB for detailed demo video, use modern codecs (H.264 or VP9), provide multiple resolutions for adaptive streaming if possible

### Key Entities

This feature primarily involves **static content and UI components** rather than database entities. However, it will interact with existing entities for CTAs and dynamic content:

- **User**: Referenced by registration CTA buttons linking to /register (existing entity from auth system)
- **Company**: Referenced in pricing explanation ("Cena zavisi od broja zaposlenih" - company size determines tier)
- **ContactFormSubmission** (new entity for MVP): Represents contact form submissions from /contact page
  - Attributes: id, name (text), email (email), company_name (text, optional), message (text), submitted_at (timestamp), status (new/read/replied)
  - Used for: Storing contact form submissions for sales/support follow-up

## Success Criteria

### Measurable Outcomes

- **SC-001**: Visitors can understand platform value within 15 seconds of landing on homepage (measured by heatmap analysis showing 80%+ scroll past hero section, indicating engagement)
- **SC-002**: Homepage loads in under 3 seconds on 4G connection for 95% of visitors (measured by Vercel Analytics or Google PageSpeed Insights)
- **SC-003**: Mobile visitors (375px-767px) can navigate entire landing page without horizontal scrolling or pinch-to-zoom (measured by manual testing on iPhone SE, Samsung Galaxy A series)
- **SC-004**: Comparison table clearly differentiates BZR Portal from bzrplatforma.rs - 90%+ of user testing participants can name 3+ advantages after viewing (measured by post-launch user testing with 10 BZR officers)
- **SC-005**: Landing page converts 10%+ of visitors to trial signups within first 30 days post-launch (measured by analytics funnel: homepage visits → /register clicks → completed registrations)
- **SC-006**: Contact form submissions receive response from support team within 24 hours for 95%+ of inquiries (measured by timestamp between submission and first reply)
- **SC-007**: All landing pages achieve Lighthouse scores: Performance ≥90, Accessibility ≥95, Best Practices ≥90, SEO ≥90 (measured by Lighthouse CI in deployment pipeline)
- **SC-008**: Zero critical or high-severity accessibility violations detected by axe DevTools on all landing pages (measured by automated accessibility testing)
- **SC-009**: Serbian Cyrillic text renders correctly on all tested browsers and devices - no missing characters (Ђ, Ћ, Љ, Њ, Џ, Ж, Ш) or font fallback issues (measured by manual cross-browser testing)
- **SC-010**: Demo video (if included in MVP) is viewed by 40%+ of homepage visitors who scroll past hero section (measured by video player analytics - play button clicks / section views)

## Assumptions

- **Demo video production**: Assumes demo video will be created post-initial MVP deployment (placeholder image/illustration used initially). If video production timeline is longer, homepage can launch without video and add it later via content update.
- **Testimonials availability**: Assumes real customer testimonials not available for MVP launch. Section will use placeholder text "Uskoro: Reference naših klijenata" OR be omitted entirely until 3-5 pilot customers provide feedback.
- **Pricing tiers**: Assumes pricing structure (3000-6000 RSD/month based on employee count) is confirmed by business stakeholders. If pricing model changes (e.g., per-user pricing, flat rate), pricing section content will need update but structure remains same.
- **Legal pages (Privacy Policy, Terms of Service)**: Assumes these will be placeholder links in MVP footer, to be written by legal counsel before public launch. Footer links can point to /privacy-policy and /terms-of-service routes with "Coming soon" placeholder pages.
- **Competitor comparison accuracy**: Assumes bzrplatforma.rs feature list (no AI generation, no mobile OCR, no offline mode, no QR codes) is accurate as of January 2025. Comparison table should be reviewed quarterly to ensure accuracy if competitor adds features.
- **Brand assets (logo, colors, fonts)**: Assumes brand identity (logo, primary/secondary/accent colors, font choices) will be defined by design team. If not ready, MVP can use placeholder logo (text-based "BZR Portal") and default Tailwind color palette (e.g., blue-600 primary, slate-800 text).
- **Email sending for contact form**: Assumes Resend email service is already configured in backend (per constitution: "Email: Resend (transactional email service)"). If not, contact form can store submissions in database without sending email, and admin views submissions via future admin panel.
- **SEO content optimization**: Assumes initial content (headlines, descriptions, meta tags) written by developer/PM. Post-launch SEO audit by marketing specialist may require content refinements for better keyword targeting and conversion optimization.
