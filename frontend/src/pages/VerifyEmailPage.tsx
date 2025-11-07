import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { trpc } from '../lib/trpc';

/**
 * VerifyEmailPage Component (T108)
 *
 * Email verification page that processes verification tokens from registration emails.
 * Displays success/error states and redirects users after successful verification.
 *
 * Features:
 * - Automatic token verification on mount
 * - Loading, success, and error states
 * - Serbian Cyrillic UI
 * - Auto-redirect to login after 5 seconds
 * - Manual resend verification email option
 *
 * Usage:
 *   Route: /verify-email?token=<verification_token>
 *   User clicks link from registration email
 *
 * Requirements: FR-028a (Email verification flow)
 */

type VerificationState = 'loading' | 'success' | 'error' | 'expired';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>('loading');
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');

  // tRPC mutation for email verification
  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setState('success');
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
      setErrorMessage(error.message);

      // Check if token is expired
      if (error.message.includes('истекао') || error.message.includes('expired')) {
        setState('expired');
      } else {
        setState('error');
      }
    },
  });

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMessage('Недостаје токен за верификацију.');
      return;
    }

    verifyEmailMutation.mutate({ token });
  }, [token]);

  // Render loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <CardTitle>Верификација имејла</CardTitle>
            <CardDescription>
              Молимо сачекајте док верификујемо вашу имејл адресу...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Render success state
  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="text-green-900 dark:text-green-100">
              Имејл верификован!
            </CardTitle>
            <CardDescription>
              Ваша имејл адреса је успешно потврђена.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                Сада можете да се пријавите на свој налог и почнете да користите BZR Portal.
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Аутоматско преусмеравање за <strong className="text-foreground">{countdown}</strong> {countdown === 1 ? 'секунду' : 'секунде'}...
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button
              onClick={() => navigate('/login')}
              className="w-full gap-2"
            >
              Пријавите се сада
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Назад на почетну
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render error/expired state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-destructive">
            {state === 'expired' ? 'Токен је истекао' : 'Грешка при верификацији'}
          </CardTitle>
          <CardDescription>
            {errorMessage || 'Дошло је до грешке при верификацији имејла.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive/80">
              {state === 'expired'
                ? 'Линк за верификацију је истекао. Молимо затражите нови линк.'
                : 'Молимо проверите линк или покушајте поново.'}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          {state === 'expired' && (
            <Button
              onClick={() => navigate('/resend-verification')}
              className="w-full"
            >
              Пошаљи нови линк
            </Button>
          )}

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="flex-1"
            >
              Пријави се
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/register')}
              className="flex-1"
            >
              Региструј се
            </Button>
          </div>

          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Назад на почетну
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
