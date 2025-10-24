/**
 * JWT Token Utilities (Phase 2.5: T040g)
 *
 * Implements JWT-based authentication with access/refresh token strategy.
 * Security requirements: FR-028
 *
 * Token Strategy:
 * - Access tokens: Short-lived (15 minutes), stored in httpOnly cookie
 * - Refresh tokens: Long-lived (7 days), stored in DB for revocation
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// =============================================================================
// Configuration
// =============================================================================

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = process.env.JWT_EXPIRY || '7d'; // 7 days default

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// =============================================================================
// TypeScript Types
// =============================================================================

export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: 'admin' | 'bzr_officer' | 'hr_manager' | 'viewer';
  companyId: number | null;
  iat?: number; // Issued at
  exp?: number; // Expires at
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: string; // Unique ID to identify refresh token in DB
  iat?: number;
  exp?: number;
}

// =============================================================================
// Access Token Functions
// =============================================================================

/**
 * Generate an access token (short-lived, 15 minutes)
 *
 * @param payload - User data to encode
 * @returns string - Signed JWT token
 *
 * Example payload:
 * {
 *   userId: 123,
 *   email: "user@example.com",
 *   role: "bzr_officer",
 *   companyId: 456
 * }
 */
export function generateAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'bzr-portal',
    audience: 'bzr-portal-api',
  });
}

/**
 * Verify and decode an access token
 *
 * @param token - JWT string
 * @returns AccessTokenPayload - Decoded payload
 * @throws Error if token is invalid, expired, or tampered
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET!, {
      issuer: 'bzr-portal',
      audience: 'bzr-portal-api',
    }) as AccessTokenPayload;

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

// =============================================================================
// Refresh Token Functions
// =============================================================================

/**
 * Generate a refresh token (long-lived, 7 days)
 *
 * @param userId - User ID
 * @returns Object with token string and tokenId for DB storage
 *
 * Example:
 * {
 *   token: "eyJhbGciOi...",
 *   tokenId: "a1b2c3d4e5f6...",
 *   expiresAt: Date (7 days from now)
 * }
 */
export function generateRefreshToken(userId: number): {
  token: string;
  tokenId: string;
  expiresAt: Date;
} {
  // Generate unique token ID (stored in DB for revocation)
  const tokenId = crypto.randomBytes(32).toString('hex');

  // Calculate expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  // Create JWT
  const token = jwt.sign({ userId, tokenId }, JWT_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'bzr-portal',
    audience: 'bzr-portal-refresh',
  });

  return { token, tokenId, expiresAt };
}

/**
 * Verify and decode a refresh token
 *
 * @param token - JWT string
 * @returns RefreshTokenPayload - Decoded payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET!, {
      issuer: 'bzr-portal',
      audience: 'bzr-portal-refresh',
    }) as RefreshTokenPayload;

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

// =============================================================================
// Token Extraction Helpers
// =============================================================================

/**
 * Extract Bearer token from Authorization header
 *
 * @param authHeader - Authorization header value
 * @returns string | null - Token if found, null otherwise
 *
 * Example:
 *   "Bearer eyJhbGciOi..." → "eyJhbGciOi..."
 *   "invalid" → null
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Extract token from httpOnly cookie
 *
 * @param cookieHeader - Cookie header value
 * @param cookieName - Name of the cookie (e.g., "accessToken")
 * @returns string | null - Token if found, null otherwise
 */
export function extractCookieToken(
  cookieHeader: string | undefined,
  cookieName: string
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const tokenCookie = cookies.find((c) => c.startsWith(`${cookieName}=`));

  if (!tokenCookie) {
    return null;
  }

  return tokenCookie.substring(cookieName.length + 1);
}
