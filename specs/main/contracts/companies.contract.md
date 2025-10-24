# API Contract: Companies

**Base Path**: `/api/companies` (REST) or `companies` namespace (tRPC)
**Authentication**: Required (JWT Bearer token)
**Authorization**: User can only access their own company data (row-level security)

---

## tRPC Procedures

### `companies.create`

**Purpose**: Create a new company profile

**Input** (Zod schema):
```typescript
{
  name: string (min 3, max 255),
  address: string (min 5),
  activityCode: string (pattern /^\d{4}$/),
  pib?: string (exactly 9 digits, checksum valid) | null,
  registrationNumber?: string (max 20) | null,
  director: string (min 3, max 255),
  bzrResponsiblePerson: string (min 3, max 255),
  organizationChartUrl?: string (URL format) | null
}
```

**Output**:
```typescript
{
  id: number,
  name: string,
  address: string,
  activityCode: string,
  pib: string | null,
  registrationNumber: string | null,
  director: string,
  bzrResponsiblePerson: string,
  organizationChartUrl: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Errors**:
- `400 BAD_REQUEST`: Validation error (Zod errors returned)
- `401 UNAUTHORIZED`: Missing or invalid token
- `409 CONFLICT`: PIB already exists (if provided)

---

### `companies.getById`

**Purpose**: Get company by ID

**Input**:
```typescript
{
  id: number
}
```

**Output**:
```typescript
{
  id: number,
  name: string,
  address: string,
  activityCode: string,
  pib: string | null,
  registrationNumber: string | null,
  director: string,
  bzrResponsiblePerson: string,
  organizationChartUrl: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this company (row-level security violation)
- `404 NOT_FOUND`: Company ID does not exist

---

### `companies.list`

**Purpose**: List all companies owned by authenticated user

**Input**:
```typescript
{
  page?: number (default 1, min 1),
  pageSize?: number (default 20, min 1, max 100)
}
```

**Output**:
```typescript
{
  data: Array<{
    id: number,
    name: string,
    address: string,
    activityCode: string,
    director: string,
    createdAt: Date,
    updatedAt: Date
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

---

### `companies.update`

**Purpose**: Update company profile

**Input**:
```typescript
{
  id: number,
  data: {
    name?: string (min 3, max 255),
    address?: string (min 5),
    activityCode?: string (pattern /^\d{4}$/),
    pib?: string | null,
    registrationNumber?: string | null,
    director?: string (min 3, max 255),
    bzrResponsiblePerson?: string (min 3, max 255),
    organizationChartUrl?: string | null
  }
}
```

**Output**:
```typescript
{
  id: number,
  name: string,
  address: string,
  activityCode: string,
  pib: string | null,
  registrationNumber: string | null,
  director: string,
  bzrResponsiblePerson: string,
  organizationChartUrl: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Errors**:
- `400 BAD_REQUEST`: Validation error
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this company
- `404 NOT_FOUND`: Company ID does not exist
- `409 CONFLICT`: PIB conflicts with another company

---

### `companies.delete`

**Purpose**: Delete company and all associated data (CASCADE)

**Input**:
```typescript
{
  id: number
}
```

**Output**:
```typescript
{
  success: true,
  message: string  // e.g., "Company deleted successfully"
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this company
- `404 NOT_FOUND`: Company ID does not exist

**Side Effects**:
- Deletes all `work_positions` (CASCADE)
- Deletes all `risk_assessments` (transitive CASCADE)
- Deletes all `ppe_items`, `training_requirements`, etc. (transitive CASCADE)
- **Warning**: Irreversible operation, consider confirmation dialog in UI

---

## REST Endpoints (Alternative to tRPC)

If using REST instead of tRPC:

### `POST /api/companies`
Creates new company (equivalent to `companies.create`)

### `GET /api/companies/:id`
Get company by ID (equivalent to `companies.getById`)

### `GET /api/companies`
List companies with pagination query params `?page=1&pageSize=20` (equivalent to `companies.list`)

### `PUT /api/companies/:id`
Update company (equivalent to `companies.update`)

### `DELETE /api/companies/:id`
Delete company (equivalent to `companies.delete`)

---

## Notes

- All timestamps are returned as ISO 8601 strings in JSON responses
- tRPC automatically serializes Date objects
- Row-level security ensures users can only access their own companies (enforced by middleware checking `user_id` → `company_id` ownership)
- PIB validation includes Serbian checksum algorithm (modulo 11)
