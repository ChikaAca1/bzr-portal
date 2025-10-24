/**
 * Auth tRPC Router (T049-T050)
 *
 * Handles user registration and login with JWT issuance.
 * Trial account creation with limits enforcement.
 */

import { router, publicProcedure } from '../trpc/builder';
import { db } from '../../db';
import { users } from '../../db/schema/users';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../lib/utils/jwt';
import { logAuth, logError } from '../../lib/logger';
import { TRPCError } from '@trpc/server';

// =============================================================================
// Input Schemas
// =============================================================================

const registerSchema = z.object({
  email: z.string().email('Неважећа емаил адреса'),
  password: z.string().min(8, 'Лозинка мора имати минимум 8 карактера'),
  firstName: z.string().min(2, 'Име мора имати минимум 2 карактера').optional(),
  lastName: z.string().min(2, 'Презиме мора имати минимум 2 карактера').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Неважећа емаил адреса'),
  password: z.string().min(1, 'Лозинка је обавезна'),
});

// =============================================================================
// Auth Router
// =============================================================================

export const authRouter = router({
  /**
   * Register new user (trial account)
   *
   * Creates user with 'bzr_officer' role by default.
   * Trial limits: 1 company, 3 positions, 5 documents, 14 days
   *
   * Input: { email, password, firstName?, lastName? }
   * Output: { accessToken, refreshToken, user }
   * Errors: CONFLICT (email exists), BAD_REQUEST (validation)
   */
  register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const { email, password, firstName, lastName } = input;

    try {
      // Check if user already exists
      const existing = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Корисник са овом емаил адресом већ постоји.',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12', 10));

      // Create user (trial account with bzr_officer role)
      const [user] = await db
        .insert(users)
        .values({
          email,
          passwordHash,
          firstName: firstName || null,
          lastName: lastName || null,
          role: 'bzr_officer', // Default role for trial accounts
          companyId: null, // Will be set when user creates first company
        })
        .returning();

      // Generate JWT tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });

      const { token: refreshToken, tokenId, expiresAt } = generateRefreshToken(user.id);

      // Store refresh token in sessions table (if sessions table exists)
      // TODO: Implement session storage

      logAuth('login', user.id, {
        email: user.email,
        registrationMethod: 'email',
      });

      return {
        accessToken,
        refreshToken,
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      logError('Registration failed', error as Error, { email });

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Грешка при регистрацији. Покушајте поново.',
      });
    }
  }),

  /**
   * Login existing user
   *
   * Validates credentials and issues JWT tokens.
   *
   * Input: { email, password }
   * Output: { accessToken, refreshToken, user }
   * Errors: UNAUTHORIZED (invalid credentials), NOT_FOUND (user not found)
   */
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const { email, password } = input;

    try {
      // Find user by email
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Погрешан емаил или лозинка.',
        });
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);

      if (!passwordValid) {
        logAuth('auth_failure', user.id, {
          email,
          reason: 'invalid_password',
        });

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Погрешан емаил или лозинка.',
        });
      }

      // Update last login timestamp
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      // Generate JWT tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });

      const { token: refreshToken, tokenId, expiresAt } = generateRefreshToken(user.id);

      // Store refresh token in sessions table
      // TODO: Implement session storage

      logAuth('login', user.id, {
        email: user.email,
      });

      return {
        accessToken,
        refreshToken,
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      logError('Login failed', error as Error, { email });

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Грешка при пријављивању. Покушајте поново.',
      });
    }
  }),

  /**
   * Refresh access token
   *
   * Uses refresh token to issue new access token.
   *
   * Input: { refreshToken: string }
   * Output: { accessToken: string }
   * Errors: UNAUTHORIZED (invalid/expired refresh token)
   */
  refresh: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Implement refresh token validation and new access token generation
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Refresh token functionality not yet implemented',
      });
    }),

  /**
   * Logout user
   *
   * Invalidates refresh token.
   *
   * Input: { refreshToken: string }
   * Output: { success: boolean }
   */
  logout: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Implement session invalidation
      return { success: true };
    }),
});
