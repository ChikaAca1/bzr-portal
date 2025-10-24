# API Contract: Document Generation

**Base Path**: `/api/documents` (REST) or `documents` namespace (tRPC)
**Authentication**: Required (JWT Bearer token)
**Authorization**: User can only generate documents for companies they own

---

## tRPC Procedures

### `documents.generate`

**Purpose**: Generate a Risk Assessment Act (Akt o proceni rizika) DOCX document

**Input**:
```typescript
{
  companyId: number,
  positionIds: number[],  // Array of position IDs to include in document
  documentType: "akt_o_proceni_rizika" | "izvestaj" (default "akt_o_proceni_rizika"),
  options?: {
    includeOrgChart: boolean (default false),
    includeEmployeeNames: boolean (default false),  // Privacy option
    language: "sr-Cyrl" | "sr-Latn" (default "sr-Cyrl")  // Cyrillic or Latin
  }
}
```

**Output** (Job Creation - Async Process):
```typescript
{
  jobId: string,  // UUID for tracking generation progress
  status: "queued" | "processing" | "completed" | "failed",
  estimatedTimeSeconds: number,  // e.g., 30-60 seconds
  createdAt: Date
}
```

**Errors**:
- `400 BAD_REQUEST`: Validation error (e.g., empty positionIds array)
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own the specified company or positions
- `404 NOT_FOUND`: Company ID or any position ID does not exist
- `422 UNPROCESSABLE_ENTITY`: Positions missing required data (e.g., no risk assessments)

**Business Rules**:
- At least 1 position must be selected
- All positions must belong to the specified company
- Each position must have at least 1 risk assessment (warn if missing)

---

### `documents.getJobStatus`

**Purpose**: Poll for document generation job status

**Input**:
```typescript
{
  jobId: string  // UUID from documents.generate response
}
```

**Output**:
```typescript
{
  jobId: string,
  status: "queued" | "processing" | "completed" | "failed",
  progress: number (0-100),  // Percentage complete
  currentStep?: string,  // e.g., "Generating risk tables", "Rendering DOCX"
  result?: {  // Only present if status === "completed"
    fileUrl: string,  // Signed URL to download DOCX (expires in 1 hour)
    fileName: string,  // e.g., "Akt_o_proceni_rizika_JKP_ZELENILO_2025-10-21.docx"
    fileSizeBytes: number,
    generatedAt: Date
  },
  error?: string  // Only present if status === "failed"
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `404 NOT_FOUND`: Job ID does not exist or expired (jobs expire after 24 hours)

---

### `documents.download`

**Purpose**: Download a previously generated document (by job ID)

**Input**:
```typescript
{
  jobId: string
}
```

**Output** (File Stream):
- HTTP Response with:
  - `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `Content-Disposition: attachment; filename="Akt_o_proceni_rizika_{CompanyName}_{Date}.docx"`
  - Binary DOCX file data

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this document
- `404 NOT_FOUND`: Job ID does not exist or file expired (files auto-delete after 90 days)
- `410 GONE`: Document generation failed or file was purged

---

### `documents.listByCompany`

**Purpose**: List all generated documents for a company (audit trail)

**Input**:
```typescript
{
  companyId: number,
  page?: number (default 1),
  pageSize?: number (default 20, min 1, max 100)
}
```

**Output**:
```typescript
{
  data: Array<{
    jobId: string,
    documentType: string,
    fileName: string,
    fileSizeBytes: number,
    positionCount: number,  // Number of positions included
    generatedAt: Date,
    expiresAt: Date,  // File auto-delete date (generatedAt + 90 days)
    downloadUrl: string  // Signed URL (expires in 1 hour)
  }>,
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own the specified company
- `404 NOT_FOUND`: Company ID does not exist

---

### `documents.regenerate`

**Purpose**: Re-generate a document based on current data (useful if risk assessments were updated)

**Input**:
```typescript
{
  jobId: string  // Original job ID to regenerate
}
```

**Output**: Same as `documents.generate` (new job ID created)

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own the original document
- `404 NOT_FOUND`: Original job ID does not exist

---

### `documents.delete`

**Purpose**: Delete a generated document (before 90-day expiration)

**Input**:
```typescript
{
  jobId: string
}
```

**Output**:
```typescript
{
  success: true,
  message: string  // e.g., "Document deleted successfully"
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this document
- `404 NOT_FOUND`: Job ID does not exist

---

## Document Generation Process (Background Job)

### Job Workflow

```
1. [Queue] Validate inputs → Create job record (status: "queued")
2. [Worker] Fetch company data from DB
3. [Worker] Fetch positions data (with risk assessments, PPE, training, etc.)
4. [Worker] Transform data to template variables (status: "processing", progress: 30%)
5. [Worker] Render DOCX template with docx-templates (progress: 60%)
6. [Worker] Apply post-processing (page breaks, table formatting) (progress: 80%)
7. [Worker] Upload DOCX to S3/R2 storage (progress: 95%)
8. [Worker] Update job record (status: "completed", fileUrl) (progress: 100%)
9. [Webhook] Notify frontend via WebSocket/SSE (optional)
```

### Error Handling

If generation fails:
- Job status → `"failed"`
- Error message stored in job record
- Retry mechanism: Auto-retry up to 3 times for transient errors (DB timeout, network issues)
- Non-retryable errors: Missing data, template syntax error

---

## Document Structure (DOCX Output)

### Template Sections (Generated Content)

1. **Cover Page**
   - Company name, address
   - Document title: "АКТ О ПРОЦЕНИ РИЗИКА"
   - Date of generation
   - BZR officer signature line

2. **Section 1: Uvod (Introduction)**
   - Legal basis (Zakon o BZR references)
   - Purpose statement
   - Scope of assessment

3. **Section 2: Podaci o poslodavcu (Employer Data)**
   - Company name, address, activity code, PIB
   - Director, BZR officer
   - Organizational chart (if includeOrgChart: true)

4. **Section 3: Sistematizacija radnih mesta (Position Systematization)**
   - Table of all positions with:
     - Position name, code, department
     - Employee counts (M/F/Total)
     - Required education, experience
     - Work hours

5. **Section 4: Procena rizika po radnim mestima (Risk Assessment by Position)**
   - For each position:
     - Job description
     - Equipment, workspace
     - Risk assessment table:
       - Hazard code & name
       - Initial risk (E, P, F, Ri)
       - Corrective measures
       - Residual risk (E, P, F, R)
       - Responsible person
     - PPE list
     - Training requirements
     - Medical exam schedule

6. **Section 5: Zbirni prikaz (Summary)**
   - Table: All positions with risk levels
   - List of high-risk positions (R > 70)
   - Action plan for risk reduction
   - Training plan summary
   - Medical exam plan summary

7. **Section 6: Prilozi (Appendices)**
   - Updated systematization
   - Organizational chart
   - Certificates (placeholder)

8. **Section 7: Verifikacija (Verification)**
   - Prepared by: [BZR Officer]
   - Approved by: [Director]
   - Date: [Generation Date]
   - Signature lines + stamp placeholder

---

## REST Endpoints (Alternative)

### `POST /api/documents/generate`
Initiate document generation (returns job ID)

### `GET /api/documents/jobs/:jobId/status`
Poll job status (for progress tracking)

### `GET /api/documents/jobs/:jobId/download`
Download generated DOCX file

### `GET /api/companies/:companyId/documents`
List documents for company (with pagination)

### `POST /api/documents/jobs/:jobId/regenerate`
Regenerate document

### `DELETE /api/documents/jobs/:jobId`
Delete document

---

## WebSocket/SSE for Real-Time Progress (Optional)

### WebSocket Event: `document:progress`

**Payload**:
```json
{
  "jobId": "uuid-123",
  "status": "processing",
  "progress": 60,
  "currentStep": "Rendering DOCX template"
}
```

**Event**: `document:completed`

**Payload**:
```json
{
  "jobId": "uuid-123",
  "status": "completed",
  "fileUrl": "https://cdn.example.com/...",
  "fileName": "Akt_o_proceni_rizika.docx"
}
```

**Event**: `document:failed`

**Payload**:
```json
{
  "jobId": "uuid-123",
  "status": "failed",
  "error": "Missing risk assessments for position ID 123"
}
```

---

## Performance Considerations

- **Document generation time**: Target <60 seconds for 10-20 positions, <120 seconds for 50+ positions
- **Template caching**: Pre-load DOCX template into memory to avoid file I/O on every generation
- **Database query optimization**: Use single query with joins to fetch all position data (avoid N+1)
- **File storage**: Use CDN (Cloudflare R2) for fast global downloads
- **Auto-cleanup**: Cron job deletes files older than 90 days to manage storage costs
