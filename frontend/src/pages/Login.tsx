/**
 * Login Page (T061)
 *
 * User authentication page with email/password form.
 * Uses tRPC for type-safe API calls and Zustand for state management.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { trpc } from '../services/api';
import { useAuthStore } from '../store/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // tRPC mutation for login
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // Update Zustand store
      login(data.accessToken, data.refreshToken, {
        userId: data.user.userId,
        email: data.user.email,
        role: data.user.role,
        companyId: data.user.companyId,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      });

      // Redirect to dashboard
      navigate('/app/dashboard');
    },
    onError: (error) => {
      setError(error.message || 'Грешка при пријављивању');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Молимо унесите емаил и лозинку');
      return;
    }

    // Call tRPC mutation
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Пријава на БЗР Портал
          </CardTitle>
          <CardDescription className="text-center">
            Унесите ваше податке за приступ систему
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Емаил адреса</Label>
              <Input
                id="email"
                type="email"
                placeholder="primer@kompanija.rs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Лозинка</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isLoading}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? 'Пријављивање...' : 'Пријави се'}
            </Button>

            <div className="text-sm text-center text-gray-600">
              Немате налог?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Региструјте се бесплатно
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
