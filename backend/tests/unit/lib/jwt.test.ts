/**
 * Unit Tests: JWT Token Utilities (T016)
 *
 * Tests JWT generation, verification, and token extraction.
 * Security requirements: FR-028, FR-053a
 *
 * Test Coverage:
 * - Access token generation and verification
 * - Refresh token generation and verification
 * - Token expiration handling
 * - Token tampering detection
 * - Bearer token extraction
 * - Cookie token extraction
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// JWT_SECRET is set in tests/setup.ts
const JWT_SECRET = process.env.JWT_SECRET!;
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractBearerToken,
  extractCookieToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from '../../../src/lib/utils/jwt';

describe('JWT Token Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid access token with correct payload', () => {
      const payload = {
        userId: 123,
        email: 'test@example.com',
        role: 'bzr_officer' as const,
        companyId: 456,
      };

      const token = generateAccessToken(payload);

      expect(token).toBeTypeOf('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

      const decoded = jwt.decode(token) as AccessTokenPayload;
      expect(decoded.userId).toBe(123);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('bzr_officer');
      expect(decoded.companyId).toBe(456);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should include correct issuer and audience claims', () => {
      const payload = {
        userId: 1,
        email: 'user@test.com',
        role: 'admin' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded.iss).toBe('bzr-portal');
      expect(decoded.aud).toBe('bzr-portal-api');
    });

    it('should set expiration to 15 minutes', () => {
      const payload = {
        userId: 1,
        email: 'user@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const beforeGeneration = Math.floor(Date.now() / 1000);
      const token = generateAccessToken(payload);
      const decoded = jwt.decode(token) as AccessTokenPayload;

      const expectedExpiry = beforeGeneration + 15 * 60; // 15 minutes
      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiry - 5); // Allow 5 seconds tolerance
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiry + 5);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const payload = {
        userId: 789,
        email: 'verify@test.com',
        role: 'hr_manager' as const,
        companyId: 999,
      };

      const token = generateAccessToken(payload);
      const verified = verifyAccessToken(token);

      expect(verified.userId).toBe(789);
      expect(verified.email).toBe('verify@test.com');
      expect(verified.role).toBe('hr_manager');
      expect(verified.companyId).toBe(999);
    });

    it('should throw error for expired token', () => {
      const payload = {
        userId: 1,
        email: 'expired@test.com',
        role: 'admin' as const,
        companyId: 1,
      };

      // Generate token that expires immediately
      const expiredToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '-1s', // Already expired
        issuer: 'bzr-portal',
        audience: 'bzr-portal-api',
      });

      expect(() => verifyAccessToken(expiredToken)).toThrow('Access token expired');
    });

    it('should throw error for tampered token', () => {
      const payload = {
        userId: 1,
        email: 'tampered@test.com',
        role: 'admin' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);
      // Tamper with token by changing a character
      const tamperedToken = token.slice(0, -5) + 'XXXXX';

      expect(() => verifyAccessToken(tamperedToken)).toThrow('Invalid access token');
    });

    it('should throw error for token with wrong issuer', () => {
      const payload = {
        userId: 1,
        email: 'wrong@test.com',
        role: 'admin' as const,
        companyId: 1,
      };

      const wrongIssuerToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m',
        issuer: 'wrong-issuer',
        audience: 'bzr-portal-api',
      });

      expect(() => verifyAccessToken(wrongIssuerToken)).toThrow('Invalid access token');
    });

    it('should throw error for token with wrong audience', () => {
      const payload = {
        userId: 1,
        email: 'wrong@test.com',
        role: 'admin' as const,
        companyId: 1,
      };

      const wrongAudienceToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m',
        issuer: 'bzr-portal',
        audience: 'wrong-audience',
      });

      expect(() => verifyAccessToken(wrongAudienceToken)).toThrow('Invalid access token');
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyAccessToken('not-a-valid-jwt')).toThrow('Invalid access token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token with tokenId and expiresAt', () => {
      const userId = 555;
      const result = generateRefreshToken(userId);

      expect(result.token).toBeTypeOf('string');
      expect(result.token.split('.')).toHaveLength(3);
      expect(result.tokenId).toBeTypeOf('string');
      expect(result.tokenId).toHaveLength(64); // 32 bytes = 64 hex characters
      expect(result.expiresAt).toBeInstanceOf(Date);

      // Verify expiration is approximately 7 days from now
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs(result.expiresAt.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(60000); // Within 1 minute
    });

    it('should generate unique tokenIds for multiple tokens', () => {
      const userId = 123;
      const token1 = generateRefreshToken(userId);
      const token2 = generateRefreshToken(userId);

      expect(token1.tokenId).not.toBe(token2.tokenId);
      expect(token1.token).not.toBe(token2.token);
    });

    it('should include correct issuer and audience claims for refresh tokens', () => {
      const userId = 777;
      const { token } = generateRefreshToken(userId);
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded.iss).toBe('bzr-portal');
      expect(decoded.aud).toBe('bzr-portal-refresh');
      expect(decoded.userId).toBe(777);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const userId = 888;
      const { token, tokenId } = generateRefreshToken(userId);

      const verified = verifyRefreshToken(token);

      expect(verified.userId).toBe(888);
      expect(verified.tokenId).toBe(tokenId);
    });

    it('should throw error for expired refresh token', () => {
      const payload = {
        userId: 1,
        tokenId: 'test-token-id',
      };

      const expiredToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '-1s',
        issuer: 'bzr-portal',
        audience: 'bzr-portal-refresh',
      });

      expect(() => verifyRefreshToken(expiredToken)).toThrow('Refresh token expired');
    });

    it('should throw error for tampered refresh token', () => {
      const { token } = generateRefreshToken(123);
      const tamperedToken = token.slice(0, -5) + 'YYYYY';

      expect(() => verifyRefreshToken(tamperedToken)).toThrow('Invalid refresh token');
    });

    it('should throw error for refresh token with wrong audience', () => {
      const payload = {
        userId: 1,
        tokenId: 'test-id',
      };

      const wrongAudienceToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d',
        issuer: 'bzr-portal',
        audience: 'bzr-portal-api', // Wrong audience (should be bzr-portal-refresh)
      });

      expect(() => verifyRefreshToken(wrongAudienceToken)).toThrow('Invalid refresh token');
    });
  });

  describe('extractBearerToken', () => {
    it('should extract token from valid Bearer authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const authHeader = `Bearer ${token}`;

      const extracted = extractBearerToken(authHeader);

      expect(extracted).toBe(token);
    });

    it('should return null for missing authorization header', () => {
      const extracted = extractBearerToken(undefined);

      expect(extracted).toBeNull();
    });

    it('should return null for authorization header without Bearer prefix', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const authHeader = `Basic ${token}`; // Wrong scheme

      const extracted = extractBearerToken(authHeader);

      expect(extracted).toBeNull();
    });

    it('should return null for malformed authorization header', () => {
      const extracted = extractBearerToken('InvalidHeader');

      expect(extracted).toBeNull();
    });

    it('should handle Bearer with extra spaces', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const authHeader = `Bearer  ${token}`; // Extra space

      const extracted = extractBearerToken(authHeader);

      expect(extracted).toBe(` ${token}`); // Includes the extra space (exact substring)
    });
  });

  describe('extractCookieToken', () => {
    it('should extract token from cookie header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const cookieHeader = `accessToken=${token}`;

      const extracted = extractCookieToken(cookieHeader, 'accessToken');

      expect(extracted).toBe(token);
    });

    it('should extract token from cookie header with multiple cookies', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const cookieHeader = `session=abc123; accessToken=${token}; theme=dark`;

      const extracted = extractCookieToken(cookieHeader, 'accessToken');

      expect(extracted).toBe(token);
    });

    it('should return null for missing cookie header', () => {
      const extracted = extractCookieToken(undefined, 'accessToken');

      expect(extracted).toBeNull();
    });

    it('should return null for cookie that does not exist', () => {
      const cookieHeader = 'session=abc123; theme=dark';

      const extracted = extractCookieToken(cookieHeader, 'accessToken');

      expect(extracted).toBeNull();
    });

    it('should handle cookies with spaces after semicolons', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const cookieHeader = `session=abc123;  accessToken=${token};  theme=dark`; // Extra spaces

      const extracted = extractCookieToken(cookieHeader, 'accessToken');

      expect(extracted).toBe(token);
    });

    it('should extract refresh token from cookie', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token';
      const cookieHeader = `refreshToken=${token}; httpOnly=true; secure=true`;

      const extracted = extractCookieToken(cookieHeader, 'refreshToken');

      expect(extracted).toBe(token);
    });

    it('should return null for partial cookie name match', () => {
      const cookieHeader = 'myaccessToken=value123';

      const extracted = extractCookieToken(cookieHeader, 'accessToken');

      expect(extracted).toBeNull();
    });
  });

  describe('Token Lifecycle Integration', () => {
    it('should support full access token lifecycle', () => {
      // 1. Generate token
      const payload = {
        userId: 42,
        email: 'lifecycle@test.com',
        role: 'bzr_officer' as const,
        companyId: 100,
      };

      const token = generateAccessToken(payload);

      // 2. Extract from Bearer header
      const authHeader = `Bearer ${token}`;
      const extracted = extractBearerToken(authHeader);
      expect(extracted).toBe(token);

      // 3. Verify token
      const verified = verifyAccessToken(extracted!);
      expect(verified.userId).toBe(42);
      expect(verified.email).toBe('lifecycle@test.com');
      expect(verified.role).toBe('bzr_officer');
      expect(verified.companyId).toBe(100);
    });

    it('should support full refresh token lifecycle', () => {
      // 1. Generate refresh token
      const userId = 99;
      const { token, tokenId } = generateRefreshToken(userId);

      // 2. Extract from cookie
      const cookieHeader = `refreshToken=${token}; httpOnly=true`;
      const extracted = extractCookieToken(cookieHeader, 'refreshToken');
      expect(extracted).toBe(token);

      // 3. Verify token
      const verified = verifyRefreshToken(extracted!);
      expect(verified.userId).toBe(99);
      expect(verified.tokenId).toBe(tokenId);
    });
  });
});
