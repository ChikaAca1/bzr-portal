import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Alert, AlertDescription } from '../components/ui/alert';
import { trpc } from '../lib/trpc';

/**
 * ForgotPasswordPage Component (T109)
 *
 * Password reset request page where users can request a password reset link.
 * Sends reset email with token to user's registered email address.
 *
 * Features:
 * - Email validation
 * - Success state with confirmation message
 * - Error handling
 * - Serbian Cyrillic UI
 * - Rate limiting awareness (won't spam reset emails)
 *
 * Usage:
 *   Route: /forgot-password
 *   User enters email → receives reset link
 *
 * Requirements: FR-028b (Password reset flow)
 */

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Имејл адреса је обавезна')
    .email('Унесите важећу имејл адресу'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (_, variables) => {
      setSubmittedEmail(variables.email);
      setIsSubmitted(true);
    },
    onError: (error) => {
      // Show error in form
      form.setError('root', {
        message: error.message,
      });
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  // Success state - show confirmation message
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="text-green-900 dark:text-green-100">
              Имејл је послат!
            </CardTitle>
            <CardDescription>
              Проверите своју пошту
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                Послали смо линк за ресетовање лозинке на адресу:
              </p>
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mt-2">
                {submittedEmail}
              </p>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>📧 Проверите своју имејл пошту и кликните на линк</p>
              <p>⏱️ Линк истиче за 1 сат</p>
              <p>📂 Проверите и spam/junk фолдер</p>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                Ако не примите имејл у наредних 5 минута, проверите да ли је адреса тачна или покушајте поново.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
              className="w-full"
            >
              Пошаљи поново
            </Button>

            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Назад на пријаву
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Form state - request password reset
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Заборавили сте лозинку?</CardTitle>
          <CardDescription>
            Унесите вашу имејл адресу и послаћемо вам линк за ресетовање лозинке
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имејл адреса</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="alexandar.jovanovic@example.com"
                        autoComplete="email"
                        disabled={forgotPasswordMutation.isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertDescription className="text-xs">
                  💡 <strong>Напомена:</strong> Из безбедносних разлога, нећемо потврдити да ли налог постоји. Ако је имејл регистрован, примићете линк.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isLoading}
              >
                {forgotPasswordMutation.isLoading ? 'Шаљем...' : 'Пошаљи линк за ресетовање'}
              </Button>

              <div className="flex items-center justify-between w-full text-sm">
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Назад на пријаву
                </Link>

                <Link
                  to="/register"
                  className="text-muted-foreground hover:text-primary"
                >
                  Региструј се
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
