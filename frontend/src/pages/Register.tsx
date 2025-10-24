/**
 * Register Page (T062)
 *
 * Trial account registration page.
 * Auto-logs in user after successful registration.
 *
 * Trial Account Benefits:
 * - 14-day free trial
 * - No credit card required
 * - 1 company, 3 work positions, 5 documents
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { trpc } from '../services/api';
import { useAuthStore } from '../store/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

export function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');

  // tRPC mutation for registration
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      // Auto-login after registration
      login(data.accessToken, data.refreshToken, {
        userId: data.user.userId,
        email: data.user.email,
        role: data.user.role,
        companyId: data.user.companyId,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      });

      // Redirect to dashboard
      navigate('/dashboard');
    },
    onError: (error) => {
      setError(error.message || 'Грешка при регистрацији');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Молимо попуните сва поља');
      return;
    }

    if (formData.password.length < 8) {
      setError('Лозинка мора имати минимум 8 карактера');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Лозинке се не подударају');
      return;
    }

    // Call tRPC mutation
    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Бесплатан налог за БЗР Портал
          </CardTitle>
          <CardDescription className="text-center">
            14 дана бесплатног коришћења • Без кредитне картице
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Trial Benefits */}
            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded">
              <p className="text-sm text-blue-800 font-medium">Пробни период укључује:</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>✓ 1 предузеће</li>
                <li>✓ 3 радна места</li>
                <li>✓ 5 генерисаних докумената</li>
                <li>✓ Све функције платформе</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Име</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Петар"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  disabled={registerMutation.isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Презиме</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Петровић"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  disabled={registerMutation.isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Емаил адреса</Label>
              <Input
                id="email"
                type="email"
                placeholder="petar@kompanija.rs"
                value={formData.email}
                onChange={handleChange('email')}
                disabled={registerMutation.isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Лозинка (минимум 8 карактера)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange('password')}
                disabled={registerMutation.isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Потврда лозинке</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={registerMutation.isLoading}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isLoading}
            >
              {registerMutation.isLoading ? 'Креирање налога...' : 'Региструј се бесплатно'}
            </Button>

            <div className="text-sm text-center text-gray-600">
              Већ имате налог?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Пријавите се
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
