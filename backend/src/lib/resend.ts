/**
 * Resend Email Service Configuration
 *
 * Resend provides developer-friendly transactional email:
 * - Free tier: 100 emails/day, 3,000/month (sufficient for MVP)
 * - Excellent deliverability
 * - Simple API
 *
 * Per spec.md:
 * - FR-028i: All emails in Serbian Cyrillic
 * - Phase 2 (T026-T029): Email service with retry logic
 */

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not set - email functionality will be disabled');
}

/**
 * Resend client instance
 *
 * @example
 * ```ts
 * import { resendClient } from './lib/resend';
 *
 * await resendClient.emails.send({
 *   from: 'BZR Portal <noreply@bzr-portal.com>',
 *   to: 'user@example.com',
 *   subject: 'Добродошли у BZR Portal',
 *   html: '<p>Ваш налог је креиран.</p>',
 * });
 * ```
 */
export const resendClient = new Resend(process.env.RESEND_API_KEY);

/**
 * Email sender configuration
 */
export const EMAIL_FROM = process.env.EMAIL_FROM || 'BZR Portal <noreply@bzr-portal.com>';

/**
 * Retry configuration for failed email sends (3 attempts with exponential backoff)
 */
export const EMAIL_RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: [1000, 2000, 4000], // 1s, 2s, 4s
};
