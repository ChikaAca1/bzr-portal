import { z } from 'zod';

/**
 * Contact Form Validation Schema (Zod)
 *
 * Validation rules:
 * - name: Required, 1-255 characters
 * - email: Required, RFC 5322 format, max 255 characters
 * - companyName: Optional, max 255 characters
 * - message: Required, min 10 characters (prevents spam)
 * - website: Honeypot field (must be empty, bot detection)
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Име је обавезно')
    .max(255, 'Име не може бити дуже од 255 карактера'),

  email: z
    .string()
    .min(1, 'Email је обавезан')
    .email('Email адреса није валидна')
    .max(255, 'Email не може бити дужи од 255 карактера'),

  companyName: z
    .string()
    .max(255, 'Назив компаније не може бити дужи од 255 карактера')
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .min(10, 'Порука мора имати најмање 10 карактера')
    .max(5000, 'Порука не може бити дужа од 5000 карактера'),

  // Honeypot field - must be empty (hidden from users, bots auto-fill it)
  website: z
    .string()
    .max(0, 'Грешка при слању поруке. Покушајте поново.')
    .optional()
    .or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
