import { z } from 'zod';

/**
 * Zod Validation Schemas for Authentication Endpoints (T057)
 *
 * All error messages in Serbian Cyrillic per FR-071.
 */

/**
 * Registration Schema (T023)
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Неважећа емаил адреса')
    .min(5, 'Email мора имати минимум 5 карактера')
    .max(255, 'Email је предугачак (максимум 255 карактера)')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Лозинка мора имати минимум 8 карактера')
    .max(100, 'Лозинка је предугачка')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Лозинка мора садржати: велико слово, мало слово, број и специјални карактер'
    ),

  firstName: z
    .string()
    .min(2, 'Име мора имати минимум 2 карактера')
    .max(100, 'Име је предугачко')
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(2, 'Презиме мора имати минимум 2 карактера')
    .max(100, 'Презиме је предугачко')
    .trim()
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login Schema (T024)
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Неважећа емаил адреса')
    .toLowerCase()
    .trim(),

  password: z.string().min(1, 'Лозинка је обавезна'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Email Verification Schema (T025)
 */
export const verifyEmailSchema = z.object({
  token: z
    .string()
    .regex(/^[0-9a-f]{64}$/, 'Неважећи токен формат')
    .length(64, 'Токен мора имати тачно 64 карактера'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Request Password Reset Schema (T026)
 */
export const requestResetSchema = z.object({
  email: z
    .string()
    .email('Неважећа емаил адреса')
    .toLowerCase()
    .trim(),
});

export type RequestResetInput = z.infer<typeof requestResetSchema>;

/**
 * Reset Password Schema (T026)
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .regex(/^[0-9a-f]{64}$/, 'Неважећи токен формат')
    .length(64, 'Токен мора имати тачно 64 карактера'),

  newPassword: z
    .string()
    .min(8, 'Нова лозинка мора имати минимум 8 карактера')
    .max(100, 'Нова лозинка је предугачка')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Нова лозинка мора садржати: велико слово, мало слово, број и специјални карактер'
    ),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Refresh Token Schema (T027)
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(64, 'Неважећи refresh токен'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
