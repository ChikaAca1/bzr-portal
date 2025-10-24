/**
 * Cryptographic Utilities (Phase 2.5: T040f)
 *
 * Provides:
 * 1. Password hashing using bcrypt
 * 2. JMBG encryption/decryption using AES-256-GCM
 *
 * Security requirements: FR-031, FR-049c
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';

// =============================================================================
// Password Hashing (bcrypt)
// =============================================================================

const BCRYPT_ROUNDS = 12; // Cost factor (higher = more secure but slower)

/**
 * Hash a plain text password using bcrypt
 *
 * @param password - Plain text password
 * @returns Promise<string> - Bcrypt hash (60 characters)
 *
 * Example: "MySecurePass123" → "$2a$12$..."
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a plain text password against a bcrypt hash
 *
 * @param password - Plain text password to verify
 * @param hash - Stored bcrypt hash
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// =============================================================================
// JMBG Encryption (AES-256-GCM)
// =============================================================================

/**
 * Get encryption key from environment variable
 *
 * IMPORTANT: This key must be:
 * - 32 bytes (256 bits) for AES-256
 * - Stored in secure env variable (NOT in .env file in production!)
 * - Rotated periodically
 *
 * For production, use: AWS Secrets Manager, HashiCorp Vault, or similar
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;

  if (!keyHex) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
        'Generate with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }

  const key = Buffer.from(keyHex, 'hex');

  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters) for AES-256');
  }

  return key;
}

/**
 * Encrypt JMBG (Serbian personal ID) using AES-256-GCM
 *
 * @param jmbg - Plain text JMBG (13 digits)
 * @returns string - Encrypted JMBG in format: "iv:authTag:ciphertext" (hex-encoded)
 *
 * Example:
 *   Input: "1234567890123"
 *   Output: "a1b2c3d4e5f6....:f1e2d3c4b5a6....:9a8b7c6d5e4f...."
 *
 * Security:
 * - Uses AES-256-GCM (authenticated encryption)
 * - Random IV (Initialization Vector) per encryption
 * - Auth tag prevents tampering
 */
export function encryptJMBG(jmbg: string): string {
  if (!jmbg || !/^\d{13}$/.test(jmbg)) {
    throw new Error('JMBG must be exactly 13 digits');
  }

  const key = getEncryptionKey();

  // Generate random IV (12 bytes recommended for GCM)
  const iv = crypto.randomBytes(12);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // Encrypt
  let ciphertext = cipher.update(jmbg, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  // Get authentication tag (16 bytes)
  const authTag = cipher.getAuthTag();

  // Return format: "iv:authTag:ciphertext" (all hex-encoded)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`;
}

/**
 * Decrypt JMBG using AES-256-GCM
 *
 * @param encrypted - Encrypted JMBG in format "iv:authTag:ciphertext"
 * @returns string - Plain text JMBG (13 digits)
 *
 * Throws error if:
 * - Decryption fails (wrong key)
 * - Auth tag verification fails (data tampered)
 */
export function decryptJMBG(encrypted: string): string {
  if (!encrypted || !encrypted.includes(':')) {
    throw new Error('Invalid encrypted JMBG format');
  }

  const [ivHex, authTagHex, ciphertext] = encrypted.split(':');

  if (!ivHex || !authTagHex || !ciphertext) {
    throw new Error('Malformed encrypted JMBG (missing iv, authTag, or ciphertext)');
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Generate a secure random encryption key (32 bytes for AES-256)
 *
 * Usage:
 *   const key = generateEncryptionKey();
 *   console.log(key); // Copy to ENCRYPTION_KEY env variable
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
