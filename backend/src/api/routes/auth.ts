/**
 * Auth tRPC Router (T049-T050)
 *
 * Handles user registration and login with JWT issuance.
 * Trial account creation with limits enforcement.
 */

import { router, publicProcedure } from '../trpc/builder';
import { db } from '../../db';
import { users } from '../../db/schema/users';
import { sessions } from '../../db/schema/sessions';
import { emailVerificationTokens } from '../../db/schema/email-verification-tokens';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
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

      // Store refresh token in sessions table
      await db.insert(sessions).values({
        userId: user.id,
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
        ipAddress: '0.0.0.0', // TODO: Get from request context
        userAgent: 'Unknown', // TODO: Get from request headers
      });

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(emailVerificationTokens).values({
        userId: user.id,
        token: verificationToken,
        expiresAt: verificationExpiresAt,
      });

      // TODO: Send verification email via Resend
      // const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      // await sendVerificationEmail(user.email, verificationLink);

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
      await db.insert(sessions).values({
        userId: user.id,
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
        ipAddress: '0.0.0.0', // TODO: Get from request context
        userAgent: 'Unknown', // TODO: Get from request headers
      });

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
      const { refreshToken } = input;

      try {
        // Find session with this refresh token
        const session = await db.query.sessions.findFirst({
          where: (sessions, { eq }) => eq(sessions.refreshToken, refreshToken),
        });

        if (!session) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Неважећи refresh token.',
          });
        }

        // Check if token is expired
        if (session.refreshTokenExpiresAt < new Date()) {
          // Delete expired session
          await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));

          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Refresh token је истекао. Молимо пријавите се поново.',
          });
        }

        // Get user
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, session.userId),
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Корисник није пронађен.',
          });
        }

        // Generate new access token
        const accessToken = generateAccessToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        });

        logAuth('token_refreshed', user.id, { email: user.email });

        return {
          accessToken,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logError('Token refresh failed', error as Error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Грешка при обнављању токена.',
        });
      }
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
      const { refreshToken } = input;

      try {
        // Find and delete session
        const session = await db.query.sessions.findFirst({
          where: (sessions, { eq }) => eq(sessions.refreshToken, refreshToken),
        });

        if (session) {
          await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));

          logAuth('logout', session.userId, {});
        }

        return { success: true };
      } catch (error) {
        logError('Logout failed', error as Error);

        // Don't throw error on logout - always return success
        return { success: true };
      }
    }),

  /**
   * Verify email address
   *
   * Validates email verification token and marks email as verified.
   *
   * Input: { token: string }
   * Output: { success: boolean }
   * Errors: UNAUTHORIZED (invalid/expired token)
   */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().regex(/^[0-9a-f]{64}$/, 'Неважећи формат токена') }))
    .mutation(async ({ input }) => {
      const { token } = input;

      try {
        // Find verification token
        const verificationToken = await db.query.emailVerificationTokens.findFirst({
          where: (tokens, { eq }) => eq(tokens.token, token),
        });

        if (!verificationToken) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Неважећи токен за верификацију.',
          });
        }

        // Check if token is expired
        if (verificationToken.expiresAt < new Date()) {
          // Delete expired token
          await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));

          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Токен за верификацију је истекао.',
          });
        }

        // Mark email as verified
        await db
          .update(users)
          .set({ emailVerified: true })
          .where(eq(users.id, verificationToken.userId));

        // Delete used token
        await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));

        logAuth('email_verified', verificationToken.userId, {});

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logError('Email verification failed', error as Error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Грешка при верификацији емаила.',
        });
      }
    }),

  /**
   * Request password reset
   *
   * Generates reset token and sends email.
   *
   * Input: { email: string }
   * Output: { success: boolean }
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input;

      try {
        // Find user (don't reveal if email exists - security)
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, email),
        });

        if (user) {
          // Generate password reset token
          const resetToken = crypto.randomBytes(32).toString('hex');
          const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

          // Delete old reset tokens for this user
          await db
            .delete(emailVerificationTokens)
            .where(eq(emailVerificationTokens.userId, user.id));

          // Store new reset token (reusing emailVerificationTokens table)
          // TODO: Create separate passwordResetTokens table
          await db.insert(emailVerificationTokens).values({
            userId: user.id,
            token: resetToken,
            expiresAt: resetExpiresAt,
          });

          // TODO: Send password reset email via Resend
          // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
          // await sendPasswordResetEmail(user.email, resetLink);

          logAuth('password_reset_requested', user.id, { email });
        }

        // Always return success (don't reveal if email exists)
        return {
          success: true,
          message: 'Ако емаил постоји, послаћемо линк за ресетовање лозинке.',
        };
      } catch (error) {
        logError('Password reset request failed', error as Error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Грешка при захтеву за ресетовање лозинке.',
        });
      }
    }),

  /**
   * Reset password
   *
   * Validates reset token and updates password.
   *
   * Input: { token: string, newPassword: string }
   * Output: { success: boolean }
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().regex(/^[0-9a-f]{64}$/),
        newPassword: z.string().min(8, 'Лозинка мора имати минимум 8 карактера'),
      })
    )
    .mutation(async ({ input }) => {
      const { token, newPassword } = input;

      try {
        // Find reset token
        const resetToken = await db.query.emailVerificationTokens.findFirst({
          where: (tokens, { eq }) => eq(tokens.token, token),
        });

        if (!resetToken) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Неважећи токен за ресетовање лозинке.',
          });
        }

        // Check if token is expired
        if (resetToken.expiresAt < new Date()) {
          await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));

          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Токен за ресетовање лозинке је истекао.',
          });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12', 10));

        // Update password
        await db
          .update(users)
          .set({ passwordHash })
          .where(eq(users.id, resetToken.userId));

        // Delete used token
        await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));

        // Invalidate all sessions for this user (force re-login)
        await db.delete(sessions).where(eq(sessions.userId, resetToken.userId));

        logAuth('password_reset_success', resetToken.userId, {});

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logError('Password reset failed', error as Error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Грешка при ресетовању лозинке.',
        });
      }
    }),
});
