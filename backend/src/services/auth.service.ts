/**
 * Authentication Service (Phase 2.5: T040e)
 *
 * Implements user registration, login, logout, and session management.
 * Security requirements: FR-028, FR-029, FR-030
 */

import { db } from '../db';
import { users, sessions, NewUser, User } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../lib/utils/crypto';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  type AccessTokenPayload,
} from '../lib/utils/jwt';

// =============================================================================
// TypeScript Types
// =============================================================================

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'bzr_officer' | 'hr_manager' | 'viewer';
  companyId?: number;
}

export interface LoginInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    companyId: number | null;
  };
}

// =============================================================================
// AuthService Class
// =============================================================================

export class AuthService {
  /**
   * Register a new user
   *
   * @param input - Registration data
   * @returns User - Created user (without password hash)
   * @throws Error if email already exists or validation fails
   */
  async register(input: RegisterInput): Promise<User> {
    const { email, password, firstName, lastName, role, companyId } = input;

    // Validate email format
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // Validate password strength
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || 'viewer',
        companyId: companyId || null,
      })
      .returning();

    return newUser;
  }

  /**
   * Login user and create session
   *
   * @param input - Login credentials + metadata
   * @returns LoginResult - Access token, refresh token, and user data
   * @throws Error if credentials are invalid
   */
  async login(input: LoginInput): Promise<LoginResult> {
    const { email, password, userAgent, ipAddress } = input;

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    const { token: refreshToken, tokenId, expiresAt } = generateRefreshToken(user.id);

    // Store refresh token in database (for revocation capability)
    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokenId, // Store tokenId, not full JWT
      refreshTokenExpiresAt: expiresAt,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
    });

    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: user.companyId,
      },
    };
  }

  /**
   * Logout user (revoke refresh token)
   *
   * @param refreshToken - Refresh token to revoke
   * @returns boolean - True if successfully revoked
   */
  async logout(refreshToken: string): Promise<boolean> {
    try {
      // Verify token first
      const payload = verifyRefreshToken(refreshToken);

      // Delete session from database
      await db.delete(sessions).where(eq(sessions.refreshToken, payload.tokenId));

      return true;
    } catch (error) {
      // Token invalid or already expired
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - Valid refresh token
   * @returns Object with new access token and refresh token
   * @throws Error if refresh token is invalid or revoked
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists in database (not revoked)
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.refreshToken, payload.tokenId),
    });

    if (!session) {
      throw new Error('Refresh token has been revoked or does not exist');
    }

    // Check if expired
    if (session.refreshTokenExpiresAt < new Date()) {
      // Delete expired session
      await db.delete(sessions).where(eq(sessions.id, session.id));
      throw new Error('Refresh token has expired');
    }

    // Get user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    // Rotate refresh token (security best practice)
    const { token: newRefreshToken, tokenId: newTokenId, expiresAt } = generateRefreshToken(user.id);

    // Update session with new refresh token
    await db
      .update(sessions)
      .set({
        refreshToken: newTokenId,
        refreshTokenExpiresAt: expiresAt,
        lastActivityAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Validate session (check if user is authenticated)
   *
   * @param accessToken - Access token from request
   * @returns AccessTokenPayload - Decoded user data
   * @throws Error if token is invalid
   */
  async validateSession(accessToken: string): Promise<AccessTokenPayload> {
    const { verifyAccessToken } = await import('../lib/utils/jwt');

    // This will throw if token is invalid/expired
    const payload = verifyAccessToken(accessToken);

    // Optionally: Check if user still exists and is active
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    return payload;
  }

  /**
   * Revoke all sessions for a user (force logout from all devices)
   *
   * @param userId - User ID
   * @returns number - Count of revoked sessions
   */
  async revokeAllUserSessions(userId: number): Promise<number> {
    const result = await db.delete(sessions).where(eq(sessions.userId, userId)).returning();

    return result.length;
  }
}

// Export singleton instance
export const authService = new AuthService();
