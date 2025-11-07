import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Alert, AlertDescription } from '../components/ui/alert';
import { trpc } from '../lib/trpc';

/**
 * ResetPasswordPage Component (T110)
 *
 * Password reset page where users set a new password using the reset token from email.
 * Validates password strength and confirms password match.
 *
 * Features:
 * - Token validation
 * - Password strength requirements (min 8 chars)
 * - Password confirmation
 * - Show/hide password toggle
 * - Success state with auto-redirect
 * - Serbian Cyrillic UI
 *
 * Usage:
 *   Route: /reset-password?token=<reset_token>
 *   User clicks link from password reset email
 *
 * Requirements: FR-028b (Password reset flow)
 */

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Лозинка мора имати најмање 8 карактера')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Лозинка мора садржати бар једно мало слово, једно велико слово и један број'
      ),
    confirmPassword: z.string().min(1, 'Потврда лозинке је обавезна'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Лозинке се не подударају',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setIsSuccess(true);

      // Start countdown for auto-redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error) => {
      form.setError('root', {
        message: error.message,
      });
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      form.setError('root', {
        message: 'Недостаје токен за ресетовање.',
      });
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword: data.password,
    });
  };

  // Check if token is missing
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Неважећи линк</CardTitle>
            <CardDescription>
              Линк за ресетовање лозинке није валидан или је истекао.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Молимо затражите нови линк за ресетовање лозинке.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full"
            >
              Затражи нови линк
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

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="text-green-900 dark:text-green-100">
              Лозинка је промењена!
            </CardTitle>
            <CardDescription>
              Ваша лозинка је успешно ресетована
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                Сада можете да се пријавите са новом лозинком.
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Аутоматско преусмеравање за <strong className="text-foreground">{countdown}</strong> {countdown === 1 ? 'секунду' : 'секунде'}...
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Пријавите се сада
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Form state - reset password
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Ресетујте лозинку</CardTitle>
          <CardDescription>
            Унесите нову лозинку за ваш налог
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Нова лозинка</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Унесите нову лозинку"
                          autoComplete="new-password"
                          disabled={resetPasswordMutation.isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={resetPasswordMutation.isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Потврдите лозинку</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Поновите нову лозинку"
                          autoComplete="new-password"
                          disabled={resetPasswordMutation.isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={resetPasswordMutation.isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
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
                  🔒 <strong>Захтеви за лозинку:</strong> Минимум 8 карактера, бар једно мало слово, једно велико слово и један број
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isLoading}
              >
                {resetPasswordMutation.isLoading ? 'Чување...' : 'Промени лозинку'}
              </Button>

              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Назад на пријаву
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
