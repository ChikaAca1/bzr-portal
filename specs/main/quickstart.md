# Quickstart Guide: BZR Portal

**Goal**: Get a developer from zero to running the full stack (backend + frontend + database) in under 30 minutes.

**Prerequisites**:
- Node.js 20+ or Bun 1.0+ installed
- PostgreSQL 16+ running locally (or Docker)
- Git installed
- Code editor (VS Code recommended)

---

## Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/bzr-portal.git
cd bzr-portal

# Install backend dependencies
cd backend
npm install  # or: bun install

# Install frontend dependencies
cd ../frontend
npm install  # or: bun install

cd ..
```

---

## Step 2: Database Setup

### Option A: Local PostgreSQL

```bash
# Create database
createdb bzr_portal

# OR using psql:
psql -U postgres
CREATE DATABASE bzr_portal;
\q
```

### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL in Docker
docker run --name bzr-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bzr_portal \
  -p 5432:5432 \
  -d postgres:16

# Verify running
docker ps | grep bzr-postgres
```

### Configure Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bzr_portal"

# Server
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# File Storage (local for development, S3/R2 for production)
STORAGE_TYPE="local"  # or "s3"
STORAGE_PATH="./uploads"  # local path
# S3_ENDPOINT="https://xxx.r2.cloudflarestorage.com"
# S3_ACCESS_KEY_ID="xxx"
# S3_SECRET_ACCESS_KEY="xxx"
# S3_BUCKET="bzr-portal-docs"

# AI (Phase 2 - optional for MVP)
# ANTHROPIC_API_KEY="sk-ant-xxx"

# Redis (optional - for caching, can skip in MVP)
# REDIS_URL="redis://localhost:6379"
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME="BZR Portal"
```

---

## Step 3: Run Database Migrations & Seed Data

```bash
cd backend

# Generate migration files from schema (first time setup)
npx drizzle-kit generate:pg

# Apply migrations to database
npx drizzle-kit push:pg

# Seed hazard codes reference data
npm run seed  # or: bun run seed

# Verify tables created
psql -U postgres -d bzr_portal -c "\dt"
# Expected output: companies, work_positions, hazard_types, risk_assessments, etc.
```

---

## Step 4: Start Backend Server

```bash
cd backend

# Development mode (hot reload with tsx)
npm run dev  # or: bun run dev

# Expected output:
# [INFO] Server listening on http://localhost:3000
# [INFO] Database connected successfully
# [INFO] Loaded 45 hazard codes from seed data
```

**Verify backend**:
```bash
curl http://localhost:3000/health
# Expected: {"status": "ok", "database": "connected"}
```

---

## Step 5: Start Frontend Dev Server

```bash
cd frontend

# Development mode (Vite dev server)
npm run dev  # or: bun run dev

# Expected output:
# VITE v5.x.x ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**Open browser**: http://localhost:5173

---

## Step 6: Create Test Data (Optional)

### Option A: Use the UI
1. Navigate to http://localhost:5173
2. Click "Nova kompanija" (New Company)
3. Fill in company details:
   - Name: "JKP ZELENILO"
   - Address: "Beograd, Kralja Milana 10"
   - Activity Code: "8130"
   - Director: "Petar Petrović"
   - BZR Officer: "Ana Anić, dipl. inž. BZR"
4. Save company
5. Click "Novo radno mesto" (New Work Position)
6. Fill position details and proceed through wizard

### Option B: Use Seed Script

Create `backend/src/db/seed-test-data.ts`:

```typescript
import { db } from './index';
import { companies, workPositions, riskAssessments, hazardTypes } from './schema';

async function seedTestData() {
  // Create test company
  const [company] = await db.insert(companies).values({
    name: 'JKP ZELENILO',
    address: 'Beograd, Kralja Milana 10',
    activityCode: '8130',
    director: 'Petar Petrović',
    bzrResponsiblePerson: 'Ana Anić, dipl. inž. BZR',
  }).returning();

  console.log('Created company:', company.id);

  // Create test work position
  const [position] = await db.insert(workPositions).values({
    companyId: company.id,
    positionName: 'Izvršni direktor za operativne poslove',
    positionCode: '001',
    department: 'Uprava',
    requiredEducation: 'VII stepen, ekonomske struke',
    requiredExperience: '1 godina',
    employeesMale: 1,
    employeesFemale: 0,
    workHoursDaily: 8.0,
    workHoursWeekly: 40.0,
    jobDescription: 'Rukovođenje operativnim poslovima preduzeća...',
  }).returning();

  console.log('Created position:', position.id);

  // Get hazard codes for common office work
  const hazards = await db.select().from(hazardTypes).where(
    inArray(hazardTypes.hazardCode, ['15', '29', '33', '34', '35'])
  );

  // Create risk assessments
  for (const hazard of hazards) {
    await db.insert(riskAssessments).values({
      positionId: position.id,
      hazardId: hazard.id,
      initialE: 3,
      initialP: 3,
      initialF: 6,  // Ri = 54
      correctiveMeasures: 'Edukacija zaposlenih, kratke pauze, ergonomski nameštaj',
      residualE: 3,
      residualP: 2,
      residualF: 6,  // R = 36
    });
  }

  console.log(`Created ${hazards.length} risk assessments`);
  console.log('✅ Test data seeded successfully!');
}

seedTestData().catch(console.error);
```

Run:
```bash
cd backend
npx tsx src/db/seed-test-data.ts
```

---

## Step 7: Generate Your First Document

### Via UI:
1. Navigate to company details page
2. Select the test work position
3. Click "Generiši Akt" (Generate Document)
4. Wait for generation progress (30-60 seconds)
5. Download DOCX file
6. Open in Microsoft Word to verify formatting

### Via API (curl):

```bash
# 1. Create company (get company ID)
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEST COMPANY",
    "address": "Test Address 123",
    "activityCode": "8130",
    "director": "Test Director",
    "bzrResponsiblePerson": "Test BZR Officer"
  }'

# Response: {"id": 1, ...}

# 2. Create position (get position ID)
curl -X POST http://localhost:3000/api/positions \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "positionName": "Test Position",
    "requiredEducation": "VII stepen",
    "employeesMale": 1,
    "employeesFemale": 0
  }'

# Response: {"id": 1, ...}

# 3. Create risk assessment
curl -X POST http://localhost:3000/api/risks \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "hazardId": 5,
    "initialE": 3,
    "initialP": 3,
    "initialF": 6,
    "correctiveMeasures": "Test measures",
    "residualE": 3,
    "residualP": 2,
    "residualF": 6
  }'

# 4. Generate document
curl -X POST http://localhost:3000/api/documents/generate \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "positionIds": [1]
  }'

# Response: {"jobId": "uuid-123", "status": "queued"}

# 5. Check job status (poll every 2 seconds)
curl http://localhost:3000/api/documents/jobs/uuid-123/status

# When status === "completed", download:
curl -O http://localhost:3000/api/documents/jobs/uuid-123/download
```

---

## Step 8: Run Tests

```bash
# Backend unit tests
cd backend
npm run test  # or: bun test

# Backend integration tests (requires test database)
npm run test:integration

# Frontend unit tests
cd frontend
npm run test

# E2E tests (requires both servers running)
npm run test:e2e
```

---

## Troubleshooting

### Database Connection Errors

**Error**: `connection refused`

**Fix**:
```bash
# Check PostgreSQL running
pg_isready

# If not running (macOS):
brew services start postgresql@16

# If not running (Linux):
sudo systemctl start postgresql

# If not running (Docker):
docker start bzr-postgres
```

**Error**: `database "bzr_portal" does not exist`

**Fix**:
```bash
createdb bzr_portal
# OR:
psql -U postgres -c "CREATE DATABASE bzr_portal;"
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Fix**:
```bash
# Find process using port 3000
lsof -ti:3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# OR change port in backend/.env:
PORT=3001
```

### Missing Environment Variables

**Error**: `DATABASE_URL is not defined`

**Fix**:
- Ensure `backend/.env` exists and contains `DATABASE_URL`
- Restart backend server after creating `.env`

### DOCX Generation Fails

**Error**: `Template file not found`

**Fix**:
```bash
# Ensure template exists
ls backend/src/lib/templates/akt-template.docx

# If missing, copy from constitution or create minimal template
```

**Error**: `Mustache syntax error`

**Fix**:
- Check template variables match data model (e.g., `{{company.name}}`)
- Validate template with online DOCX viewer (https://docx-preview.com/)

---

## Next Steps

1. **Read the spec**: `specs/main/spec.md` for user stories
2. **Review data model**: `specs/main/data-model.md` for database schema
3. **Review API contracts**: `specs/main/contracts/` for endpoint specifications
4. **Check constitution**: `.specify/memory/constitution.md` for architecture decisions
5. **Start coding**: Follow `specs/main/tasks.md` (generated by `/speckit.tasks` command)

---

## Development Workflow

### Adding a New Feature

1. Read feature spec in `specs/<feature-name>/spec.md`
2. Review implementation plan in `specs/<feature-name>/plan.md`
3. Follow tasks in `specs/<feature-name>/tasks.md`
4. Write tests FIRST (if tests required in spec)
5. Implement feature
6. Run tests and linting
7. Commit with descriptive message
8. Create PR with link to spec

### Database Schema Changes

1. Modify Drizzle schema files in `backend/src/db/schema/`
2. Generate migration: `npx drizzle-kit generate:pg`
3. Review generated SQL in `backend/src/db/migrations/`
4. Apply migration: `npx drizzle-kit push:pg`
5. Update seed data if needed
6. Run tests to verify schema changes

### Code Quality Checks

```bash
# Backend
cd backend
npm run lint  # ESLint
npm run format  # Prettier
npm run typecheck  # TypeScript

# Frontend
cd frontend
npm run lint
npm run format
npm run typecheck
```

---

## Useful Commands Reference

```bash
# Database
npx drizzle-kit generate:pg    # Generate migration
npx drizzle-kit push:pg         # Apply migration
npx drizzle-kit studio          # Open Drizzle Studio (DB GUI)
npm run seed                    # Seed hazard codes

# Development
npm run dev                     # Start dev server
npm run build                   # Production build
npm run start                   # Start production server

# Testing
npm run test                    # Unit tests
npm run test:watch              # Watch mode
npm run test:coverage           # Coverage report
npm run test:e2e                # End-to-end tests

# Linting & Formatting
npm run lint                    # ESLint check
npm run lint:fix                # Auto-fix issues
npm run format                  # Prettier format
npm run typecheck               # TypeScript check
```

---

## Development Tools

### Recommended VS Code Extensions
- **ESLint**: Linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind autocomplete
- **Drizzle ORM**: Schema autocomplete
- **Thunder Client**: API testing (alternative to Postman)

### Database GUI Tools
- **Drizzle Studio**: `npx drizzle-kit studio` (built-in)
- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/

### API Testing Tools
- **Thunder Client** (VS Code extension)
- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **curl**: Command-line (examples in Step 7)

---

## Document Storage Configuration

BZR Portal generates DOCX files that must be stored and served to users. Storage configuration depends on environment.

### Development (Local Storage)

For local development, documents are stored in `backend/uploads/` directory:

```bash
# Create uploads directory
cd backend
mkdir -p uploads/documents

# Directory structure (auto-created by app):
uploads/
  └── documents/
      ├── {companyId}/
      │   └── {year}/
      │       └── {documentId}.docx
      └── temp/  # For document generation in progress
```

**Storage Service** (`backend/src/services/storage.service.ts`) automatically creates subdirectories per company and year.

### Production (S3-Compatible Storage)

For production, use **Cloudflare R2** (S3-compatible, cheaper than AWS S3):

#### Bucket Structure

```
Bucket Name: bzr-docs-{environment}
  - bzr-docs-dev
  - bzr-docs-staging
  - bzr-docs-production

Folder Structure:
/{companyId}/{year}/{documentId}.docx

Example:
/company-550e8400/2025/doc-7c9e6679-docx
/company-550e8400/2025/doc-abc12345.docx
/company-a1b2c3d4/2024/doc-old12345.docx
```

**Why this structure?**
- Company isolation: Easy to export/delete all documents for one company (GDPR compliance)
- Year partitioning: Simplifies retention policy enforcement (delete documents older than 90 days)
- Document ID: UUID v4 for uniqueness, prevents enumeration attacks

#### Retention Policy

Per FR-050a and spec.md requirements:

| Retention Rule | Duration | Action |
|----------------|----------|--------|
| **Active documents** | 0-90 days | Accessible via signed URL (1-hour expiration) |
| **Warning period** | 83-90 days | Email notification: "Document expires in 7 days, download now" |
| **Expired documents** | >90 days | **Automatic deletion** via cron job (daily at 2am UTC) |
| **Archived (optional)** | 90 days - 5 years | Move to cheaper "archive" bucket (if legal requirement) |

#### Cron Job Implementation

**Task T059 includes**: Create storage service with cleanup job
**Implementation** (example using BullMQ):

```typescript
// backend/src/jobs/document-cleanup.job.ts
import { Queue, Worker } from 'bullmq';

const documentCleanupQueue = new Queue('document-cleanup', {
  connection: redisConnection
});

// Schedule daily cleanup at 2am UTC
await documentCleanupQueue.add(
  'cleanup-expired-documents',
  {},
  {
    repeat: {
      pattern: '0 2 * * *', // Cron: 2am daily
      tz: 'UTC'
    }
  }
);

// Worker implementation
const worker = new Worker('document-cleanup', async (job) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

  // Query documents older than 90 days
  const expiredDocs = await db
    .select()
    .from(documents)
    .where(lt(documents.created_at, cutoffDate));

  for (const doc of expiredDocs) {
    // Delete from S3/R2
    await storageService.deleteDocument(doc.file_key);
    // Mark as deleted in DB
    await db.update(documents)
      .set({ deleted_at: new Date() })
      .where(eq(documents.id, doc.id));
  }

  return { deletedCount: expiredDocs.length };
});
```

#### Environment Variables

Add to `backend/.env`:

```bash
# Storage Configuration
STORAGE_TYPE=local  # or: s3, r2
STORAGE_BUCKET=bzr-docs-dev
STORAGE_REGION=auto  # For Cloudflare R2
STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=<your-r2-access-key>
STORAGE_SECRET_ACCESS_KEY=<your-r2-secret-key>

# Retention Policy
DOCUMENT_RETENTION_DAYS=90
CLEANUP_CRON_SCHEDULE="0 2 * * *"  # 2am UTC daily
```

#### Setup Cloudflare R2 (Production)

1. **Create R2 bucket**:
   ```bash
   # Via Cloudflare dashboard or wrangler CLI
   npx wrangler r2 bucket create bzr-docs-production
   ```

2. **Generate API tokens**:
   - Navigate to Cloudflare Dashboard → R2 → Manage R2 API Tokens
   - Create token with permissions: Object Read & Write, Bucket: `bzr-docs-production`
   - Copy `Access Key ID` and `Secret Access Key` to `.env`

3. **Test connection**:
   ```bash
   cd backend
   npm run test:storage
   # Should upload test file and retrieve signed URL
   ```

#### Cost Estimation (Cloudflare R2)

- **Storage**: $0.015/GB/month
- **Class A operations** (write): $4.50/million requests
- **Class B operations** (read): $0.36/million requests
- **Egress**: **$0** (free, unlike S3!)

**Example for 10 companies, 100 documents/month:**
- Storage: ~1GB = $0.015/month
- Writes: 100 docs × 12 months = 1,200 writes = $0.005/month
- Reads: 500 downloads/month = $0.0002/month
- **Total: ~$0.02/month** (vs AWS S3: ~$0.10/month)

### Signed URL Generation

**Purpose**: Prevent direct public access to documents (security + cost control)

**Implementation** (in T059 StorageService):

```typescript
// backend/src/services/storage.service.ts
async function getSignedDownloadUrl(
  fileKey: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: fileKey
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn // Expires in 1 hour
  });

  return signedUrl;
}
```

**Usage in tRPC**:

```typescript
// backend/src/api/routes/documents.ts
export const documentsRouter = router({
  download: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // Check user has access to this document (RLS)
      const doc = await getDocumentById(input.documentId, ctx.user.company_id);
      if (!doc) throw new TRPCError({ code: 'NOT_FOUND' });

      // Generate signed URL (valid for 1 hour)
      const downloadUrl = await storageService.getSignedDownloadUrl(doc.file_key);

      return { downloadUrl, filename: doc.filename };
    })
});
```

**Frontend usage**:

```tsx
// frontend/src/pages/Documents.tsx
const { data } = trpc.documents.download.useQuery({ documentId });

<a href={data.downloadUrl} download={data.filename}>
  Download Document
</a>
// User clicks → direct S3 download (bypasses backend, saves bandwidth)
```

### Troubleshooting Storage Issues

**Problem**: "Document not found" errors

**Solution**:
```bash
# Check if file exists in storage
aws s3 ls s3://bzr-docs-dev/company-123/2025/ --endpoint-url=$STORAGE_ENDPOINT
# OR
curl -I <signed-url>  # Should return 200 OK
```

**Problem**: Signed URLs expire too quickly

**Solution**: Increase expiration in T059 implementation (max 7 days for R2)

**Problem**: Cleanup job not running

**Solution**:
```bash
# Check BullMQ dashboard
npx bull-board  # Navigate to localhost:3000/admin/queues
# Manually trigger cleanup job for testing
```

---

## Production Deployment (Future)

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy --prod
```

### Backend (Railway)
```bash
cd backend
npm run build
railway up
```

### Environment Variables (Production)
- Use **Doppler** or **Infisical** for secrets management
- Never commit `.env` files to Git
- Rotate `JWT_SECRET` and API keys regularly

---

## Getting Help

- **Documentation**: See `docs/` directory
- **Architecture**: `.specify/memory/constitution.md`
- **API Contracts**: `specs/main/contracts/`
- **Data Model**: `specs/main/data-model.md`
- **Issues**: https://github.com/your-org/bzr-portal/issues

---

**Congratulations!** You now have a fully functioning BZR Portal development environment. Happy coding! 🚀
