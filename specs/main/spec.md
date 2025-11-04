# Feature Specification: BZR Portal - AI-Powered Risk Assessment Platform

**Feature Branch**: `main`
**Created**: 2025-10-21
**Status**: MVP Development Phase
**Input**: Complete SaaS platform for Occupational Health & Safety Risk Assessment

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Work Position Risk Assessment (Priority: P1) 🎯 MVP

A BZR officer needs to create a complete Risk Assessment Act (Akt o proceni rizika) for a single work position, generating a legally compliant Word document.

**Why this priority**: This is the core value proposition - transforming manual Word/Excel workflows into automated, AI-assisted document generation. It represents the minimum viable product that delivers immediate business value.

**Independent Test**: User can input company details, define one work position, assess risks with E×P×F methodology, and download a complete, legally compliant DOCX document matching Serbian regulatory requirements.

**Acceptance Scenarios**:

1. **Given** a new company without any data, **When** user enters company information (name, address, activity code, director, BZR officer), **Then** company profile is saved and available for document generation
2. **Given** a saved company profile, **When** user creates a work position with job description, required education, and work hours, **Then** position is saved with all mandatory fields
3. **Given** a defined work position, **When** user selects hazards from the standardized code list (06, 07, 10, 15, 16, 29, 33, 34, 35, 36, etc.), **Then** selected hazards are associated with the position
4. **Given** selected hazards, **When** user inputs initial risk values (E, P, F from 1-6) and corrective measures, **Then** system calculates Ri = E × P × F automatically
5. **Given** corrective measures defined, **When** user inputs residual risk values (E, P, F), **Then** system calculates R = E × P × F and validates R < Ri
6. **Given** residual risk R > 70, **When** calculation completes, **Then** system displays warning that position has "increased risk" requiring immediate action
7. **Given** complete risk assessment data, **When** user clicks "Generate Document", **Then** system produces downloadable DOCX file formatted according to Serbian legal template structure
8. **Given** generated document, **When** opened in Microsoft Word, **Then** document contains all sections: company info, position details, risk assessment tables, PPE recommendations, training requirements, medical exam schedule

---

### User Story 2 - PPE and Training Management (Priority: P2)

A BZR officer needs to define Personal Protective Equipment (PPE) requirements and training schedules for each work position based on identified risks.

**Why this priority**: Once risks are identified, the logical next step is specifying protective measures. This completes the risk mitigation cycle and is required for legal compliance.

**Independent Test**: User can add PPE items with EN standards and replacement periods, define training frequencies, and see these reflected in the generated document.

**Acceptance Scenarios**:

1. **Given** a work position with identified hazards, **When** user adds PPE items (type, EN standard, replacement period), **Then** PPE list is saved and included in document generation
2. **Given** identified risks, **When** user defines training requirements (initial, periodic, frequency), **Then** training schedule is calculated and included in output document
3. **Given** specific hazard codes, **When** user requests medical exam requirements, **Then** system recommends exam frequency based on hazard severity

---

### User Story 3 - Multiple Work Positions (Priority: P3)

A BZR officer managing a company with 10+ different work positions needs to create risk assessments for all positions efficiently.

**Why this priority**: After proving the concept with single positions, scaling to handle entire company systematizations becomes essential for real-world adoption.

**Independent Test**: User can create 10+ work positions, assess risks for each independently, and generate either individual documents per position or one consolidated document for all positions.

**Acceptance Scenarios**:

1. **Given** a company profile, **When** user creates multiple work positions (e.g., Director, Accountant, Field Worker, Driver), **Then** each position maintains separate risk assessments
2. **Given** multiple work positions defined, **When** user generates consolidated report, **Then** document includes summary table showing all positions with risk levels
3. **Given** 15+ work positions, **When** viewing position list, **Then** interface uses pagination or virtual scrolling for performance

---

### User Story 4 - AI Risk Recommendations (Priority: P4)

A BZR officer creating a risk assessment for "Office Administrator" wants AI to suggest likely hazards and corrective measures based on job description.

**Why this priority**: This adds the "AI-powered" differentiator but is not essential for MVP. It improves UX but users can still manually select hazards.

**Independent Test**: User enters job description, AI suggests 3-5 most relevant hazard codes with rationale, user can accept/reject suggestions.

**Acceptance Scenarios**:

1. **Given** job description "works 8 hours daily at computer, manages documents", **When** user requests AI suggestions, **Then** AI proposes hazards: 29 (screen work), 33 (awkward posture), 34 (stress)
2. **Given** hazard 34 (psychological stress) selected, **When** user requests mitigation suggestions, **Then** AI provides 3-5 corrective measures from knowledge base
3. **Given** AI suggestions displayed, **When** user accepts a suggestion, **Then** measure text is inserted into corrective measures field for editing

---

### User Story 5 - Excel Import (Sistematizacija) (Priority: P5)

A company has existing Excel file with job systematization (sistematizacija) listing 30 work positions with employee names and wants to import this data automatically.

**Why this priority**: This is a major time-saver for onboarding existing companies but requires robust parsing logic. Can be deferred to post-MVP.

**Independent Test**: User uploads XLSX file matching expected format, system parses and creates work positions with employee assignments, user reviews and approves import.

**Acceptance Scenarios**:

1. **Given** Excel file with columns [Position Name, Education, Experience, Male Count, Female Count], **When** user uploads file, **Then** system parses and previews extracted positions
2. **Given** import preview showing 25 positions, **When** user confirms import, **Then** all positions are created in database with correct data mapping
3. **Given** Excel file with employee names column, **When** imported, **Then** employee records are created and linked to respective positions

---

### User Story 6 - Storage Quotas & Referral System (Priority: P6 - Post-MVP)

A user wants to upgrade their account to paid tier and invite colleagues to earn additional cloud storage space for digital file backup (beyond just generated documents).

**Why this priority**: This is a viral growth mechanism (Dropbox-style referral) and retention strategy. Not essential for MVP risk assessment workflow, but critical for long-term customer acquisition and storage monetization. Deferred to Phase 4+.

**Independent Test**: User can upgrade account, receive storage quota increase, generate referral code, track referred users, and earn bonus storage while both accounts remain active paid subscriptions.

**Acceptance Scenarios**:

1. **Given** free trial account, **When** user views storage usage, **Then** system displays "1GB besplatnog prostora: {used}MB / 1GB iskorišćeno"
2. **Given** trial account approaching 1GB limit, **When** storage reaches 900MB, **Then** system shows warning: "Približavate se limitu od 1GB. Nadogradite nalog za više prostora."
3. **Given** trial account, **When** user upgrades to paid subscription, **Then** storage quota increases to 11GB (10GB base + 1GB loyalty bonus while subscription active)
4. **Given** paid account, **When** user generates referral code, **Then** system creates unique referral link: "https://bzr-portal.com/register?ref={code}"
5. **Given** referral link, **When** new user registers and upgrades to paid account, **Then** both referrer and referee receive notification: "Čestitamo! Dobili ste +5GB prostora."
6. **Given** active paid account with 3 successful referrals, **When** user views storage quota, **Then** system displays: "Ukupno: 26GB (10GB base + 1GB loyalty + 15GB referral bonusi)"
7. **Given** referred user with active paid subscription, **When** referred user cancels subscription, **Then** referrer's bonus storage (-5GB) is removed with 30-day grace period notification
8. **Given** user with 100+ referrals (viral success scenario), **When** calculating storage quota, **Then** system supports unlimited referral bonuses (e.g., 515GB = 10+1+500GB referrals)
9. **Given** paid account, **When** user uploads personal file (not generated document), **Then** file is stored in `user-files/{user_id}/{file_id}` folder on Wasabi, counted toward quota
10. **Given** user approaching storage quota, **When** uploading file would exceed limit, **Then** system shows error: "Nedovoljno prostora. Oslobodite {needed}MB ili pozovite prijatelje za dodatni prostor."

**Storage Quota Rules**:
- **Free/Trial**: 1GB (for generated documents only initially)
- **Paid Base**: 10GB
- **Loyalty Bonus**: +1GB (while paid subscription active)
- **Referral Bonus**: +5GB per successful referral (while both users have active paid subscriptions)
- **Grace Period**: 30 days after referral cancellation before bonus storage removed
- **No Referral Limit**: User can earn unlimited storage through referrals (100, 1000+ users supported)

**Future Feature (Phase 4+)**: Full digital file storage UI (upload, folders, sharing, version history) - Dropbox-like experience integrated into BZR Portal. For MVP, architecture must support this but UI deferred.

---

### Edge Cases

- What happens when user tries to save residual risk R ≥ initial risk Ri? (Validation error: "Residual risk must be lower than initial risk after corrective measures")
- What happens when user inputs E, P, or F values outside 1-6 range? (Client-side validation prevents submission)
- What happens when document generation fails mid-process? (Synchronous request retries up to 3 times with exponential backoff, user sees error modal with specific failure reason and support contact)
- What happens when user uploads Excel file with unexpected format? (Parser attempts column mapping, shows preview for user verification, flags unmapped columns)
- What happens when two users edit the same position simultaneously? (Optimistic locking with timestamp, last write wins with conflict warning)
- What happens when user tries to delete company with existing positions and documents? (Cascade confirmation dialog: "This will delete X positions and Y documents. Are you sure?")
- What happens when generated document exceeds 100 pages? (Synchronous generation may take 60-120 seconds, real-time progress indicator shows completion percentage)
- What happens when trial account reaches 3 work positions limit? (Show modal: "Dostigli ste limit od 3 radna mesta za probni nalog. Zakažite verifikaciju za neograničen pristup." with "Zakaži verifikaciju" button)
- What happens when trial account reaches 5 documents limit? (Show modal: "Dostigli ste limit od 5 generisanih dokumenata. Kontaktirajte nas za nadogradnju naloga.")
- What happens when trial period expires (14 days)? (User can log in but cannot create/edit data, see modal: "Vaš probni period je istekao. Kontaktirajte podršku za aktivaciju punog pristupa." with view-only access to existing data - users can see document metadata and previews but cannot download documents until upgrade)
- What happens when user tries to register with already-used email? (Show error: "Email adresa već postoji. Pokušajte da se prijavite ili koristite drugu email adresu.")
- What happens when user doesn't verify email within 7 days? (Verification link expires, account remains unverified and inaccessible, daily cleanup job purges unverified accounts older than 7 days, user must re-register to create new account)
- What happens when user tries to log in before verifying email? (Show error: "Molimo verifikujte email adresu. Proverite inbox za verifikacioni link (važi 7 dana)." with "Pošalji ponovo" button to resend verification email)
- What happens when user exceeds storage quota? (Upload blocked with error: "Prekoračili ste limit od {quota}GB. Oslobodite prostor ili pozovite prijatelje za +5GB po pozivu.")
- What happens when user with 50GB referral storage downgrades to free? (Grace period: 30 days to download files, then oldest files deleted to fit 1GB quota, email warnings sent at 30d, 14d, 7d, 1d before deletion)
- What happens when referred user cancels subscription? (Referrer gets email: "Korisnik {name} je otkazao pretplatu. Vaš bonus od 5GB će biti uklonjen za 30 dana osim ako ne produže pretplatu." Grace period allows re-activation)
- What happens when user tries to use someone else's referral code? (Code validated, if invalid show error: "Referral kod nije validan ili je istekao.")
- What happens when user tries to refer themselves? (Validation error: "Ne možete koristiti sopstveni referral kod.")
- What happens when 100+ users sign up via one referral code? (System supports unlimited referrals, quota calculation sums all active bonuses, database indexed on referrer_id for performance)

## Requirements *(mandatory)*

### Functional Requirements

**Core Document Generation:**
- **FR-001**: System MUST allow users to create and manage company profiles with fields: name, address, activity_code, director, bzr_responsible_person
- **FR-002**: System MUST allow users to define work positions with fields: position_name, position_code, department, required_education, required_experience, employee counts (male/female/total), work_hours, job_description
- **FR-003**: System MUST provide a checklist of standardized hazard codes (based on Serbian BZR regulations) for risk identification
- **FR-004**: System MUST calculate initial risk as Ri = E × P × F where E, P, F are integers 1-6
- **FR-005**: System MUST calculate residual risk as R = E × P × F after corrective measures
- **FR-006**: System MUST validate that residual risk R < initial risk Ri
- **FR-007**: System MUST flag positions with R > 70 as "increased risk" requiring immediate action
- **FR-008**: System MUST generate Word documents (.docx) using docx-templates library (Mustache-based templating) matching Serbian legal template structure for "Akt o proceni rizika"
- **FR-009**: System MUST include in generated documents: company info, organizational structure, position systematization, risk assessment tables (with E/P/F/R values), corrective measures, PPE lists, training schedules, medical exam requirements

**PPE & Training:**
- **FR-010**: System MUST allow users to define PPE items with fields: type, EN standard, quantity, replacement_period
- **FR-011**: System MUST allow users to define training requirements with fields: type (initial/periodic/additional), frequency (months), duration (hours)
- **FR-012**: System MUST allow users to define medical exam requirements with fields: type (preliminary/periodic/control), frequency (months), scope

**Data Management:**
- **FR-013**: System MUST persist all data to PostgreSQL database
- **FR-014**: System MUST maintain created_at and updated_at timestamps on all entities
- **FR-015**: System MUST support soft deletes with audit trail for compliance
- **FR-016**: System MUST validate all inputs using Zod schemas on both frontend and backend
- **FR-016a**: Hazard code reference data (HazardType table) MUST be managed via Drizzle database migrations stored in version control; initial seed data and regulatory updates deployed as migration files; system MUST track effective_date and deprecated_date for each hazard code

**User Interface:**
- **FR-017**: System MUST provide multi-step wizard for position creation (Basic Info → Job Description → Work Hours → Risk Assessment → PPE/Training)
- **FR-018**: System MUST display risk calculation results in real-time as user inputs E, P, F values
- **FR-019**: System MUST show visual indicators for risk levels: green (R ≤ 36), yellow (36 < R ≤ 70), red (R > 70)
- **FR-020**: System MUST provide document preview before download
- **FR-021**: System MUST use virtual scrolling for lists exceeding 50 items

**AI Features (Phase 2):**
- **FR-022**: System MUST integrate with Anthropic Claude API for hazard prediction based on job description
- **FR-023**: System MUST provide AI-suggested corrective measures for selected hazards
- **FR-024**: System MUST allow users to accept, edit, or reject AI suggestions

**Import Features (Phase 3):**
- **FR-025**: System MUST parse Excel files (.xlsx, .xls) for sistematizacija import
- **FR-026**: System MUST preview imported data before committing to database
- **FR-027**: System MUST handle import errors gracefully with clear error messages

**User Registration & Authentication:**
- **FR-028**: System MUST authenticate users via JWT-based tokens
- **FR-028a**: System MUST support hybrid registration flow: self-registration creates trial account with limited features, upgrade to full access after verification
- **FR-028b**: Trial accounts MUST allow: creating 1 company profile, 3 work positions maximum, generating up to 5 documents, 14-day trial period; after expiry, users can view document metadata and previews but cannot download documents until upgrade
- **FR-028c**: Trial accounts MUST display banner: "Probni nalog - {days} dana preostalo. Zakažite verifikaciju za pun pristup."
- **FR-028d**: System MUST provide "Zakaži verifikaciju" button that opens contact form (email/phone to sales/support)
- **FR-028e**: After verification call, support/admin MUST upgrade account to full access via admin dashboard UI (remove trial limits, set account_tier to 'full', clear trial_expiry_date); system MUST log upgrade action in audit trail with admin_user_id and timestamp
- **FR-028f**: Password requirements: minimum 8 characters, must include uppercase, lowercase, number, special character
- **FR-028g**: System MUST require email verification via confirmation link before trial account activation; verification link MUST be valid for 7 days; 14-day trial period MUST begin only after successful email verification (trial_expiry_date = verification_date + 14 days); unverified accounts created more than 7 days ago MUST be purged via daily cleanup job
- **FR-028h**: System MUST use Resend as email service provider for all transactional emails (verification links, trial expiry notifications, document deletion warnings, data export notifications, support contact forms)
- **FR-028i**: Email templates MUST be in Serbian language (Cyrillic or Latin based on user preference if implemented)
- **FR-028j**: System MUST handle email delivery failures gracefully with retry logic (up to 3 attempts with exponential backoff) and log failures for manual follow-up
- **FR-028k**: System MUST provide password reset flow: user requests reset via email, system sends unique time-limited token (valid 15-60 minutes), user clicks link to create new password, token is single-use and invalidated after successful reset

**Security & Compliance:**
- **FR-029**: System MUST implement role-based access control (RBAC) with roles: Admin, BZR Officer, HR Manager, Viewer
- **FR-030**: System MUST implement row-level security using single shared PostgreSQL database with company_id column filtering on all multi-tenant tables (users can only see their own company data)
- **FR-031**: System MUST encrypt sensitive personal data (JMBG) at rest
- **FR-032**: System MUST comply with GDPR for personal data handling (export, deletion)
- **FR-033**: System MUST maintain audit logs for all document generations and data modifications

**Storage Quotas & Referral System (Phase 4+):**
- **FR-056**: System MUST track storage usage per user in bytes (generated documents + user files)
- **FR-056a**: Free/trial accounts MUST have 1GB storage quota
- **FR-056b**: Paid accounts MUST have base 10GB + 1GB loyalty bonus (total 11GB while subscription active)
- **FR-056c**: System MUST generate unique referral code per user (8-character alphanumeric, e.g., "A3X9K2P7")
- **FR-056d**: System MUST award +5GB storage bonus to referrer when referee upgrades to paid account
- **FR-056e**: System MUST award +5GB storage bonus to referee upon paid upgrade
- **FR-056f**: Referral bonuses MUST remain active only while both referrer and referee have active paid subscriptions
- **FR-056g**: System MUST implement 30-day grace period before removing referral bonus storage after subscription cancellation
- **FR-056h**: System MUST support unlimited referral bonuses (no cap on number of referrals per user)
- **FR-056i**: System MUST calculate total storage quota dynamically: `base + loyalty + (active_referrals_count × 5GB)`
- **FR-056j**: System MUST block file uploads when storage quota exceeded with error message in Serbian
- **FR-056k**: System MUST display storage usage widget: "Iskorišćeno: {used}GB / {quota}GB ({percentage}%)"
- **FR-056l**: System MUST send email warnings at 90%, 95%, 100% storage usage thresholds
- **FR-056m**: System MUST store user files in Wasabi S3 with folder structure: `user-files/{user_id}/{file_id}.{ext}`
- **FR-056n**: System MUST track file metadata: filename, size_bytes, mime_type, upload_date, file_category (document|backup|other)
- **FR-056o**: System MUST prevent self-referral (user cannot use own referral code)
- **FR-056p**: System MUST validate referral code exists and belongs to different user before registration
- **FR-056q**: System MUST track referral relationship: referrer_id, referee_id, referral_date, referee_subscription_status, bonus_active
- **FR-056r**: System MUST implement cron job to check referral bonus eligibility daily (both users paid?) and update storage quotas
- **FR-056s**: System MUST notify referrer via email when referee cancels subscription with 30-day grace period warning
- **FR-056t**: System MUST implement downgrade storage reconciliation: if user downgrades and exceeds new quota, 30-day grace period to download files, then delete oldest files to fit quota with email warnings at 30d, 14d, 7d, 1d intervals

### Key Entities *(include if feature involves data)*

- **User**: Represents a system user; attributes include email, password_hash, first_name, last_name, role (Admin/BZR Officer/HR Manager/Viewer), company_id, account_tier (trial/full), trial_expiry_date (set to verification_date + 14 days upon email verification), email_verified (boolean), email_verification_token (nullable, expires after 7 days), email_verified_at (timestamp when verification completed), storage_quota_gb (calculated dynamically), storage_used_bytes, referral_code (unique 8-char alphanumeric), referred_by_user_id (nullable), created_at; relationships: belongs to Company, has many Referrals (as referrer), has many UserFiles
- **Company**: Represents the employer organization; attributes include name, address, activity_code, director, bzr_officer, account_tier (trial/full), trial_expiry_date, document_generation_count, work_position_count; relationships: has many WorkPositions, has many Users
- **WorkPosition**: Represents a job role within the company; attributes include position_name, position_code, department, required_education, required_experience, employee_counts, work_hours, job_description; relationships: belongs to Company, has many RiskAssessments, has many PPE items, has many Training requirements
- **HazardType**: Reference data for standardized hazard codes (06, 07, 10, 15, 29, 33, 34, 35, 36, etc.); attributes include hazard_code, hazard_category (mechanical/electrical/ergonomic/psychosocial), hazard_name_sr, hazard_description, effective_date (date code became active), deprecated_date (nullable - date code was removed from regulations); updates managed via database migrations for version control and consistency
- **RiskAssessment**: Assessment of a specific hazard for a work position; attributes include position_id, hazard_id, initial_risk (E, P, F, Ri), corrective_measures (text), residual_risk (E, P, F, R), responsible_person; relationships: belongs to WorkPosition, references HazardType
- **PPE** (Personal Protective Equipment): Protective equipment required for a position; attributes include position_id, ppe_type, ppe_standard, quantity, replacement_period; relationships: belongs to WorkPosition
- **Training**: Training requirements for a position; attributes include position_id, training_type, frequency, duration, required_before_work; relationships: belongs to WorkPosition
- **MedicalExam**: Medical examination requirements; attributes include position_id, exam_type, frequency, exam_scope; relationships: belongs to WorkPosition
- **Employee** (optional, can be anonymized): Individual worker; attributes include first_name, last_name, jmbg (encrypted), position_id, hire_date, contract_type; relationships: belongs to WorkPosition
- **Referral** (Phase 4+): Tracks referral relationships for storage bonuses; attributes include referrer_user_id, referee_user_id, referral_code_used, referral_date, referee_upgraded_date (nullable), referee_subscription_status (trial/paid/cancelled), bonus_active (boolean), bonus_expiry_date (nullable - 30 days after cancellation), created_at; relationships: referrer belongs to User, referee belongs to User
- **UserFile** (Phase 4+): Stores user-uploaded digital files (beyond generated documents); attributes include user_id, file_id (UUID), filename, file_path_s3 (`user-files/{user_id}/{file_id}.{ext}`), file_size_bytes, mime_type, file_category (document|backup|other), upload_date, last_accessed_date, is_deleted (soft delete), deleted_date; relationships: belongs to User; indexes: user_id, file_category, upload_date, is_deleted

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate a complete, legally compliant Risk Assessment Act for one work position in under 10 minutes (vs. 2-4 hours manually in Word/Excel)
- **SC-002**: Generated documents pass Serbian labor inspection review with 95%+ compliance rate (no legal rejections)
- **SC-003**: System handles 10+ concurrent users generating documents simultaneously without performance degradation (response time < 2 seconds for API calls, document generation < 60 seconds)
- **SC-004**: Risk calculation accuracy is 100% verified by automated unit tests (E × P × F formula correctness)
- **SC-005**: Document download success rate exceeds 99% (no failed generations requiring manual intervention)
- **SC-006**: User satisfaction score (NPS) exceeds 50 within first 3 months of MVP launch
- **SC-007**: MVP onboards 10 companies (pilot customers) within first 3 months
- **SC-008**: AI hazard prediction accuracy (when implemented in Phase 2) exceeds 70% relevance score based on user acceptance of suggestions
- **SC-009**: Excel import success rate (when implemented in Phase 3) exceeds 85% for files matching expected format
- **SC-010**: System achieves 80%+ code coverage for critical business logic (risk calculation, document generation, data validation)
- **SC-011** (Phase 4+): Referral program achieves 20%+ viral coefficient (average 20+ successful referrals per 100 paid users within 6 months of launch), with storage quota calculation performance < 200ms for users with 100+ referrals

---

## Clarifications

### Session 2025-10-22

- Q: What database multi-tenancy model should be used for data isolation? → A: Single shared database with company_id filtering
- Q: Should document generation be synchronous (user waits) or asynchronous (background job with notification)? → A: Synchronous with streaming/progress
- Q: Which Node.js library should be used for DOCX generation? → A: docx-templates (template-based)
- Q: How should user registration work (open self-registration vs admin-invited vs hybrid)? → A: Hybrid (self-registration creates trial, upgrade after verification)
- Q: What cloud platform should be used for deployment? → A: Vercel

### Session 2025-10-27

- Q: When a document generation or data save operation fails mid-process, how should the system handle partial state? → A: Partial rollback - Keep user input data, rollback only document generation attempts, show specific error with retry option
- Q: For MVP deployment with 10 pilot companies and expected 30-50 concurrent users, what should be the initial PostgreSQL connection pool configuration? → A: Balanced MVP - 10-20 connections
- Q: What monitoring and observability solution should be used for MVP? → A: Platform-native - Vercel Analytics + native logging
- Q: Which email service provider should be used for transactional emails (verification, notifications)? → A: Resend
- Q: Which PostgreSQL service provider should be used for MVP database? → A: Supabase
- Q: Which storage service should be used for generated documents? → A: Wasabi (S3-compatible, no egress fees)
- Q: What is the budget constraint for deployment infrastructure during MVP phase? → A: MUST use Vercel Free plan until ~100 paying customers; upgrade to paid services only after achieving revenue milestone
- Q: What is the storage quota and referral incentive model? → A: Free users get 1GB, paid users get 11GB (10GB base + 1GB loyalty), +5GB per referral (unlimited), bonuses active only while both users have paid subscriptions, 30-day grace period on cancellation. Dropbox-style viral growth mechanism - users can store personal files beyond just generated documents (Phase 4+)

### Session 2025-10-29

- Q: How should the system handle password recovery when users forget their passwords? → A: Time-limited token via email (send unique link valid 15-60 minutes, user creates new password)
- Q: When trial account expires after 14 days, can users download previously generated documents? → A: View-only, no downloads (users can see document metadata and previews, but download button disabled until upgrade)
- Q: How should admins upgrade trial accounts to full access after verification? → A: Admin dashboard UI with audit trail (dedicated admin panel with "Upgrade Account" button, logs action with timestamp and admin user_id)
- Q: How should hazard code reference data be updated when regulations change? → A: Database migrations with version control (hazard codes seeded/updated via Drizzle migration files, deployed with code releases)
- Q: When does the 14-day trial period countdown begin, and how long is the email verification link valid? → A: Verification required, trial starts after verification (user must verify email within 7 days, then 14-day trial period begins; verification link valid 7 days)

---

## Legal Compliance Framework

**Legal Basis**: Zakon o bezbednosti i zdravlju na radu (Sl. glasnik RS br. 101/2005, 91/2015 - dr. zakon, 113/2017 - dr. zakon)

**Regulatory References**:
- Pravilnik o preventivnim merama za bezbedan i zdrav rad pri korišćenju sredstava rada (Sl. glasnik RS br. 23/2009, 83/2014, 5/2018)
- Pravilnik o sadržini i načinu vođenja evidencija u oblasti bezbednosti i zdravlja na radu (Sl. glasnik RS br. 62/2008)

### Legal Requirements Traceability

**LR-001** [Član 8, Zakon o BZR]: Poslodavac je dužan da izvrši procenu rizika na radnom mestu i da sačini dokument - Akt o proceni rizika
- **System Requirement**: FR-008 - System MUST generate "Akt o proceni rizika" document

**LR-002** [Član 9, stav 1, Zakon o BZR]: Akt o proceni rizika sadrži, naročito:
1. Podatke o poslodavcu i licu koje je izvršilo procenu rizika
2. Opis radnih mesta, metoda, opreme i materijala koji se koriste
3. Podatke o opasnostima i štetnostima identifikovanim u procesu procene rizika
4. Podatke o radnim mestima sa povećanim rizikom (R > 70)
5. Planove i mere za otklanjanje ili smanjenje rizika
6. Rokove za sprovođenje mera
7. Lica odgovorna za sprovođenje mera
- **System Requirement**: FR-009, FR-034 through FR-044 (see Mandatory Document Sections below)

**LR-003** [Član 11, Zakon o BZR]: Poslodavac je dužan da radniku pre stupanja na rad obezbedi obuku i osposobljavanje za bezbedan i zdrav rad
- **System Requirement**: FR-011 - Training requirements specification

**LR-004** [Član 32, stav 1, Zakon o BZR]: Poslodavac je dužan da izvrši procenu rizika najmanje jednom u dve godine
- **System Requirement**: FR-045 - Document update/revision tracking

**LR-005** [Član 32, stav 2, Zakon o BZR]: Poslodavac je dužan da odmah pristupi dopuni ili izmeni procene rizika kada dođe do promena u procesu rada
- **System Requirement**: FR-046 - Trigger-based document regeneration

**LR-006** [Član 19, Zakon o BZR]: Poslodavac je dužan da obezbedi sredstva i opremu za ličnu zaštitu zaposlenih
- **System Requirement**: FR-010 - PPE specification per hazard type

**LR-007** [Član 22, Zakon o BZR]: Poslodavac je dužan da obezbedi lekarsku proveru radnika pre zasnivanja radnog odnosa
- **System Requirement**: FR-012 - Medical exam requirements

---

## Risk Assessment Methodology

### Risk Calculation Formula

**RM-001**: Risk score MUST be calculated using the formula: **R = E × P × F**

Where:
- **E** = Posledice (Consequences) - severity of potential injury/harm
- **P** = Verovatnoća (Probability) - likelihood of hazard occurrence
- **F** = Učestalost (Frequency) - frequency of exposure to hazard

**RM-002**: All parameters (E, P, F) MUST be integers in range 1-6 (inclusive)

**RM-003**: Initial risk (Ri) MUST be calculated before applying corrective measures

**RM-004**: Residual risk (R) MUST be calculated after applying corrective measures

**RM-005**: System MUST enforce: **R < Ri** (residual risk must be lower than initial risk)

### E - Posledice (Consequences) Value Definitions

**E-001**: System MUST interpret E values as follows per Serbian BZR practice:

| E Value | Serbian Term | Description | Examples |
|---------|--------------|-------------|----------|
| 1 | Neznatne povrede | Minor injuries requiring first aid | Ogrebotine, površinske posekotine, modrice |
| 2 | Male povrede | Minor injuries requiring medical attention | Dublje posekotine, ubodi, laki uganuca |
| 3 | Srednje povrede | Moderate injuries requiring hospitalization | Prelomi prstiju, opekotine II stepena, teži uganuca |
| 4 | Teške povrede | Severe injuries causing long-term effects | Višestruki prelomi, opekotine III stepena, gubitak prsta |
| 5 | Vrlo teške povrede | Critical injuries causing permanent disability | Amputacija udova, gubitak vida/sluha, teško oštećenje unutrašnjih organa |
| 6 | Smrtni ishod | Fatality | Smrt radnika |

**E-002**: System MUST display Serbian term and description when user selects E value

**E-003**: System MUST provide examples for each E level to guide user selection

### P - Verovatnoća (Probability) Value Definitions

**P-001**: System MUST interpret P values as follows per Serbian BZR practice:

| P Value | Serbian Term | Percentage | Description |
|---------|--------------|------------|-------------|
| 1 | Praktično nemoguće | < 0.1% | Scenario is theoretically possible but never observed in practice |
| 2 | Moguće u izuzetnim okolnostima | 0.1% - 1% | Requires multiple simultaneous failures or extreme conditions |
| 3 | Malo verovatno, ali moguće | 1% - 10% | Could happen occasionally under specific circumstances |
| 4 | Verovatno | 10% - 50% | Likely to occur during work activities |
| 5 | Vrlo verovatno | 50% - 90% | Expected to happen regularly without preventive measures |
| 6 | Gotovo sigurno | > 90% | Will occur unless specific preventive action taken |

**P-002**: System MUST display Serbian term and percentage range when user selects P value

### F - Učestalost (Frequency) Value Definitions

**F-001**: System MUST interpret F values as follows per Serbian BZR practice:

| F Value | Serbian Term | Time Period | Examples |
|---------|--------------|-------------|----------|
| 1 | Retko | Godišnje ili ređe | Annual equipment inspections, rare operations |
| 2 | Povremeno | Mesečno | Monthly maintenance tasks, occasional duties |
| 3 | Često | Nedeljno | Weekly reporting, regular team meetings |
| 4 | Dnevno | Svaki radni dan | Daily computer use, routine operations |
| 5 | Satno | Više puta dnevno | Constant phone calls, frequent lifting |
| 6 | Stalno | Kontinuirano tokom smene | Continuous screen work, standing throughout shift |

**F-002**: System MUST display Serbian term and time period when user selects F value

### Risk Level Interpretation

**RL-001**: System MUST categorize calculated risk score (R) into three levels:

| Risk Score (R) | Risk Level | Serbian Term | Visual Indicator | Required Action |
|----------------|------------|--------------|------------------|-----------------|
| R ≤ 36 | Low Risk | Nizak rizik | Green badge | Monitor and maintain current controls |
| 36 < R ≤ 70 | Medium Risk | Srednji rizik | Yellow badge | Implement additional controls, review periodically |
| R > 70 | High Risk | Povećan rizik | Red badge | IMMEDIATE action required - position flagged per Član 9 |

**RL-002**: System MUST flag all positions with R > 70 as "Radna mesta sa povećanim rizikom" per Član 9, stav 1, tačka 4

**RL-003**: For positions with R > 70, system MUST require:
- Mandatory corrective measures before worker assignment
- Increased frequency of medical exams (minimum every 12 months)
- Special training requirements (documented and approved)
- Enhanced supervision and monitoring

**RL-004**: System MUST prevent saving risk assessment where R > 70 unless user confirms immediate action plan

---

## Mandatory Document Sections

Per Član 9 and Pravilnik 5/2018, generated "Akt o proceni rizika" MUST contain following sections:

### FR-034: Document Cover Page
**Legal Basis**: Pravilnik 5/2018, Opšta forma dokumenta

System MUST generate cover page containing:
- Document title: "АКТ О ПРОЦЕНИ РИЗИКА" (Cyrillic, bold, centered)
- Company name (naziv preduzeca)
- Company address (sedište)
- Document generation date (datum izrade)
- Document validity period (važnost dokumenta: 2 years per Član 32)
- Version number (if revision)

### FR-035: Section 1 - Uvod (Introduction)
**Legal Basis**: Član 9, stav 1

System MUST include introduction section containing:
- Pravni osnov: Full citation of Zakon 101/2005, 91/2015, 113/2017 and Pravilnik 5/2018
- Svrha dokumenta: Statement of purpose - risk assessment per legal obligations
- Obuhvat procene: Scope - all work positions in company systematization

### FR-036: Section 2 - Podaci o poslodavcu (Employer Data)
**Legal Basis**: Član 9, stav 1, tačka 1

System MUST include employer data section containing:
- Naziv i sedište (company name and address) - from Company.name, Company.address
- PIB (tax ID) - from Company.pib (9 digits, validated)
- Matični broj (registration number) - from Company.registration_number
- Šifra delatnosti (activity code) - from Company.activity_code (4 digits, validated)
- Direktor (director name) - from Company.director
- Lice odgovorno za BZR (BZR officer) - from Company.bzr_responsible_person (must include title/credentials)

**FR-036a**: If Company.organization_chart_url exists, system MUST include organizational chart image in this section

### FR-037: Section 3 - Organizaciona struktura (Organizational Structure)
**Legal Basis**: Implicit requirement for context

System MUST include:
- Šema organizacije (org chart image if available, or text list)
- Seznam organizacionih celina (list of departments from WorkPosition.department unique values)

### FR-038: Section 4 - Sistematizacija radnih mesta (Position Systematization)
**Legal Basis**: Član 9, stav 1, tačka 2

System MUST include table with ALL work positions containing columns:
- Redni broj (sequential number)
- Naziv radnog mesta (position name)
- Šifra radnog mesta (position code, if defined)
- Organizaciona celina (department)
- Broj izvršilaca (employee counts: M / Ž / Ukupno)
- Stručna sprema (required education)
- Radno iskustvo (required experience)
- Radno vreme (work hours: dnevno/nedeljno)

### FR-039: Section 5 - Procena rizika po radnim mestima (Risk Assessment by Position)
**Legal Basis**: Član 9, stav 1, tačke 3, 4, 5

For EACH work position, system MUST generate subsection containing:

**FR-039a - Snimanje organizacije rada**:
- Broj zaposlenih (male/female/total counts)
- Uslovi za zasnivanje radnog odnosa (education, experience)
- Osp osposobljavanje za BZR (training requirements from Training table)
- Lekarski pregledi (medical exam requirements from MedicalExam table)
- Raspored radnog vremena (work hours, shifts, night work flags)

**FR-039b - Opis radnog procesa**:
- Opis poslova (job description from WorkPosition.job_description)
- Radni prostor (workspace from WorkPosition.workspace)
- Oprema za rad (equipment from WorkPosition.equipment_used array)

**FR-039c - Prepoznavanje opasnosti i štetnosti**:
- Checklist of all hazard codes selected for this position (HazardType.hazard_code + hazard_name_sr)

**FR-039d - Tabela procene rizika** (Risk Assessment Table):

System MUST generate table with columns:
- R.br. (row number)
- Šifra opasnosti (hazard code)
- Naziv opasnosti (hazard name in Serbian)
- Inicijalni rizik: E, P, F, Ri = E×P×F
- Primenjene mere (corrective measures text)
- Rezidual rizik: E, P, F, R = E×P×F
- Odgovorno lice (responsible person)

**FR-039e - Zakључci**:
- Analiza rezultata (summary of risk levels)
- Nivo rizika (low/medium/high count)
- Lista LZO (PPE items from PPE table: type, EN standard, quantity, replacement period)
- Oспособљavање (training summary: type, frequency, duration)
- Medicinske препоруке (medical exam summary: type, frequency)
- **IF R > 70**: Explicit statement "Radno mesto sa povećanim rizikom" with mandated immediate actions

### FR-040: Section 6 - Zbirni prikaz (Summary)
**Legal Basis**: Pravilnik 5/2018, Best practice

System MUST include summary section containing:

**FR-040a - Tabela svih radnih mesta sa nivoom rizika**:
- Table showing all positions with their highest residual risk score
- Sorted by risk level (high → medium → low)

**FR-040b - Lista radnih mesta sa povećanim rizikom**:
- Explicit list of all positions where R > 70
- Total count of employees on high-risk positions

**FR-040c - Plan mera**:
- Consolidated list of all corrective measures across all positions
- Prioritized by risk level
- Assigned responsible persons
- Target completion dates

**FR-040d - Plan obuka**:
- Training plan summary for all positions
- Grouped by training type (initial/periodic/additional)
- Scheduled dates for next training cycles

**FR-040e - Plan lekarskih pregleda**:
- Medical exam schedule for all positions
- Grouped by exam type (preliminary/periodic/control)
- Frequencies specified

### FR-041: Section 7 - Prilozi (Appendices)
System MUST include:
- Ažurirana sistematizacija (updated position systematization - copy of Section 4)
- Organizaciona šema (org chart if available)
- Liste evidencija (reference to external records: Obrazac 6 for training, medical exam records)

### FR-042: Section 8 - Verifikacija (Verification & Signatures)
**Legal Basis**: Član 9, Official document requirements

System MUST include signature block with:
- Sastavio (Prepared by): [BZR officer name from Company.bzr_responsible_person]
  - Datum: [Generation date]
  - Potpis: ___________________ (signature line)
- Odobrio (Approved by): [Director name from Company.director]
  - Datum: ___________________
  - Potpis: ___________________
- Mesto za pečat i datum (company stamp and date)

**FR-042a**: System MUST leave blank signature/date lines for manual signing (legal requirement - electronic signatures not yet accepted for Akt)

---

## Detailed Validation Requirements

### FR-043: Company Data Validation

**FR-043a - Name validation**:
- MUST NOT be empty
- MUST be 3-255 characters
- MUST be in UTF-8 (Cyrillic or Latin Serbian)

**FR-043b - PIB validation**:
- MUST be exactly 9 digits
- MUST pass modulo-11 checksum algorithm per Serbian tax authority rules
- System MUST validate checksum: `PIB[8] = (11 - ((7×PIB[0] + 6×PIB[1] + 5×PIB[2] + 4×PIB[3] + 3×PIB[4] + 2×PIB[5] + 7×PIB[6] + 6×PIB[7]) mod 11)) mod 11`
- **Implementation**: See backend/src/validation/pib-validator.ts (Task T057a)
- IF validation fails: Error message "PIB broj nije validan. Proverite unos." (Serbian Cyrillic)

**FR-043c - Activity code validation**:
- MUST be exactly 4 digits
- MUST match official Serbian classification of activities (KD 2010)
- IF validation fails: Error message "Šifra delatnosti mora biti 4 cifre (npr. 8130 za uređenje i održavanje bašta i parkova)"

**FR-043d - JMBG validation** (if Employee records used):
- MUST be exactly 13 digits
- MUST follow JMBG format: DDMMYYYRRBBBC where DD=day, MM=month, YYY=year-1900, RR=region, BBB=sequence, C=checksum
- System MUST validate checksum per JMBG algorithm
- IF validation fails: Error message "JMBG nije validan. Proverite format."

### FR-044: Risk Assessment Validation

**FR-044a - E, P, F range validation**:
- MUST reject values < 1 or > 6
- Error message: "Vrednost mora biti između 1 i 6"
- MUST prevent submission (client-side validation + server-side enforcement)

**FR-044b - R < Ri validation**:
- MUST calculate Ri = E_initial × P_initial × F_initial
- MUST calculate R = E_residual × P_residual × F_residual
- IF R ≥ Ri: MUST show error "Rezidual rizik (R={R}) mora biti manji od inicijalnog rizika (Ri={Ri}) nakon primene mera."
- MUST prevent saving until user corrects values

**FR-044c - R > 70 warning**:
- IF R > 70: MUST display modal warning (red background):
  ```
  ⚠️ UPOZORENJE - POVEĆAN RIZIK

  Rezidual rizik R={R} > 70 označava radno mesto sa povećanim rizikom.

  Prema Članu 9, Zakona o BZR, ovo radno mesto zahteva:
  - Hitne korektivne mere pre dodele radnika
  - Pojačan nadzor i praćenje
  - Češće medicinske preglede (minimum godišnje)
  - Specijalizovanu obuku

  Da li ste sigurni da želite da sačuvate ovu procenu?
  [Potvrdi] [Otkaži]
  ```

**FR-044d - Corrective measures minimum length**:
- MUST require at least 20 characters for corrective_measures text
- Error message: "Opis mera mora sadržati minimum 20 karaktera. Budite specifični."

**FR-044e - Duplicate hazard validation**:
- MUST prevent adding same hazard_id twice for same position_id
- Error message: "Ova opasnost je već procenjena za ovo radno mesto."

---

## Exception & Error Handling Requirements

### FR-045: Document Generation Failure Handling

**FR-045a - Template rendering errors**:
- Document generation MUST be synchronous (user waits for completion with progress indicator)
- System MUST use docx-templates library with Mustache syntax ({{variable}}, {{#loop}}...{{/loop}}, {{#if}}...{{/if}})
- IF Mustache template syntax error or missing variable: Log error with template variable name, show user message "Greška prilikom generisanja dokumenta. Molimo kontaktirajte podršku. (Error ID: {uuid})"
- System MUST retry up to 3 times for transient errors (network failures, temporary file system issues) with exponential backoff (1s, 2s, 4s)
- System MUST implement partial rollback strategy: Keep all user input data (company info, work positions, risk assessments, PPE, training) in database, rollback only document generation attempts, preserve form state for immediate retry
- System MUST log full error stack trace with Error ID for support debugging
- Progress indicator MUST show real-time status: "Generisanje dokumenta... 45% završeno"

**FR-045b - Missing required data**:
- IF Company missing mandatory fields: Show error "Podaci o kompaniji nisu kompletni. Molimo popunite sva obavezna polja pre generisanja dokumenta."
- IF Position missing job_description: Show warning "Opis poslova nije definisan. Dokument će sadržati prazan opis."
- IF Position has zero risk assessments: Show error "Niste dodali ni jednu procenu rizika za ovo radno mesto. Minimum jedna opasnost mora biti procenjena."

**FR-045c - Document size limits**:
- IF generated DOCX > 50 MB: Show warning "Dokument prelazi 50MB. Generisanje može potrajati do 2 minuta."
- IF generated DOCX > 100 MB: Show error "Dokument prelazi 100MB. Molimo smanjite broj radnih mesta u jednom dokumentu."

**FR-045d - Storage failure**:
- IF Wasabi S3 upload fails: Retry with exponential backoff (3 attempts: 1s, 2s, 4s)
- IF all retries fail: Return document directly to browser as download (bypass storage) and show message "Dokument je generisan ali ne može biti sačuvan u облаку. Molimo preuzmite ga odmah."
- Note: Vercel serverless functions have no persistent local storage; cannot save to backend/uploads/; must use cloud object storage (Wasabi)
- Storage quota monitoring: Track storage usage in database (document_files table with file_size_bytes column); display current usage in admin dashboard: "Iskorišćeno skladište: {used}MB / 1TB"
- Wasabi billing notes: 1TB minimum commitment ($6.99/month); no overage charges for storage below 1TB; no egress/bandwidth fees regardless of download volume

### FR-046: Concurrent Edit Conflict Handling

**FR-046a - Optimistic locking**:
- System MUST include updated_at timestamp in all update operations
- IF updated_at in database > updated_at in user's form: Show conflict warning:
  ```
  ⚠️ KONFLIKT IZMENA

  Drugi korisnik je izmenio ovo radno mesto dok ste vi radili izmene.

  Vaše izmene: [Show user's changes]
  Trenutno stanje: [Show database state]

  [Preuzmi najnovije izmene] [Zadrži moje izmene (prepiši)]
  ```

**FR-046b - Last write wins with warning**:
- System MUST allow user to proceed with their changes after reviewing conflict
- System MUST log both versions in audit trail

### FR-047: Excel Import Error Handling

**FR-047a - Unrecognized file format**:
- IF file extension not .xlsx or .xls: Show error "Fajl mora biti Excel format (.xlsx ili .xls)"
- IF file is corrupted: Show error "Fajl je oštećen ili nije validan Excel format."

**FR-047b - Missing required columns**:
- IF "Naziv radnog mesta" column missing: Show error "Excel fajl mora sadržati kolonu 'Naziv radnog mesta'"
- IF "Stručna sprema" column missing: Show warning "Kolona 'Stručna sprema' nije pronađena. Biće korišćena podrazumevana vrednost."

**FR-047c - Invalid data in cells**:
- IF employee count not numeric: Show row error "Red {n}: Broj izvršilaca mora biti broj"
- IF activity code not 4 digits: Show row error "Red {n}: Šifra delatnosti mora biti 4 cifre"

**FR-047d - Preview before commit**:
- System MUST show preview table with parsed data
- System MUST highlight validation errors in red
- User MUST explicitly confirm "Potvrdi import" before database commit

---

## Recovery & Data Management Requirements

### FR-048: Soft Delete & Audit Trail

**FR-048a - Soft delete implementation**:
- System MUST NOT physically delete records from database
- System MUST add deleted_at timestamp column to all entities
- Queries MUST exclude records where deleted_at IS NOT NULL

**FR-048b - Cascade behavior**:
- IF Company deleted: System MUST set deleted_at on all related WorkPositions, RiskAssessments, PPE, Training, MedicalExam records
- System MUST show confirmation dialog:
  ```
  ⚠️ BRISANJE KOMPANIJE

  Ova akcija će obrisati:
  - {n} radnih mesta
  - {m} procena rizika
  - {k} generisanih dokumenata

  Podaci će biti arhivirani 90 dana, nakon čega će biti trajno obrisani.

  Da li ste sigurni?
  [Da, obriši] [Otkaži]
  ```

**FR-048c - Audit log entries**:
- System MUST log: user_id, entity_type, entity_id, action (create/update/delete), timestamp, old_values (JSON), new_values (JSON)
- Audit logs MUST be retained for minimum 2 years per Član 32

**FR-048d - Data restoration**:
- System SHOULD provide admin interface to restore soft-deleted records within 90 days
- After 90 days, system MUST physically delete records (cron job)

**FR-048e - Unverified account cleanup**:
- System MUST run daily cron job to purge unverified user accounts created more than 7 days ago (email_verified = false AND created_at < NOW() - 7 days)
- System MUST hard-delete unverified accounts and associated records (no soft delete for accounts that never completed registration)

### FR-049: GDPR Data Export & Deletion

**FR-049a - Data export (Right to data portability)**:
- System MUST provide "Izvezi podatke" button in user profile
- System MUST generate ZIP file containing:
  - JSON export of all company, position, risk assessment data
  - All generated DOCX documents
  - Audit log for user's actions
- Export MUST complete within 60 seconds or provide download link via email

**FR-049b - Data deletion (Right to erasure)**:
- System MUST provide "Obriši sve moje podatke" button (requires email confirmation)
- System MUST hard-delete (not soft-delete) all personal data within 30 days
- System MUST send confirmation email after deletion

**FR-049c - JMBG encryption**:
- System MUST encrypt JMBG using AES-256-GCM
- Encryption key MUST be stored in secure key management service (not in code or .env)
- System MUST decrypt JMBG only when displaying to authorized user or generating document

### FR-050: Document Lifecycle Management

**FR-050a - Template file storage**:
- System MUST store DOCX template file (Akt_Procena_Rizika_Template.docx) in backend/templates/ directory
- Template MUST be designed in Microsoft Word with Cyrillic Serbian text and legal formatting
- Template MUST use Mustache placeholders: {{company.name}}, {{#positions}}...{{/positions}}, etc.
- Template MUST include all mandatory sections per FR-034 through FR-042
- System MUST load template file at generation time using docx-templates.createReport()
- Template file MUST be version-controlled in git repository

**FR-050b - Document storage**:
- Generated DOCX files MUST be stored in Wasabi S3-compatible object storage with pre-signed URLs
- Pre-signed URLs MUST expire after 1 hour for security
- Documents MUST be retained for 90 days minimum (per Pravilnik archival requirements)
- System MUST use AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) with custom endpoint configuration
- Wasabi endpoint configuration example: `endpoint: "https://s3.eu-central-1.wasabisys.com"` (or appropriate region)
- Storage bucket MUST be configured with company_id-based folder structure for multi-tenant isolation: `documents/{company_id}/{document_id}.docx`
- Bucket policy MUST restrict public access; only pre-signed URLs allow document downloads
- Environment variables required: `WASABI_ACCESS_KEY_ID`, `WASABI_SECRET_ACCESS_KEY`, `WASABI_BUCKET_NAME`, `WASABI_REGION`, `WASABI_ENDPOINT`
- **Wasabi pricing**: $6.99/TB/month (1TB minimum), no egress/bandwidth charges, no API request fees
- **Capacity planning**: Average document size ~500KB; 1TB = ~2,000,000 documents; MVP with 10 companies × 10 documents/month × 3 months = ~300 documents = ~150MB (well below 1TB minimum)
- **Cost efficiency**: Wasabi cheaper than alternatives at scale (no egress fees vs. Supabase $0.09/GB egress after 2GB, or Cloudflare R2 $0.36/million Class B operations)
- **Rationale**: Wasabi selected for predictable costs (flat rate, no surprise bandwidth charges), S3 compatibility (standard API, easy migration path), and long-term scalability

**FR-050c - Document retrieval**:
- User MUST be able to list all generated documents for their company
- User MUST be able to download any document within 90-day retention period
- System MUST provide "Regeneriši dokument" button to create updated version with current data

**FR-050d - Document versioning**:
- System SHOULD track document versions (v1, v2, v3...) when regenerated
- System MUST display generation timestamp and version number in document metadata
- System MUST preserve previous versions for audit purposes

**FR-050e - Automatic cleanup**:
- System MUST run daily cron job to delete documents older than 90 days
- Before deletion, system MUST send email notification: "Dokument {filename} će biti obrisan za 7 dana. Molimo preuzmite ga ako vam je potreban."

### FR-051: Document Update Triggers

**FR-051a - Mandatory revision cases** (per Član 32, stav 2):
- IF new hazard type added to national regulation: Deploy database migration with new hazard codes (INSERT with effective_date); system MUST notify all users via banner "Nova opasnost {code} dodata u pravilnik. Molimo revidiraте procenu rizika."
- IF hazard code deprecated: Deploy database migration updating deprecated_date; system continues to display deprecated codes in existing risk assessments for historical accuracy but hides from selection list for new assessments
- IF BZR law amended: System MUST display banner "Zakon o BZR izmenjen ({date}). Proverite da li su vaši dokumenti u skladu sa novim propisima."

**FR-051b - Optional revision triggers**:
- IF risk assessment data updated: System SHOULD show "Regeneriši dokument" suggestion
- IF more than 12 months since last generation: System SHOULD show reminder "Poslednji Akt generisan {date}. Prema Članu 32, minimum je revizija svake 2 godine."

---

## Non-Functional Requirements (Detailed)

### FR-052: Performance Requirements

**FR-052a - API Response Times** (95th percentile):
- GET requests (read operations): < 100ms
- POST/PUT requests (write operations): < 200ms
- DELETE requests: < 150ms
- IF exceeded: Log slow query, trigger performance alert

**FR-052b - Document Generation Times** (synchronous processing with Vercel Free plan constraint):
- Vercel Free plan serverless function timeout: 10 seconds (hard limit)
- Single position document (1-10 pages): < 8 seconds (must fit within 10s timeout)
- Multi-position document (up to 5 positions, 10-30 pages): < 9 seconds
- **Large document (6+ positions)**: System MUST use split strategy (MVP approach):
  - Generate individual DOCX per position (each generation < 8 seconds, parallelizable if needed)
  - Provide ZIP download with all position documents + consolidated summary table (PDF or single-page DOCX)
  - Display warning to user: "Dokument sadrži {n} radnih mesta. Biće generisan kao ZIP arhiva sa pojedinačnim dokumentima."
  - **Implementation**: See Task T145 (document-split.ts service) and Task T147 (consolidated generation endpoint)
- System MUST display real-time progress indicator showing completion percentage during generation
- System MUST optimize document generation: minimize template complexity, pre-compile data structures, avoid unnecessary loops
- **Budget Constraint**: MVP MUST operate on Vercel Free plan until ~100 paying customers achieved; only then migrate to Pro plan ($20/month) for 60-second timeouts
- **Post-MVP Alternatives** (after revenue milestone): Implement async job queue (BullMQ + Redis) for very large documents (10+ positions), notify user via email when ready

**FR-052c - Concurrent User Capacity**:
- System MUST handle 100 concurrent users without degradation
- Database connection pool for MVP (10 pilot companies, 30-50 concurrent users): 10-20 connections initial configuration
- Database connection pool for production scaling (100+ concurrent users): minimum 20 connections, maximum 50 connections (single shared database architecture)
- Connection pool MUST use PgBouncer or similar pooler in transaction mode for optimal resource utilization
- IF connection pool exhausted: Queue requests with 503 Service Unavailable + Retry-After header

**FR-052d - Frontend Performance**:
- Initial page load (FCP): < 1.5 seconds
- Time to Interactive (TTI): < 3 seconds
- UI interaction response: < 100ms
- IF list > 50 items: MUST use virtual scrolling (react-window)

**FR-052e - Observability & Monitoring** (MVP approach with Free plan):
- System MUST use Vercel built-in logging for serverless function output (available on Free plan via dashboard and CLI)
- System MUST log all errors with structured logging including: timestamp, user_id, company_id, error_type, stack_trace, request_id
- System MUST track key metrics in-app: API response times, document generation success/failure rates, database query performance (store in database audit_logs table)
- System MUST implement health check endpoint (/api/health) returning service status and database connectivity
- System SHOULD implement simple admin dashboard showing: total users, documents generated today/week/month, error count, slow queries, list of trial accounts with "Upgrade Account" button (requires Admin role)
- Admin dashboard MUST provide account upgrade functionality: search user by email, view account details, upgrade trial to full access with single click, confirm action with modal
- **Free plan limitation**: Vercel Analytics requires Pro plan; for MVP use built-in logs + custom metrics stored in database
- Post-MVP upgrade (100+ customers): Add Vercel Analytics ($20/month Pro plan) or migrate to comprehensive APM solution (Datadog/New Relic) if advanced tracing/profiling needed

### FR-053: Security Requirements (Detailed)

**FR-053a - Authentication**:
- JWT access tokens MUST expire after 15 minutes
- JWT refresh tokens MUST expire after 7 days
- Refresh tokens MUST be stored in HTTP-only cookies (SameSite=Strict)
- System MUST invalidate all tokens on password change

**FR-053b - Authorization (RBAC)**:

| Role | Permissions |
|------|-------------|
| **Admin** | All operations: create/read/update/delete companies, positions, risks, users; manage roles; view audit logs; upgrade trial accounts to full access via admin dashboard |
| **BZR Officer** | Create/read/update companies (own only); create/read/update/delete positions, risks, documents (own company); cannot delete company |
| **HR Manager** | Read companies, positions (own company); create/update employee data; cannot modify risk assessments |
| **Viewer** | Read-only access to companies, positions (own company); can download documents; cannot create/modify |

**FR-053c - Row-Level Security**:
- System MUST filter all queries by user's company_id using WHERE clauses in application layer AND PostgreSQL RLS policies for defense-in-depth
- System MUST add company_id column to all multi-tenant tables: companies, work_positions, risk_assessments, ppe, training, medical_exams, employees, documents, audit_logs
- System MUST implement PostgreSQL RLS policies: `CREATE POLICY company_isolation ON {table} FOR ALL USING (company_id = current_setting('app.current_company_id')::integer)`
- **RLS Middleware Implementation** (backend/src/api/middleware/rls.ts):
  - After JWT authentication, extract user's company_id from token payload
  - Execute SQL: `SET LOCAL app.current_company_id = $1` with company_id parameter at start of each request transaction
  - SET LOCAL ensures session variable is transaction-scoped (automatically cleared after commit/rollback)
  - RLS policies automatically enforce isolation via current_setting() function
  - **Implementation**: See Task T047
- System MUST return 403 Forbidden if user attempts to access data from other company
- Exception: Admin role can access all companies (bypass RLS with BYPASSRLS grant)

**FR-053d - Rate Limiting** (optimized for Vercel Free plan):
- API requests: 100 requests per minute per user (standard rate limiting)
- Document generation (Vercel Free plan constraint): 5 documents per day per user (to stay within 100 executions/day limit for 10-20 users)
- Document generation post-upgrade (Vercel Pro): 50 documents per day per user (unlimited executions)
- Login attempts: 5 failed attempts → 15 minute lockout
- IF exceeded: Return 429 Too Many Requests with Retry-After header
- System MUST display remaining document quota to users: "Preostalo dokumenata danas: {remaining}/5"
- **Rationale**: Vercel Free plan allows 100 function executions/day per deployment; with 10-20 pilot users, limiting to 5 documents/user/day ensures adequate capacity for all users plus API requests
- **Monitoring**: Track daily document generation count; if approaching 80/100 executions, send alert to admin

**FR-053e - Input Sanitization**:
- System MUST sanitize all text inputs to prevent XSS
- System MUST use parameterized queries to prevent SQL injection (Drizzle ORM handles this)
- System MUST validate file uploads (mime type, file size < 10MB for Excel import)

### FR-054: Accessibility Requirements

**FR-054a - Keyboard Navigation**:
- ALL interactive elements MUST be accessible via Tab key
- Multi-step wizard MUST support:
  - Tab / Shift+Tab: Navigate between fields
  - Enter: Proceed to next step
  - Escape: Close modal
  - Arrow keys: Navigate radio button / select options

**FR-054b - Screen Reader Support**:
- ALL form inputs MUST have associated `<label>` elements
- Error messages MUST use `aria-live="polite"` for announcements
- Risk level badges MUST include `aria-label`: "Nizak rizik" / "Srednji rizik" / "Povećan rizik"
- Document generation progress MUST announce status: "Generisanje dokumenta: 30% završeno"

**FR-054c - Color Contrast**:
- Risk level indicators MUST meet WCAG AA contrast ratio (4.5:1):
  - Green badge: #107C10 on white background
  - Yellow badge: #CA5010 on white background (not pure yellow - insufficient contrast)
  - Red badge: #D13438 on white background
- System MUST provide text labels alongside color indicators

**FR-054d - Focus Management**:
- Modal dialogs MUST trap focus (prevent Tab from exiting modal)
- Form validation errors MUST move focus to first error field
- Document download completion MUST announce "Dokument je spreman za preuzimanje" (screen reader)

---

## Traceability Matrix

### Requirements to Legal Articles Mapping

| Requirement ID | Legal Article | Requirement Summary |
|----------------|---------------|---------------------|
| FR-001 | Član 9, stav 1, tačka 1 | Company data capture |
| FR-002 | Član 9, stav 1, tačka 2 | Work position specification |
| FR-003 | Član 9, stav 1, tačka 3 | Hazard identification |
| FR-004, FR-005 | Član 9, stav 1, tačka 3 | Risk calculation methodology |
| FR-006 | Best practice | Risk reduction validation |
| FR-007 | Član 9, stav 1, tačka 4 | High-risk position flagging |
| FR-008, FR-009 | Član 9, stav 1 | Document generation |
| FR-010 | Član 19 | PPE specification |
| FR-011 | Član 11 | Training requirements |
| FR-012 | Član 22 | Medical exam requirements |
| FR-015 | Član 32, stav 2 | Audit trail for revisions |
| FR-031 | GDPR, Član 26 | Personal data encryption |
| FR-032 | GDPR Articles 15, 17 | Data export & deletion |
| FR-033 | Pravilnik 62/2008 | Record keeping |
| FR-034-FR-042 | Član 9, stav 1 | All mandatory document sections |
| FR-045 | Član 32, stav 1 | Periodic document update (2 years) |
| FR-046 | Član 32, stav 2 | Triggered document update |

---

## Assumptions & Dependencies

### AS-001: Legal Assumptions
- **Assumption**: Serbian labor inspectors accept DOCX format for Akt o proceni rizika
- **Validation**: Confirmed by Ministry of Labor guidance (2018) allowing electronic formats
- **Risk**: If inspectorate rejects DOCX, system must add PDF export capability

### AS-002: Risk Methodology Assumptions
- **Assumption**: E×P×F methodology is legally compliant for Serbian BZR context
- **Validation**: Widely used in Serbian practice, no explicit legal requirement for specific formula
- **Risk**: If inspectorate requires different methodology, formulas must be recalculated

### AS-003: External Dependencies
- **Dependency**: Microsoft Word 2016+ for opening generated DOCX files
- **Mitigation**: Test DOCX compatibility with Word 2016, 2019, 2021, Office 365

- **Dependency**: Vercel platform availability for serverless compute (frontend and API)
- **Mitigation**: High availability SLA; consider Netlify or Cloudflare Pages as alternative if needed

- **Dependency**: Wasabi S3-compatible object storage for generated document storage
- **Mitigation**: Documents accessible via pre-signed URLs; S3-compatible API allows migration to AWS S3, Cloudflare R2, or Backblaze B2 if needed; implement automatic backup to secondary storage provider if critical
- **Backup strategy**: Store document metadata (filename, company_id, generation_timestamp) in PostgreSQL; if Wasabi unavailable, can regenerate documents on-demand from database data

- **Dependency**: Supabase PostgreSQL service availability
- **Mitigation**: Supabase provides managed PostgreSQL with automatic backups, high availability guarantees (99.9%+ uptime SLA), and built-in connection pooling via PgBouncer
- **Additional Benefits**: Supabase provides built-in authentication (JWT tokens), Row Level Security (RLS) policies support, real-time subscriptions (if needed for collaborative features post-MVP)

- **Dependency**: Serbian hazard code catalog remains stable
- **Mitigation**: Hazard codes managed via Drizzle database migrations (version-controlled seed data); when regulations change, create new migration file with INSERT/UPDATE statements; deploy with code releases; track effective_date and deprecated_date for audit trail; existing risk assessments preserve historical hazard codes even if deprecated

### AS-004: User Knowledge Assumptions
- **Assumption**: BZR officers have basic knowledge of risk assessment principles
- **Validation**: BZR officer certification required per Član 30
- **Mitigation**: Provide in-app help text and tooltips for E, P, F selection guidance

### AS-005: Database Architecture
- **Architecture**: Single shared PostgreSQL database with company_id-based row-level security for all tenants
- **Rationale**: Optimal for MVP with 10-100 companies; simpler operations, lower cost, adequate isolation via RLS policies
- **Migration Path**: If enterprise customers require physical isolation, can migrate specific tenants to separate schemas or databases post-MVP
- **Capacity**: Single database scales to 1000+ companies with proper indexing on company_id and connection pooling

### AS-006: Deployment Platform
- **Platform**: Vercel for frontend and backend (serverless functions)
- **Database**: Supabase PostgreSQL (chosen for MVP - provides managed PostgreSQL, built-in auth capabilities, RLS policy support, connection pooling via PgBouncer)
- **Database Rationale**: Supabase offers comprehensive platform with PostgreSQL + built-in authentication + real-time capabilities; free tier supports 500MB database, 50,000 monthly active users; seamless integration with Vercel via environment variables
- **Storage**: Wasabi S3-compatible object storage for generated documents ($6.99/TB/month minimum, no egress fees)
- **Storage Rationale**: Wasabi provides predictable flat-rate pricing with zero egress/bandwidth charges (critical for document downloads), S3-compatible API (standard tooling), and excellent cost efficiency at scale compared to Supabase Storage ($0.09/GB egress after 2GB) or Cloudflare R2 (API operation fees)
- **Email**: Resend for transactional emails (Free tier: 100 emails/day, 3,000/month sufficient for MVP)
- **Monitoring**: Vercel built-in logging and basic analytics (available on Free plan)
- **Budget Constraint**: Minimize costs during MVP; acceptable small fixed cost ($6.99/month for Wasabi) to avoid variable bandwidth charges that could spike unexpectedly
- **Plan Requirements (MVP Phase)**:
  - Vercel Free plan: 100GB bandwidth/month, 10s function timeout, 100 serverless function executions/day per deployment
  - Supabase Free tier: 500MB database, 50,000 monthly active users, 2GB bandwidth/month
  - Wasabi: $6.99/month (1TB minimum, no additional egress/API fees)
  - Resend Free tier: 100 emails/day, 3,000/month
  - **Total MVP infrastructure cost**: ~$7/month (Wasabi only; rest free tier)
- **Upgrade Path (100+ paying customers)**:
  - Vercel Pro: $20/month - 1TB bandwidth, 60s timeout, unlimited executions
  - Supabase Pro: $25/month - 8GB database, 250GB bandwidth
  - Wasabi: Same $6.99/month (scales to 1TB storage without additional cost)
  - Resend growth plans as needed based on email volume
  - **Total post-upgrade cost**: ~$52/month base + variable email costs
- **Rationale**: Vercel provides excellent DX, automatic HTTPS, edge caching, and seamless Next.js/React deployment; Supabase complements with robust data layer and auth infrastructure; Wasabi eliminates bandwidth cost concerns
- **Limitations**:
  - Vercel Free 10s timeout requires document generation optimization and split strategy for large documents
  - Vercel Free 100 executions/day per deployment may require monitoring if pilot users generate many documents
  - May need to implement document generation batching or rate limiting to stay within free tier limits
  - Wasabi 1TB minimum ($6.99/month) is small fixed cost even with minimal storage usage (~150MB MVP)

---

## Future Requirements (Out of Scope for MVP)

### FR-055: Advanced Features (Phase 2+)

**FR-055a - AI-powered hazard prediction** (Phase 2):
- System SHOULD use Anthropic Claude to suggest hazards based on job description analysis
- AI SHOULD provide rationale for each suggested hazard
- User MUST be able to accept/reject AI suggestions

**FR-055b - Excel import** (Phase 3):
- System SHOULD parse XLSX files with sistematizacija data
- System SHOULD preview imported data before database commit
- System SHOULD handle import errors gracefully with row-level error messages

**FR-055c - Multi-language support**:
- System MAY support Latin Serbian (sr-Latn-RS) alongside Cyrillic
- System MAY provide English interface for international users (document generation remains Serbian)

**FR-055d - Electronic signatures**:
- System MAY integrate with qualified electronic signature providers (when legally accepted)
- System SHOULD allow BZR officer and director to digitally sign Akt within platform

**FR-055e - Mobile app**:
- System MAY provide React Native mobile app for on-site risk assessment data collection
- Mobile app SHOULD sync data when connectivity restored

---

**Last Updated**: 2025-10-21
**Version**: 2.0 (Enhanced with legal compliance details)
