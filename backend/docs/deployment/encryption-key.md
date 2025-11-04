# JMBG Encryption Key Setup

## Overview

BZR Portal uses AES-256-GCM encryption to protect sensitive personal data (JMBG) per FR-031 and FR-049c requirements.

This document explains how to generate and configure the encryption key for both development and production environments.

---

## Generate Encryption Key

### Option 1: Using Node.js Script

Run the following script to generate a secure 256-bit encryption key:

```bash
cd backend
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Output example**:
```
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Option 2: Using TypeScript Service

```typescript
import { generateEncryptionKey } from './src/services/encryption';

const key = generateEncryptionKey();
console.log(`ENCRYPTION_KEY=${key}`);
```

---

## Configuration

### Development (.env.local)

Add the generated key to your `.env.local` file:

```env
# JMBG Encryption Key (AES-256-GCM)
# ⚠️  NEVER commit this to version control
# ⚠️  Generate a new key using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Production (Vercel)

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add new variable:
   - **Name**: `ENCRYPTION_KEY`
   - **Value**: (paste generated 64-character hex string)
   - **Environments**: Production, Preview, Development
3. Click **Save**
4. Redeploy your application

### Supabase / Render

Add as environment variable in platform dashboard:
- Variable name: `ENCRYPTION_KEY`
- Value: 64-character hex string

---

## Security Best Practices

### ✅ DO

- **Generate a unique key for each environment** (dev, staging, production)
- **Store keys in environment variables** (never hardcode)
- **Use 256-bit keys** (64 hex characters)
- **Rotate keys annually** or after suspected compromise
- **Back up production key securely** (password manager, KMS)
- **Restrict access** to production key (only ops team)

### ❌ DON'T

- **Never commit keys to Git** (add `.env*` to `.gitignore`)
- **Never share keys via email/Slack** (use secure channels)
- **Never reuse dev keys in production**
- **Never log/print keys** in application logs
- **Never store keys in database** (use env vars only)

---

## Key Rotation

If you need to rotate the encryption key (e.g., annual security policy, key compromise):

### 1. Generate New Key

```bash
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "New key: $NEW_KEY"
```

### 2. Decrypt with Old Key, Re-encrypt with New Key

```typescript
import { decryptJMBG, encryptJMBG } from './services/encryption';

// Set old key temporarily
process.env.ENCRYPTION_KEY = OLD_KEY;
const decrypted = decryptJMBG(oldEncryptedValue);

// Switch to new key
process.env.ENCRYPTION_KEY = NEW_KEY;
const newEncrypted = encryptJMBG(decrypted);

// Update database with newEncrypted value
```

### 3. Migration Script Template

```sql
-- Backup table before rotation
CREATE TABLE employees_backup AS SELECT * FROM employees;

-- Application-layer re-encryption via Node.js script
-- (Cannot be done in SQL due to crypto operations)

-- Verify all records migrated
SELECT COUNT(*) FROM employees WHERE director_jmbg_encrypted != '';
```

---

## Validation

### Test Encryption/Decryption

```typescript
import { encryptJMBG, decryptJMBG } from './src/services/encryption';

const testJMBG = '0101990123456';

// Encrypt
const encrypted = encryptJMBG(testJMBG);
console.log('Encrypted:', encrypted);
// Output: "a1b2c3...f0:e9d8c7...a0:9f8e7d..."

// Decrypt
const decrypted = decryptJMBG(encrypted);
console.log('Decrypted:', decrypted);
// Output: "0101990123456"

// Verify
console.assert(decrypted === testJMBG, 'Encryption test failed!');
console.log('✅ Encryption test passed');
```

### Run Unit Tests

```bash
cd backend
npm test tests/unit/services/encryption.test.ts
```

Expected output:
```
✓ tests/unit/services/encryption.test.ts (22 tests)
  Test Files  1 passed (1)
       Tests  22 passed (22)
```

---

## Troubleshooting

### Error: "ENCRYPTION_KEY environment variable is not set"

**Solution**: Add `ENCRYPTION_KEY` to your `.env.local` file or environment variables.

### Error: "ENCRYPTION_KEY must be 64 hex characters (32 bytes)"

**Solution**: Ensure your key is exactly 64 hexadecimal characters (0-9, a-f).

### Error: "Decryption failed - data integrity check failed"

**Possible causes**:
1. **Different encryption key** - Encrypted with Key A, trying to decrypt with Key B
2. **Data corruption** - Ciphertext was modified/truncated
3. **Wrong format** - Expected `iv:authTag:ciphertext` format

**Solution**: Verify you're using the correct encryption key for this environment.

---

## Implementation Details

- **Algorithm**: AES-256-GCM (NIST approved)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (16 bytes, random per encryption)
- **Auth Tag Size**: 128 bits (16 bytes, prevents tampering)
- **Format**: `${iv}:${authTag}:${ciphertext}` (all hex encoded)

**Why GCM mode?**
- Provides both **confidentiality** (encryption) and **authenticity** (integrity check)
- Detects tampering attempts (auth tag verification fails)
- Industry standard for data-at-rest encryption

---

## Compliance

- ✅ **FR-031**: Personal data encryption (JMBG)
- ✅ **FR-049c**: AES-256-GCM encryption algorithm
- ✅ **GDPR Article 32**: State-of-the-art technical measures
- ✅ **Constitution Principle III**: Security by Design

---

## Support

For security-related questions, contact:
- **DevOps Team**: devops@bzr-portal.com
- **Security Officer**: security@bzr-portal.com

**🔒 Remember**: Never share encryption keys via insecure channels!
