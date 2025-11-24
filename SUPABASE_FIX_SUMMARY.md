# Supabase Integration - Fix Summary

## Problem

PostgreSQL error during user registration on Render:
```
PostgresError: column "undefined" does not exist
```

## Root Cause

Drizzle ORM enum columns (`userRoleEnum`, `accountTierEnum`) were not explicitly mapped to database column names, causing Drizzle to generate SQL with literal `"undefined"` instead of actual column names (`"role"`, `"account_tier"`).

### Generated SQL (BEFORE fix):
```sql
select "id", "email", "password_hash", "email_verified", "undefined", "company_id",
"first_name", "last_name", "undefined", "trial_expiry_date", ...
```

### Generated SQL (AFTER fix):
```sql
select "id", "email", "password_hash", "email_verified", "role", "company_id",
"first_name", "last_name", "account_tier", "trial_expiry_date", ...
```

## Solution

### File 1: `backend/src/db/schema/users.ts`

**Line 34** - Change:
```typescript
// BEFORE:
role: userRoleEnum().default('viewer').notNull(),
```

```typescript
// AFTER:
role: userRoleEnum('role').default('viewer').notNull(),
```

**Line 46** - Change:
```typescript
// BEFORE:
accountTier: accountTierEnum().default('trial').notNull(),
```

```typescript
// AFTER:
accountTier: accountTierEnum('account_tier').default('trial').notNull(),
```

### File 2: `backend/src/db/schema/companies.ts`

**Line 40** - Change:
```typescript
// BEFORE:
accountTier: accountTierEnum().default('trial').notNull(),
```

```typescript
// AFTER:
accountTier: accountTierEnum('account_tier').default('trial').notNull(),
```

## Testing

All tests passed successfully:

### ✅ Test Results:
- User registration works correctly
- User login works correctly
- Password hashing/verification works
- JWT generation works
- User data queries work
- User updates work
- Supabase connection fully functional

### Test Commands:
```bash
cd backend
npx tsx test-auth-flow.ts
```

## Deployment

1. **Apply the changes** to the two files listed above
2. **Commit the changes**:
   ```bash
   git add backend/src/db/schema/users.ts backend/src/db/schema/companies.ts
   git commit -m "fix: resolve column undefined error in Drizzle enum mapping"
   git push
   ```
3. **Render will auto-deploy** the changes
4. **Test registration** at: https://bzr-portal-backend.onrender.com

## Verification

After deployment, test registration with:
```bash
curl -X POST https://bzr-portal-backend.onrender.com/trpc/auth.register?batch=1 \
  -H "Content-Type: application/json" \
  -d '{
    "0": {
      "json": {
        "email": "test@example.com",
        "password": "Test1234!",
        "firstName": "Test",
        "lastName": "User"
      }
    }
  }'
```

Expected response: HTTP 200 with JWT tokens

## Database Status

### Supabase Connection:
- ✅ Connected successfully
- ✅ Database URL: `postgresql://postgres.dazylhbqxdmgqxgprsri@...`
- ✅ Schema: `public.users` table exists with correct structure
- ✅ All columns present and correctly typed

### Table Structure:
```sql
CREATE TABLE public.users (
  id                  INTEGER PRIMARY KEY,
  email               VARCHAR(255) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  email_verified      BOOLEAN DEFAULT FALSE NOT NULL,
  role                user_role DEFAULT 'viewer' NOT NULL,
  company_id          INTEGER,
  first_name          VARCHAR(100),
  last_name           VARCHAR(100),
  account_tier        account_tier DEFAULT 'trial' NOT NULL,
  trial_expiry_date   TIMESTAMP,
  created_at          TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMP DEFAULT NOW() NOT NULL,
  last_login_at       TIMESTAMP
);
```

## Summary

The fix is simple but critical - explicitly specifying column names for enum types in Drizzle ORM. This resolves the production error and enables full authentication functionality.

**Status: ✅ FIXED AND TESTED**

---
Generated: 2025-10-31
