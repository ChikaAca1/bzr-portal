import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * JMBG Encryption Service
 *
 * Implements AES-256-GCM encryption for sensitive personal data (JMBG)
 * per FR-031 and FR-049c requirements.
 *
 * Security Features:
 * - AES-256-GCM (Galois/Counter Mode) for authenticated encryption
 * - Random IV (Initialization Vector) for each encryption operation
 * - Authentication tag verification to detect tampering
 * - Key derived from ENCRYPTION_KEY environment variable
 *
 * @see specs/main/spec.md FR-031, FR-049c
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM mode
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment variable
 * Key must be 32 bytes (256 bits) for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Convert hex string to buffer (expecting 64 hex characters = 32 bytes)
  if (key.length !== KEY_LENGTH * 2) {
    throw new Error(
      `ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes)`
    );
  }

  const buffer = Buffer.from(key, 'hex');

  if (buffer.length !== KEY_LENGTH) {
    throw new Error('Invalid ENCRYPTION_KEY format');
  }

  return buffer;
}

/**
 * Encrypt JMBG using AES-256-GCM
 *
 * @param plaintext - JMBG string (13 digits)
 * @returns Encrypted string in format: iv:authTag:ciphertext (hex encoded)
 *
 * @example
 * const encrypted = encryptJMBG('0101990123456');
 * // Returns: "a1b2c3d4...f0:e9d8c7b6...a0:9f8e7d6c..."
 */
export function encryptJMBG(plaintext: string): string {
  if (!plaintext) {
    throw new Error('JMBG plaintext cannot be empty');
  }

  // Validate JMBG format (13 digits)
  if (!/^\d{13}$/.test(plaintext)) {
    throw new Error('Invalid JMBG format - must be 13 digits');
  }

  const key = getEncryptionKey();

  // Generate random IV (crucial for security - never reuse IV with same key)
  const iv = randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get authentication tag (GCM provides authenticated encryption)
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (all hex encoded)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt JMBG using AES-256-GCM
 *
 * @param ciphertext - Encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted JMBG string (13 digits)
 *
 * @throws Error if authentication tag verification fails (data tampered)
 *
 * @example
 * const decrypted = decryptJMBG(encrypted);
 * // Returns: "0101990123456"
 */
export function decryptJMBG(ciphertext: string): string {
  if (!ciphertext) {
    throw new Error('Ciphertext cannot be empty');
  }

  // Parse format: iv:authTag:ciphertext
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format - expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  // Validate lengths
  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length - expected ${IV_LENGTH} bytes`);
  }
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Invalid auth tag length - expected ${AUTH_TAG_LENGTH} bytes`);
  }

  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  // Set authentication tag (GCM will verify integrity)
  decipher.setAuthTag(authTag);

  try {
    // Decrypt
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Authentication tag verification failed - data was tampered with
    throw new Error('Decryption failed - data integrity check failed (possible tampering)');
  }
}

/**
 * Generate a new encryption key for ENCRYPTION_KEY environment variable
 *
 * @returns 64-character hex string (32 bytes = 256 bits)
 *
 * @example
 * const key = generateEncryptionKey();
 * console.log(`ENCRYPTION_KEY=${key}`);
 * // Add to .env file
 */
export function generateEncryptionKey(): string {
  const key = randomBytes(KEY_LENGTH);
  return key.toString('hex');
}

/**
 * Validate JMBG format before encryption
 *
 * @param jmbg - JMBG string to validate
 * @returns true if valid format
 */
export function isValidJMBGFormat(jmbg: string): boolean {
  return /^\d{13}$/.test(jmbg);
}
