# API Contract: Work Positions

**Base Path**: `/api/positions` (REST) or `positions` namespace (tRPC)
**Authentication**: Required (JWT Bearer token)
**Authorization**: User can only access positions for companies they own

---

## tRPC Procedures

### `positions.create`

**Purpose**: Create a new work position

**Input**:
```typescript
{
  companyId: number,
  positionName: string (min 3, max 255),
  positionCode?: string (max 50) | null,
  department?: string (max 255) | null,
  requiredEducation: string (max 255),
  requiredExperience?: string (max 255) | null,
  employeesMale: number (min 0, default 0),
  employeesFemale: number (min 0, default 0),
  workHoursDaily: number (min 1.0, max 12.0, default 8.0),
  workHoursWeekly: number (min 5.0, max 60.0, default 40.0),
  shiftWork: boolean (default false),
  nightWork: boolean (default false),
  jobDescription?: string | null,
  equipmentUsed?: string[] | null,
  workspace?: string (max 100) | null
}
```

**Output**:
```typescript
{
  id: number,
  companyId: number,
  positionName: string,
  positionCode: string | null,
  department: string | null,
  requiredEducation: string,
  requiredExperience: string | null,
  employeesMale: number,
  employeesFemale: number,
  employeesTotal: number,  // computed: male + female
  workHoursDaily: number,
  workHoursWeekly: number,
  shiftWork: boolean,
  nightWork: boolean,
  jobDescription: string | null,
  equipmentUsed: string[] | null,
  workspace: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Errors**:
- `400 BAD_REQUEST`: Validation error
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own the specified company
- `404 NOT_FOUND`: Company ID does not exist

---

### `positions.getById`

**Purpose**: Get work position by ID

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
  companyId: number,
  positionName: string,
  positionCode: string | null,
  department: string | null,
  requiredEducation: string,
  requiredExperience: string | null,
  employeesMale: number,
  employeesFemale: number,
  employeesTotal: number,
  workHoursDaily: number,
  workHoursWeekly: number,
  shiftWork: boolean,
  nightWork: boolean,
  jobDescription: string | null,
  equipmentUsed: string[] | null,
  workspace: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this position's company
- `404 NOT_FOUND`: Position ID does not exist

---

### `positions.listByCompany`

**Purpose**: List all work positions for a company

**Input**:
```typescript
{
  companyId: number,
  page?: number (default 1),
  pageSize?: number (default 50, min 1, max 100),
  search?: string | null  // Search in positionName, department
}
```

**Output**:
```typescript
{
  data: Array<{
    id: number,
    companyId: number,
    positionName: string,
    positionCode: string | null,
    department: string | null,
    requiredEducation: string,
    employeesTotal: number,
    riskAssessmentCount: number,  // Count of associated risk assessments
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
- `403 FORBIDDEN`: User does not own the specified company
- `404 NOT_FOUND`: Company ID does not exist

---

### `positions.update`

**Purpose**: Update work position

**Input**:
```typescript
{
  id: number,
  data: {
    positionName?: string (min 3, max 255),
    positionCode?: string | null,
    department?: string | null,
    requiredEducation?: string (max 255),
    requiredExperience?: string | null,
    employeesMale?: number (min 0),
    employeesFemale?: number (min 0),
    workHoursDaily?: number (min 1.0, max 12.0),
    workHoursWeekly?: number (min 5.0, max 60.0),
    shiftWork?: boolean,
    nightWork?: boolean,
    jobDescription?: string | null,
    equipmentUsed?: string[] | null,
    workspace?: string | null
  }
}
```

**Output**: Same as `positions.getById` output

**Errors**:
- `400 BAD_REQUEST`: Validation error
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this position's company
- `404 NOT_FOUND`: Position ID does not exist

---

### `positions.delete`

**Purpose**: Delete work position and all associated data (CASCADE)

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
  message: string,
  deletedCounts: {
    riskAssessments: number,
    ppeItems: number,
    trainingRequirements: number,
    medicalExamRequirements: number
  }
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this position's company
- `404 NOT_FOUND`: Position ID does not exist

**Side Effects**:
- Deletes all associated `risk_assessments`, `ppe_items`, `training_requirements`, `medical_exam_requirements`, etc. (CASCADE)

---

## REST Endpoints (Alternative)

### `POST /api/positions`
Creates new position

### `GET /api/positions/:id`
Get position by ID

### `GET /api/companies/:companyId/positions`
List positions for company (with pagination and search query params)

### `PUT /api/positions/:id`
Update position

### `DELETE /api/positions/:id`
Delete position
