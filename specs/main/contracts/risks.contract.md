# API Contract: Risk Assessments

**Base Path**: `/api/risks` (REST) or `risks` namespace (tRPC)
**Authentication**: Required (JWT Bearer token)
**Authorization**: User can only access risks for positions they own

---

## tRPC Procedures

### `risks.create`

**Purpose**: Create a new risk assessment for a hazard on a work position

**Input**:
```typescript
{
  positionId: number,
  hazardId: number,
  initialE: number (min 1, max 6),
  initialP: number (min 1, max 6),
  initialF: number (min 1, max 6),
  correctiveMeasures: string (min 10),
  residualE: number (min 1, max 6),
  residualP: number (min 1, max 6),
  residualF: number (min 1, max 6),
  responsiblePerson?: string (max 255) | null
}
```

**Output**:
```typescript
{
  id: number,
  positionId: number,
  hazardId: number,
  initialE: number,
  initialP: number,
  initialF: number,
  initialRi: number,  // computed: E × P × F
  correctiveMeasures: string,
  residualE: number,
  residualP: number,
  residualF: number,
  residualR: number,  // computed: E × P × F
  responsiblePerson: string | null,
  riskLevel: "low" | "medium" | "high",  // derived: low (≤36), medium (37-70), high (>70)
  createdAt: Date,
  updatedAt: Date
}
```

**Business Rules Enforced**:
1. **Residual risk must be lower**: `residualR < initialRi`
   - Error: `"Residual risk (R={residualR}) must be lower than initial risk (Ri={initialRi}) after applying corrective measures"`
2. **High risk must be reduced**: If `initialRi > 70`, then `residualR ≤ 70`
   - Error: `"High initial risk (Ri={initialRi}) must be reduced to acceptable level (R ≤ 70)"`
3. **Unique hazard per position**: `(positionId, hazardId)` must be unique
   - Error: `"Risk assessment for this hazard already exists for this position"`

**Errors**:
- `400 BAD_REQUEST`: Validation error or business rule violation
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this position's company
- `404 NOT_FOUND`: Position ID or Hazard ID does not exist
- `409 CONFLICT`: Duplicate (positionId, hazardId) pair

---

### `risks.getById`

**Purpose**: Get risk assessment by ID

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
  positionId: number,
  hazardId: number,
  hazard: {  // Joined from hazard_types table
    code: string,
    category: string,
    nameSr: string,
    nameEn: string | null
  },
  initialE: number,
  initialP: number,
  initialF: number,
  initialRi: number,
  correctiveMeasures: string,
  residualE: number,
  residualP: number,
  residualF: number,
  residualR: number,
  responsiblePerson: string | null,
  riskLevel: "low" | "medium" | "high",
  createdAt: Date,
  updatedAt: Date
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this risk's company
- `404 NOT_FOUND`: Risk ID does not exist

---

### `risks.listByPosition`

**Purpose**: List all risk assessments for a work position

**Input**:
```typescript
{
  positionId: number,
  sortBy?: "residualR" | "hazardCode" | "createdAt" (default "residualR"),
  sortOrder?: "asc" | "desc" (default "desc")
}
```

**Output**:
```typescript
{
  data: Array<{
    id: number,
    hazardId: number,
    hazard: {
      code: string,
      category: string,
      nameSr: string
    },
    initialRi: number,
    residualR: number,
    riskLevel: "low" | "medium" | "high",
    correctiveMeasures: string (truncated to 100 chars for list view),
    createdAt: Date,
    updatedAt: Date
  }>,
  summary: {
    totalAssessments: number,
    highRiskCount: number,  // residualR > 70
    mediumRiskCount: number,  // 37 <= residualR <= 70
    lowRiskCount: number,  // residualR <= 36
    averageResidualRisk: number  // mean of all residualR values
  }
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this position's company
- `404 NOT_FOUND`: Position ID does not exist

---

### `risks.update`

**Purpose**: Update an existing risk assessment

**Input**:
```typescript
{
  id: number,
  data: {
    initialE?: number (min 1, max 6),
    initialP?: number (min 1, max 6),
    initialF?: number (min 1, max 6),
    correctiveMeasures?: string (min 10),
    residualE?: number (min 1, max 6),
    residualP?: number (min 1, max 6),
    residualF?: number (min 1, max 6),
    responsiblePerson?: string | null
  }
}
```

**Output**: Same as `risks.getById` output

**Business Rules**: Same validation as `risks.create` (residual < initial, high risk reduction)

**Errors**:
- `400 BAD_REQUEST`: Validation error or business rule violation
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this risk's company
- `404 NOT_FOUND`: Risk ID does not exist

---

### `risks.delete`

**Purpose**: Delete a risk assessment

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
  message: string  // e.g., "Risk assessment deleted successfully"
}
```

**Errors**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User does not own this risk's company
- `404 NOT_FOUND`: Risk ID does not exist

---

### `risks.calculateRisk` (Utility Procedure)

**Purpose**: Client-side helper to calculate risk score before submission

**Input**:
```typescript
{
  E: number (1-6),
  P: number (1-6),
  F: number (1-6)
}
```

**Output**:
```typescript
{
  R: number,  // E × P × F
  riskLevel: "low" | "medium" | "high",
  description: string  // e.g., "Srednji rizik - potrebne kontrolne mere"
}
```

**Errors**:
- `400 BAD_REQUEST`: E, P, or F out of range (1-6)

**Note**: This is a pure function that can also run client-side for instant UI feedback

---

### `risks.validateReduction` (Utility Procedure)

**Purpose**: Validate if residual risk meets reduction requirements

**Input**:
```typescript
{
  initialE: number (1-6),
  initialP: number (1-6),
  initialF: number (1-6),
  residualE: number (1-6),
  residualP: number (1-6),
  residualF: number (1-6)
}
```

**Output**:
```typescript
{
  valid: boolean,
  initialRi: number,
  residualR: number,
  errors: string[]  // Array of violation messages, empty if valid
}
```

**Example**:
```json
{
  "valid": false,
  "initialRi": 108,
  "residualR": 108,
  "errors": [
    "Residual risk (R=108) must be lower than initial risk (Ri=108)",
    "High initial risk (Ri=108) must be reduced to acceptable level (R ≤ 70)"
  ]
}
```

---

## REST Endpoints (Alternative)

### `POST /api/risks`
Create new risk assessment

### `GET /api/risks/:id`
Get risk by ID

### `GET /api/positions/:positionId/risks`
List risks for position (with query params for sorting)

### `PUT /api/risks/:id`
Update risk assessment

### `DELETE /api/risks/:id`
Delete risk assessment

### `POST /api/risks/calculate`
Utility endpoint to calculate risk score

### `POST /api/risks/validate-reduction`
Utility endpoint to validate risk reduction
