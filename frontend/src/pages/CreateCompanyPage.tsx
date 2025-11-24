/**
 * Create Company Page
 *
 * Simple form for creating a new company
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function CreateCompanyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    pib: '',
    activityCode: '',
    activityDescription: '',
    address: '',
    city: '',
    postalCode: '',
    director: '',
    directorJmbg: '',
    bzrResponsiblePerson: '',
    bzrResponsibleJmbg: '',
    employeeCount: '',
  });

  // tRPC mutation for creating company
  const createMutation = trpc.companies.create.useMutation({
    onSuccess: (data) => {
      // Invalidate companies list cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: [['companies', 'list']] });

      // Redirect to dashboard after successful creation
      navigate('/app/dashboard');
    },
    onError: (error) => {
      setError(error.message || 'Грешка при креирању предузећа');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name || !formData.pib) {
      setError('Молимо унесите назив и ПИБ');
      return;
    }

    if (formData.pib.length !== 9) {
      setError('ПИБ мора имати тачно 9 цифара');
      return;
    }

    // Call tRPC mutation
    createMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Додај ново предузеће</h1>
          <p className="text-muted-foreground mt-2">
            Унесите основне податке о вашем предузећу
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Подаци о предузећу</CardTitle>
              <CardDescription>
                Основне информације о предузећу и делатности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Назив предузећа *</Label>
                  <Input
                    id="name"
                    placeholder="нпр. ABC д.о.о."
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pib">ПИБ *</Label>
                  <Input
                    id="pib"
                    placeholder="9 цифара"
                    maxLength={9}
                    value={formData.pib}
                    onChange={(e) => handleChange('pib', e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityCode">Шифра делатности</Label>
                  <Input
                    id="activityCode"
                    placeholder="нпр. 6201"
                    value={formData.activityCode}
                    onChange={(e) => handleChange('activityCode', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityDescription">Опис делатности</Label>
                  <Input
                    id="activityDescription"
                    placeholder="нпр. Рачунарско програмирање"
                    value={formData.activityDescription}
                    onChange={(e) => handleChange('activityDescription', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Адреса</Label>
                  <Input
                    id="address"
                    placeholder="нпр. Тестна улица 123"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Град</Label>
                  <Input
                    id="city"
                    placeholder="нпр. Београд"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Поштански број</Label>
                  <Input
                    id="postalCode"
                    placeholder="нпр. 11000"
                    maxLength={5}
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="director">Директор</Label>
                  <Input
                    id="director"
                    placeholder="Име и презиме"
                    value={formData.director}
                    onChange={(e) => handleChange('director', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directorJmbg">ЈМБГ директора</Label>
                  <Input
                    id="directorJmbg"
                    placeholder="13 цифара"
                    maxLength={13}
                    value={formData.directorJmbg}
                    onChange={(e) => handleChange('directorJmbg', e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bzrResponsiblePerson">Одговорно лице за БЗР</Label>
                  <Input
                    id="bzrResponsiblePerson"
                    placeholder="Име и презиме"
                    value={formData.bzrResponsiblePerson}
                    onChange={(e) => handleChange('bzrResponsiblePerson', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bzrResponsibleJmbg">ЈМБГ одговорног лица</Label>
                  <Input
                    id="bzrResponsibleJmbg"
                    placeholder="13 цифара"
                    maxLength={13}
                    value={formData.bzrResponsibleJmbg}
                    onChange={(e) => handleChange('bzrResponsibleJmbg', e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Број запослених</Label>
                  <Input
                    id="employeeCount"
                    placeholder="нпр. 10"
                    value={formData.employeeCount}
                    onChange={(e) => handleChange('employeeCount', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isLoading}
                >
                  {createMutation.isLoading ? 'Креирање...' : 'Креирај предузеће'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/app/dashboard')}
                >
                  Откажи
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
