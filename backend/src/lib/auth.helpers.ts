import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Auth Helper Utilities (T023-T027)
 *
 * Provides secure implementations of:
 * - Password hashing/verification (bcrypt)
 * - JWT token generation/verification
 * - Secure random token generation
 */

// Environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '30d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

/**
 * JWT Payload Interface
 */
export interface JwtPayload {
  userId: number;
  email: string;
  companyId: number | null;
  role: string;
}

/**
 * Hash password using bcrypt (12 rounds per FR-053)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token (15-minute expiry per FR-028)
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
    issuer: 'bzr-portal',
    audience: 'bzr-portal-api',
  });
}

/**
 * Generate JWT refresh token (30-day expiry)
 * Note: Actual refresh token stored in DB is a random string, not a JWT.
 * This function generates a secure random hex string.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64-char hex string
}

/**
 * Verify and decode JWT access token
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string, {
      issuer: 'bzr-portal',
      audience: 'bzr-portal-api',
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Generate secure random token for email verification or password reset
 * Returns 64-character hex string
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate expiration date from now + duration in milliseconds
 */
export function getExpirationDate(durationMs: number): Date {
  return new Date(Date.now() + durationMs);
}

/**
 * Common expiration durations (in milliseconds)
 */
export const EXPIRATION = {
  EMAIL_VERIFICATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  PASSWORD_RESET: 60 * 60 * 1000, // 60 minutes
  REFRESH_TOKEN: 30 * 24 * 60 * 60 * 1000, // 30 days
  ACCESS_TOKEN: 15 * 60 * 1000, // 15 minutes
} as const;

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}
