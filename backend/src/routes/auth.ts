import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import {
  users,
  sessions,
  emailVerificationTokens,
  passwordResetTokens,
} from '../db/schema';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestResetSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../schemas/auth.schemas';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
  getExpirationDate,
  EXPIRATION,
} from '../lib/auth.helpers';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';

/**
 * Authentication Routes (T023-T027)
 *
 * Implements JWT-based authentication with:
 * - User registration with email verification (FR-028)
 * - Login with session management (FR-053)
 * - Password reset flow (FR-028k)
 * - Refresh token rotation (FR-053a)
 *
 * All error messages in Serbian Cyrillic per FR-071.
 */

const auth = new Hono();

/**
 * T023: POST /api/auth/register
 *
 * Creates new user account and sends verification email.
 * Trial account limits enforced at application layer (FR-028b).
 */
auth.post('/register', async (c) => {
  try {
    // 1. Parse and validate request body
    const body = await c.req.json();
    const validatedData = registerSchema.parse(body);

    // 2. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json(
        {
          success: false,
          error: 'Email адреса већ постоји. Покушајте да се пријавите или користите другу email адресу.',
        },
        400
      );
    }

    // 3. Hash password (bcrypt, 12 rounds per FR-053)
    const passwordHash = await hashPassword(validatedData.password);

    // 4. Create user in database (trial account by default)
    const trialExpiryDate = getExpirationDate(
      parseInt(process.env.TRIAL_DURATION_DAYS || '14', 10) * 24 * 60 * 60 * 1000
    );

    const [user] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName || null,
        lastName: validatedData.lastName || null,
        emailVerified: false,
        accountTier: 'trial',
        role: 'viewer', // Default role, can be upgraded later
        trialExpiryDate, // Starts AFTER email verification per FR-028g
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 5. Generate email verification token (64-char hex, valid 7 days)
    const verificationToken = generateSecureToken();
    const tokenExpiresAt = getExpirationDate(EXPIRATION.EMAIL_VERIFICATION);

    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token: verificationToken,
      expiresAt: tokenExpiresAt,
      createdAt: new Date(),
    });

    // 6. Send verification email (Resend per FR-028h)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail(user.email, {
        firstName: user.firstName || 'Корисниче',
        verificationUrl,
        expiryHours: 7 * 24, // 7 days
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails - user can request resend
    }

    // 7. Return success (WITHOUT tokens - user must verify email first)
    return c.json(
      {
        success: true,
        message: 'Налог креиран. Проверите email за верификацију.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    // Zod validation errors
    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Валидација неуспешна',
          details: error.errors,
        },
        400
      );
    }

    // Generic error
    return c.json(
      {
        success: false,
        error: 'Грешка при регистрацији. Покушајте поново.',
      },
      500
    );
  }
});

/**
 * T024: POST /api/auth/login
 *
 * Authenticates user and issues JWT access + refresh tokens.
 * Creates session record in database for refresh token management.
 */
auth.post('/login', async (c) => {
  try {
    // 1. Parse and validate request body
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);

    // 2. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Неважећи email или лозинка',
        },
        401
      );
    }

    // 3. Verify password
    const isPasswordValid = await verifyPassword(validatedData.password, user.passwordHash);

    if (!isPasswordValid) {
      return c.json(
        {
          success: false,
          error: 'Неважећи email или лозинка',
        },
        401
      );
    }

    // 4. Check if email is verified (FR-028g)
    if (!user.emailVerified) {
      return c.json(
        {
          success: false,
          error: 'Молимо верификујте email адресу. Проверите inbox за верификациони линк (важи 7 дана).',
        },
        403
      );
    }

    // 5. Generate JWT access token (15 minutes per FR-053a)
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    // 6. Generate refresh token (30 days, stored in DB)
    const refreshToken = generateRefreshToken();
    const refreshExpiresAt = getExpirationDate(EXPIRATION.REFRESH_TOKEN);

    // 7. Create session record
    const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    await db.insert(sessions).values({
      userId: user.id,
      refreshToken,
      refreshTokenExpiresAt: refreshExpiresAt,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastActivityAt: new Date(),
    });

    // 8. Update lastLoginAt timestamp
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // 9. Return tokens and user data
    return c.json(
      {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId,
          accountTier: user.accountTier,
          trialExpiryDate: user.trialExpiryDate,
        },
      },
      200
    );
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Валидација неуспешна',
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: 'Грешка при пријављивању. Покушајте поново.',
      },
      500
    );
  }
});

/**
 * T025: POST /api/auth/verify-email
 *
 * Confirms email address using token from email link.
 * Activates trial account and starts 14-day countdown (FR-028g).
 */
auth.post('/verify-email', async (c) => {
  try {
    // 1. Parse and validate request body
    const body = await c.req.json();
    const validatedData = verifyEmailSchema.parse(body);

    // 2. Find token in database
    const [tokenRecord] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, validatedData.token))
      .limit(1);

    if (!tokenRecord) {
      return c.json(
        {
          success: false,
          error: 'Неважећи или истекао токен. Тражите нови.',
        },
        400
      );
    }

    // 3. Check if token expired (7 days)
    if (new Date() > tokenRecord.expiresAt) {
      // Clean up expired token
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, tokenRecord.id));

      return c.json(
        {
          success: false,
          error: 'Токен је истекао. Тражите нови верификациони линк.',
        },
        400
      );
    }

    // 4. Update user: emailVerified = true, trial starts now
    const verifiedAt = new Date();
    const trialExpiryDate = getExpirationDate(
      parseInt(process.env.TRIAL_DURATION_DAYS || '14', 10) * 24 * 60 * 60 * 1000
    );

    await db
      .update(users)
      .set({
        emailVerified: true,
        trialExpiryDate, // 14-day countdown starts now (FR-028g)
        updatedAt: verifiedAt,
      })
      .where(eq(users.id, tokenRecord.userId));

    // 5. Delete verification token (single-use)
    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, tokenRecord.id));

    // 6. Return success
    return c.json(
      {
        success: true,
        message: 'Email успешно верификован! Можете се пријавити.',
      },
      200
    );
  } catch (error: any) {
    console.error('Email verification error:', error);

    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Валидација неуспешна',
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: 'Грешка при верификацији. Покушајте поново.',
      },
      500
    );
  }
});

/**
 * T026: POST /api/auth/request-reset
 *
 * Generates password reset token and sends email.
 * Token valid for 60 minutes (FR-028k).
 */
auth.post('/request-reset', async (c) => {
  try {
    // 1. Parse and validate request body
    const body = await c.req.json();
    const validatedData = requestResetSchema.parse(body);

    // 2. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    // Security: Always return success even if email doesn't exist (prevents email enumeration)
    const successMessage = 'Ако email постоји, послали смо линк за ресетовање лозинке.';

    if (!user) {
      return c.json({ success: true, message: successMessage }, 200);
    }

    // 3. Generate reset token (64-char hex, valid 60 minutes)
    const resetToken = generateSecureToken();
    const tokenExpiresAt = getExpirationDate(EXPIRATION.PASSWORD_RESET);

    // 4. Delete any existing reset tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    // 5. Insert new reset token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt: tokenExpiresAt,
      createdAt: new Date(),
    });

    // 6. Send password reset email (Resend per FR-028h)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, {
        firstName: user.firstName || 'Корисниче',
        resetUrl,
        expiryMinutes: 60,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request - user can try again
    }

    // 7. Return success
    return c.json({ success: true, message: successMessage }, 200);
  } catch (error: any) {
    console.error('Request reset error:', error);

    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Валидација неуспешна',
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: 'Грешка при захтеву за ресетовање. Покушајте поново.',
      },
      500
    );
  }
});

/**
 * T026: POST /api/auth/reset-password
 *
 * Resets user password with valid token.
 * Invalidates all sessions for security (FR-028k).
 */
auth.post('/reset-password', async (c) => {
  try {
    // 1. Parse and validate request body
    const body = await c.req.json();
    const validatedData = resetPasswordSchema.parse(body);

    // 2. Find token in database
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, validatedData.token))
      .limit(1);

    if (!tokenRecord) {
      return c.json(
        {
          success: false,
          error: 'Неважећи или истекао токен.',
        },
        400
      );
    }

    // 3. Check if token expired (60 minutes)
    if (new Date() > tokenRecord.expiresAt) {
      // Clean up expired token
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, tokenRecord.id));

      return c.json(
        {
          success: false,
          error: 'Токен је истекао. Тражите нови линк за ресетовање.',
        },
        400
      );
    }

    // 4. Hash new password
    const newPasswordHash = await hashPassword(validatedData.newPassword);

    // 5. Update user password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenRecord.userId));

    // 6. Delete reset token (single-use)
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, tokenRecord.id));

    // 7. Invalidate ALL sessions for security (FR-028k)
    await db.delete(sessions).where(eq(sessions.userId, tokenRecord.userId));

    // 8. Return success
    return c.json(
      {
        success: true,
        message: 'Лозинка успешно промењена! Можете се пријавити са новом лозинком.',
      },
      200
    );
  } catch (error: any) {
    console.error('Reset password error:', error);

    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Валидација неуспешна',
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: 'Грешка при ресетовању лозинке. Покушајте поново.',
      },
      500
    );
  }
});

/**
 * T027: POST /api/auth/refresh
 *
 * Issues new access token using valid refresh token.
 * Optionally rotates refresh token for enhanced security.
 */
auth.post('/refresh', async (c) => {
  try {
    // 1. Parse and validate request body
    const body = await c.req.json();
    const validatedData = refreshTokenSchema.parse(body);

    // 2. Find session with this refresh token
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshToken, validatedData.refreshToken))
      .limit(1);

    if (!session) {
      return c.json(
        {
          success: false,
          error: 'Неважећи refresh токен',
        },
        401
      );
    }

    // 3. Check if refresh token expired (30 days)
    if (new Date() > session.refreshTokenExpiresAt) {
      // Clean up expired session
      await db.delete(sessions).where(eq(sessions.id, session.id));

      return c.json(
        {
          success: false,
          error: 'Сесија истекла. Логујте се поново.',
        },
        401
      );
    }

    // 4. Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Корисник не постоји',
        },
        401
      );
    }

    // 5. Generate NEW access token (15 minutes)
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    // 6. (Optional) Rotate refresh token for enhanced security
    const newRefreshToken = generateRefreshToken();
    const newRefreshExpiresAt = getExpirationDate(EXPIRATION.REFRESH_TOKEN);

    await db
      .update(sessions)
      .set({
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: newRefreshExpiresAt,
        lastActivityAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    // 7. Return new tokens
    return c.json(
      {
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // Return rotated token
      },
      200
    );
  } catch (error: any) {
    console.error('Refresh token error:', error);

    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Валидација неуспешна',
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: 'Грешка при обнављању токена. Покушајте поново.',
      },
      500
    );
  }
});

export default auth;
