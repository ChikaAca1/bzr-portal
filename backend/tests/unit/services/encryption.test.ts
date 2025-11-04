import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  encryptJMBG,
  decryptJMBG,
  generateEncryptionKey,
  isValidJMBGFormat,
} from '../../../src/services/encryption';

describe('JMBG Encryption Service', () => {
  const validJMBG = '0101990123456';
  const validKey = generateEncryptionKey(); // Generate valid 32-byte key

  beforeEach(() => {
    // Set valid encryption key for tests
    process.env.ENCRYPTION_KEY = validKey;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('encryptJMBG()', () => {
    it('should encrypt valid JMBG successfully', () => {
      const encrypted = encryptJMBG(validJMBG);

      // Format: iv:authTag:ciphertext (each part hex encoded)
      expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);

      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);

      // IV should be 16 bytes (32 hex characters)
      expect(parts[0]).toHaveLength(32);

      // Auth tag should be 16 bytes (32 hex characters)
      expect(parts[1]).toHaveLength(32);

      // Ciphertext length varies but should exist
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('should generate different IV for each encryption', () => {
      const encrypted1 = encryptJMBG(validJMBG);
      const encrypted2 = encryptJMBG(validJMBG);

      // Same plaintext should produce different ciphertexts due to random IV
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to same value
      expect(decryptJMBG(encrypted1)).toBe(validJMBG);
      expect(decryptJMBG(encrypted2)).toBe(validJMBG);
    });

    it('should throw error for empty JMBG', () => {
      expect(() => encryptJMBG('')).toThrow('JMBG plaintext cannot be empty');
    });

    it('should throw error for invalid JMBG format (not 13 digits)', () => {
      expect(() => encryptJMBG('123456789')).toThrow(
        'Invalid JMBG format - must be 13 digits'
      );
      expect(() => encryptJMBG('12345678901234')).toThrow(
        'Invalid JMBG format - must be 13 digits'
      );
      expect(() => encryptJMBG('010199012345a')).toThrow(
        'Invalid JMBG format - must be 13 digits'
      );
    });

    it('should throw error if ENCRYPTION_KEY not set', () => {
      delete process.env.ENCRYPTION_KEY;

      expect(() => encryptJMBG(validJMBG)).toThrow(
        'ENCRYPTION_KEY environment variable is not set'
      );
    });

    it('should throw error if ENCRYPTION_KEY has invalid length', () => {
      process.env.ENCRYPTION_KEY = 'tooshort';

      expect(() => encryptJMBG(validJMBG)).toThrow(
        'ENCRYPTION_KEY must be 64 hex characters (32 bytes)'
      );
    });
  });

  describe('decryptJMBG()', () => {
    it('should decrypt encrypted JMBG back to original', () => {
      const encrypted = encryptJMBG(validJMBG);
      const decrypted = decryptJMBG(encrypted);

      expect(decrypted).toBe(validJMBG);
    });

    it('should throw error for empty ciphertext', () => {
      expect(() => decryptJMBG('')).toThrow('Ciphertext cannot be empty');
    });

    it('should throw error for invalid ciphertext format', () => {
      expect(() => decryptJMBG('invalid')).toThrow(
        'Invalid ciphertext format - expected iv:authTag:ciphertext'
      );
      expect(() => decryptJMBG('part1:part2')).toThrow(
        'Invalid ciphertext format - expected iv:authTag:ciphertext'
      );
    });

    it('should throw error if authentication tag verification fails (data tampered)', () => {
      const encrypted = encryptJMBG(validJMBG);
      const [iv, authTag, ciphertext] = encrypted.split(':');

      // Tamper with ciphertext
      const tamperedCiphertext = ciphertext.slice(0, -2) + 'ff';
      const tampered = `${iv}:${authTag}:${tamperedCiphertext}`;

      expect(() => decryptJMBG(tampered)).toThrow(
        'Decryption failed - data integrity check failed (possible tampering)'
      );
    });

    it('should throw error if IV length is invalid', () => {
      const encrypted = encryptJMBG(validJMBG);
      const [_iv, authTag, ciphertext] = encrypted.split(':');

      // Use short IV
      const invalidIV = 'aabbccdd';
      const invalid = `${invalidIV}:${authTag}:${ciphertext}`;

      expect(() => decryptJMBG(invalid)).toThrow('Invalid IV length - expected 16 bytes');
    });

    it('should throw error if auth tag length is invalid', () => {
      const encrypted = encryptJMBG(validJMBG);
      const [iv, _authTag, ciphertext] = encrypted.split(':');

      // Use short auth tag
      const invalidAuthTag = 'aabbccdd';
      const invalid = `${iv}:${invalidAuthTag}:${ciphertext}`;

      expect(() => decryptJMBG(invalid)).toThrow(
        'Invalid auth tag length - expected 16 bytes'
      );
    });

    it('should handle multiple encryptions with same key', () => {
      const jmbgs = ['0101990123456', '1212985234567', '2502003345678'];

      const encrypted = jmbgs.map((jmbg) => encryptJMBG(jmbg));
      const decrypted = encrypted.map((enc) => decryptJMBG(enc));

      decrypted.forEach((dec, i) => {
        expect(dec).toBe(jmbgs[i]);
      });
    });
  });

  describe('generateEncryptionKey()', () => {
    it('should generate 64-character hex string (32 bytes)', () => {
      const key = generateEncryptionKey();

      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1).not.toBe(key2);
    });

    it('generated key should be valid for encryption', () => {
      const newKey = generateEncryptionKey();
      process.env.ENCRYPTION_KEY = newKey;

      const encrypted = encryptJMBG(validJMBG);
      const decrypted = decryptJMBG(encrypted);

      expect(decrypted).toBe(validJMBG);
    });
  });

  describe('isValidJMBGFormat()', () => {
    it('should return true for valid 13-digit JMBG', () => {
      expect(isValidJMBGFormat('0101990123456')).toBe(true);
      expect(isValidJMBGFormat('1212985234567')).toBe(true);
      expect(isValidJMBGFormat('2502003345678')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidJMBGFormat('')).toBe(false);
      expect(isValidJMBGFormat('123')).toBe(false);
      expect(isValidJMBGFormat('12345678901234')).toBe(false); // 14 digits
      expect(isValidJMBGFormat('010199012345a')).toBe(false); // contains letter
      expect(isValidJMBGFormat('0101990 123456')).toBe(false); // contains space
    });
  });

  describe('End-to-End Encryption Flow', () => {
    it('should encrypt and decrypt Serbian citizen JMBG correctly', () => {
      // Real-world scenario: store encrypted JMBG in database
      const originalJMBG = '0101990800001';

      // 1. User submits JMBG → encrypt before storing
      const encryptedForDB = encryptJMBG(originalJMBG);
      expect(encryptedForDB).not.toBe(originalJMBG);

      // 2. Simulate storing in DB (in real app: INSERT INTO employees)
      const storedValue = encryptedForDB;

      // 3. Retrieve from DB → decrypt for display/validation
      const decryptedJMBG = decryptJMBG(storedValue);
      expect(decryptedJMBG).toBe(originalJMBG);
    });

    it('should maintain data integrity across multiple encrypt/decrypt cycles', () => {
      let value = validJMBG;

      // Encrypt and decrypt 10 times
      for (let i = 0; i < 10; i++) {
        const encrypted = encryptJMBG(value);
        value = decryptJMBG(encrypted);
      }

      expect(value).toBe(validJMBG);
    });
  });

  describe('Security Properties', () => {
    it('should not expose plaintext in encrypted output', () => {
      const jmbg = '0101990123456';
      const encrypted = encryptJMBG(jmbg);

      // Extract only ciphertext part (iv and authTag are random, may coincidentally contain digit sequences)
      const [_iv, _authTag, ciphertext] = encrypted.split(':');

      // Ciphertext should not contain original JMBG
      expect(ciphertext).not.toContain(jmbg);

      // Verify ciphertext is hex encoded
      expect(ciphertext).toMatch(/^[0-9a-f]+$/);
    });

    it('should use GCM authenticated encryption (prevents tampering)', () => {
      const encrypted = encryptJMBG(validJMBG);
      const [iv, authTag, ciphertext] = encrypted.split(':');

      // Flip one bit in ciphertext
      const tamperedByte = parseInt(ciphertext.substring(0, 2), 16) ^ 0x01;
      const tamperedCiphertext = tamperedByte.toString(16).padStart(2, '0') + ciphertext.substring(2);
      const tampered = `${iv}:${authTag}:${tamperedCiphertext}`;

      // Decryption should fail due to auth tag mismatch
      expect(() => decryptJMBG(tampered)).toThrow('data integrity check failed');
    });
  });
});
