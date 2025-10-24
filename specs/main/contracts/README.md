# API Contracts Index

**Project**: BZR Portal
**Date**: 2025-10-21
**API Style**: tRPC (type-safe) with REST fallback endpoints

---

## Contract Files

1. **[companies.contract.md](./companies.contract.md)** - Company management
   - CRUD operations for company profiles
   - Endpoints: `companies.*` (tRPC) or `/api/companies/*` (REST)

2. **[positions.contract.md](./positions.contract.md)** - Work position management
   - CRUD operations for work positions
   - List positions by company with search and pagination
   - Endpoints: `positions.*` (tRPC) or `/api/positions/*` (REST)

3. **[risks.contract.md](./risks.contract.md)** - Risk assessment management
   - CRUD operations for risk assessments
   - Risk calculation validation (E × P × F methodology)
   - Business rules enforcement (residual < initial, high risk reduction)
   - Endpoints: `risks.*` (tRPC) or `/api/risks/*` (REST)

4. **[documents.contract.md](./documents.contract.md)** - Document generation
   - Asynchronous DOCX generation (background jobs)
   - Job status polling and progress tracking
   - Document download and lifecycle management
   - Endpoints: `documents.*` (tRPC) or `/api/documents/*` (REST)

---

## Additional Entities (Not Yet Documented)

Future contract files may include:

- **hazards.contract.md** - Hazard codes reference data (read-only)
- **ppe.contract.md** - Personal protective equipment
- **training.contract.md** - Training requirements
- **medical-exams.contract.md** - Medical examination requirements
- **auth.contract.md** - Authentication and user management
- **uploads.contract.md** - File uploads (org charts, Excel imports)

---

## Contract Conventions

### tRPC Procedure Naming
- `<entity>.create` - Create new record
- `<entity>.getById` - Get single record by ID
- `<entity>.list` / `<entity>.listBy<Parent>` - List records (paginated)
- `<entity>.update` - Update existing record
- `<entity>.delete` - Delete record

### REST Endpoint Mapping
- `POST /<entity>` → `create`
- `GET /<entity>/:id` → `getById`
- `GET /<entity>` → `list`
- `PUT /<entity>/:id` → `update`
- `DELETE /<entity>/:id` → `delete`

### Error Codes (HTTP / tRPC)
- `400 BAD_REQUEST` - Validation error (Zod schema violation)
- `401 UNAUTHORIZED` - Missing or invalid JWT token
- `403 FORBIDDEN` - Row-level security violation (user does not own resource)
- `404 NOT_FOUND` - Resource ID does not exist
- `409 CONFLICT` - Unique constraint violation
- `422 UNPROCESSABLE_ENTITY` - Business rule violation

### Authentication
All endpoints require JWT Bearer token in `Authorization: Bearer <token>` header (except public endpoints like health check).

### Authorization
Row-level security enforced:
- Users can only access companies they own
- Users can only access positions/risks/documents for their companies

---

## Validation

All inputs validated using **Zod schemas** shared between frontend and backend (see `shared/validators/` or `backend/src/lib/validators/`).

### Example Validation Error Response (tRPC)

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation error",
    "data": {
      "zodError": {
        "issues": [
          {
            "path": ["activityCode"],
            "message": "Activity code must be exactly 4 digits"
          }
        ]
      }
    }
  }
}
```

---

## Testing Contracts

### Contract Tests (Automated)

Located in `backend/tests/contract/`

Example:
```typescript
// backend/tests/contract/companies.contract.test.ts
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../../src/api/trpc/router';

describe('Companies Contract', () => {
  const caller = createCallerFactory(appRouter)({...mockContext});

  it('should create company with valid data', async () => {
    const result = await caller.companies.create({
      name: 'Test Company',
      address: 'Test Address',
      activityCode: '8130',
      director: 'Test Director',
      bzrResponsiblePerson: 'Test Officer',
    });

    expect(result).toMatchObject({
      id: expect.any(Number),
      name: 'Test Company',
    });
  });

  it('should reject invalid activity code', async () => {
    await expect(
      caller.companies.create({
        name: 'Test',
        address: 'Test',
        activityCode: 'ABC',  // Invalid: not 4 digits
        director: 'Test',
        bzrResponsiblePerson: 'Test',
      })
    ).rejects.toThrow('Activity code must be exactly 4 digits');
  });
});
```

### Manual Testing

Use **Thunder Client** (VS Code) or **Postman** collections.

Import Postman collection: `docs/api/BZR_Portal_API.postman_collection.json` (to be created)

---

## OpenAPI Export (Future)

tRPC procedures can be exported to OpenAPI 3.0 format for REST compatibility using `@trpc/openapi` package.

```bash
npm run generate:openapi
# Outputs: docs/api/openapi.yaml
```

This allows integration with Swagger UI for interactive API documentation.

---

## GraphQL Alternative (Not Recommended)

While GraphQL is an option, tRPC is preferred for this project because:
- Full TypeScript type safety without code generation
- Simpler than GraphQL (no schema language, no resolvers)
- Better performance (no over-fetching, no N+1 queries with proper Drizzle usage)
- Smaller bundle size (~10KB vs ~100KB for Apollo Client)

If GraphQL is required in future (e.g., for third-party integrations), consider using **Pothos** (GraphQL schema builder for TypeScript).

---

## Contract Versioning (Future)

When breaking API changes are needed:
- Create versioned procedures: `companies.v2.create`
- OR version entire router: `/api/v2/companies`
- Maintain backward compatibility for 6 months minimum
- Document deprecations in CHANGELOG.md

---

**Last Updated**: 2025-10-21
**Maintained By**: Development Team
