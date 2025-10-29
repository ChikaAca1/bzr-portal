import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LandingNav } from '@/components/layout/LandingNav';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/**
 * ContactPage - Contact form with validation
 *
 * Phase 6 implementation
 */

// Validation schema (matches backend validation)
const contactFormSchema = z.object({
  name: z.string().min(1, 'Име је обавезно').max(255),
  email: z.string().min(1, 'Email је обавезан').email('Email адреса није валидна').max(255),
  companyName: z.string().max(255).optional().or(z.literal('')),
  message: z.string().min(10, 'Порука мора имати најмање 10 карактера').max(5000),
  website: z.string().optional().or(z.literal('')), // Honeypot
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactPage() {
  const { contact } = landingContentSr;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || contact.form.successMessage,
        });
        reset(); // Clear form
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || contact.form.errorMessage,
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: contact.form.errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 text-center">{contact.pageTitle}</h1>
          <p className="text-xl text-muted-foreground mb-12 text-center">
            {contact.pageDescription}
          </p>

          {/* Contact Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-background border border-border rounded-lg p-8 shadow-lg">
            {/* Name */}
            <div>
              <Label htmlFor="name">{contact.form.nameLabel}</Label>
              <Input
                id="name"
                type="text"
                placeholder={contact.form.namePlaceholder}
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">{contact.form.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={contact.form.emailPlaceholder}
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Company Name (Optional) */}
            <div>
              <Label htmlFor="companyName">{contact.form.companyLabel}</Label>
              <Input
                id="companyName"
                type="text"
                placeholder={contact.form.companyPlaceholder}
                {...register('companyName')}
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">{contact.form.messageLabel}</Label>
              <Textarea
                id="message"
                placeholder={contact.form.messagePlaceholder}
                rows={6}
                {...register('message')}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && (
                <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
              )}
            </div>

            {/* Honeypot (hidden) */}
            <input
              type="text"
              {...register('website')}
              style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {/* Submit Button */}
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? contact.form.submitting : contact.form.submitButton}
            </Button>

            {/* Status Messages */}
            {submitStatus && (
              <div
                className={`p-4 rounded-md ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <p className="text-sm font-medium">{submitStatus.message}</p>
              </div>
            )}
          </form>

          {/* Additional Contact Info */}
          <div className="mt-12 text-center text-muted-foreground">
            <p className="mb-2">Или нас контактирајте директно:</p>
            <p>
              Email: <a href="mailto:info@bzrportal.rs" className="text-primary hover:underline">info@bzrportal.rs</a>
            </p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
