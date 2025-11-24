# 🧪 Auth Endpoints - Manual Testing Guide

## Prerequisites

1. **Start backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Backend should be running on:** `http://localhost:3000`

---

## Test 1: Register New User

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "Марко",
    "lastName": "Марковић"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Налог креиран. Проверите email за верификацију.",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "firstName": "Марко",
    "lastName": "Марковић",
    "emailVerified": false
  }
}
```

**What happens:**
- User created in database
- Email verification token generated
- Email sent (check Resend dashboard or logs)

---

## Test 2: Try Login Before Email Verification

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**Expected Response (403):**
```json
{
  "success": false,
  "error": "Молимо верификујте email адресу. Проверите inbox за верификациони линк (важи 7 дана)."
}
```

---

## Test 3: Verify Email

**Step 1:** Get verification token from database or email logs:
```bash
# Query database (example with psql)
psql $DATABASE_URL -c "SELECT token FROM email_verification_tokens ORDER BY created_at DESC LIMIT 1;"
```

**Step 2:** Verify email with token:
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PASTE_TOKEN_HERE"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Email успешно верификован! Можете се пријавити."
}
```

---

## Test 4: Login After Verification

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6789abcdef0123456789...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "firstName": "Марко",
    "lastName": "Марковић",
    "role": "viewer",
    "companyId": null,
    "accountTier": "trial",
    "trialExpiryDate": "2025-12-08T12:00:00.000Z"
  }
}
```

**Save the tokens:**
```bash
# Copy accessToken for next tests
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
REFRESH_TOKEN="a1b2c3d4e5f6789abcdef0123456789..."
```

---

## Test 5: Request Password Reset

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Ако email постоји, послали смо линк за ресетовање лозинке."
}
```

**What happens:**
- Password reset token generated (valid 60 minutes)
- Email sent with reset link

---

## Test 6: Reset Password

**Step 1:** Get reset token from database:
```bash
psql $DATABASE_URL -c "SELECT token FROM password_reset_tokens ORDER BY created_at DESC LIMIT 1;"
```

**Step 2:** Reset password:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PASTE_RESET_TOKEN_HERE",
    "newPassword": "NewPassword123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Лозинка успешно промењена! Можете се пријавити са новом лозинком."
}
```

**What happens:**
- Password updated
- All sessions invalidated (security measure)

---

## Test 7: Login with New Password

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "NewPassword123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "accessToken": "...",
  "refreshToken": "...",
  "user": { ... }
}
```

---

## Test 8: Refresh Access Token

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "PASTE_REFRESH_TOKEN_HERE"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new_rotated_refresh_token..."
}
```

**Note:** Refresh token is rotated for enhanced security!

---

## Test 9: Use Access Token to Access Protected Route

**Example:** (Once we implement company routes)
```bash
curl -X GET http://localhost:3000/api/companies \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Error Scenarios to Test

### Invalid Email Format
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "invalid-email", "password": "Test1234!" }'
```

**Expected:** 400 with Serbian error message

### Weak Password
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "test2@example.com", "password": "weak" }'
```

**Expected:** 400 with password requirements message in Serbian

### Duplicate Email
```bash
# Try to register with same email twice
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", "password": "Test1234!" }'
```

**Expected:** 400 with "Email већ постоји" message

### Invalid Login Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", "password": "WrongPassword!" }'
```

**Expected:** 401 with "Неважећи email или лозинка"

### Expired Token
```bash
# Use a token that's older than 7 days for verification
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{ "token": "expired_token_here" }'
```

**Expected:** 400 with "Токен је истекао" message

---

## Database Verification Queries

**Check created user:**
```sql
SELECT id, email, email_verified, account_tier, trial_expiry_date, created_at
FROM users
WHERE email = 'test@example.com';
```

**Check sessions:**
```sql
SELECT id, user_id, refresh_token, refresh_token_expires_at, ip_address, created_at
FROM sessions
WHERE user_id = 1;
```

**Check verification tokens:**
```sql
SELECT id, user_id, token, expires_at, created_at
FROM email_verification_tokens
WHERE user_id = 1;
```

**Check password reset tokens:**
```sql
SELECT id, user_id, token, expires_at, created_at
FROM password_reset_tokens
WHERE user_id = 1;
```

---

## Success Checklist

- [ ] ✅ User can register
- [ ] ✅ Verification email sent
- [ ] ✅ Cannot login before verification
- [ ] ✅ Email verification works
- [ ] ✅ Can login after verification
- [ ] ✅ Receives access + refresh tokens
- [ ] ✅ Password reset request works
- [ ] ✅ Password reset email sent
- [ ] ✅ Can reset password with token
- [ ] ✅ Old sessions invalidated after reset
- [ ] ✅ Can login with new password
- [ ] ✅ Refresh token rotation works
- [ ] ✅ All error messages in Serbian Cyrillic
- [ ] ✅ Zod validation catches bad inputs

---

## Next Steps After Auth Works

1. **Implement auth middleware** for protected routes
2. **Create company management endpoints** (POST /api/companies)
3. **Test end-to-end flow:** Register → Verify → Login → Create Company → Create Position
