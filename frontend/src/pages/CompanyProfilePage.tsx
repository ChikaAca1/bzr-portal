import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, Pencil, Save, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Label } from '../components/ui/label';
import { trpc } from '../services/api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useQueryClient } from '@tanstack/react-query';

/**
 * CompanyProfilePage - View and edit company details
 */
export function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const companyId = parseInt(id || '0', 10);

  // Fetch company data
  const { data: company, isLoading } = trpc.companies.getById.useQuery(
    { id: companyId },
    { enabled: companyId > 0 }
  );

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    pib: '',
    maticniBroj: '',
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

  // Update form when company data loads
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        pib: company.pib || '',
        maticniBroj: company.maticniBroj || '',
        activityCode: company.activityCode || '',
        activityDescription: company.activityDescription || '',
        address: company.address || '',
        city: company.city || '',
        postalCode: company.postalCode || '',
        director: company.director || '',
        directorJmbg: company.directorJmbg || '',
        bzrResponsiblePerson: company.bzrResponsiblePerson || '',
        bzrResponsibleJmbg: company.bzrResponsibleJmbg || '',
        employeeCount: company.employeeCount || '',
      });
    }
  }, [company]);

  // Update mutation
  const updateMutation = trpc.companies.update.useMutation({
    onSuccess: () => {
      setSaveSuccess(true);
      setIsEditing(false);
      setError('');

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: [['companies', 'getById']] });
      queryClient.invalidateQueries({ queryKey: [['companies', 'list']] });

      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (err) => {
      setError(err.message || 'Грешка при ажурирању предузећа');
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.pib) {
      setError('Назив и ПИБ су обавезни');
      return;
    }

    updateMutation.mutate({
      id: companyId,
      ...formData,
    });
  };

  const handleCancel = () => {
    if (company) {
      setFormData({
        name: company.name || '',
        pib: company.pib || '',
        maticniBroj: company.maticniBroj || '',
        activityCode: company.activityCode || '',
        activityDescription: company.activityDescription || '',
        address: company.address || '',
        city: company.city || '',
        postalCode: company.postalCode || '',
        director: company.director || '',
        directorJmbg: company.directorJmbg || '',
        bzrResponsiblePerson: company.bzrResponsiblePerson || '',
        bzrResponsibleJmbg: company.bzrResponsibleJmbg || '',
        employeeCount: company.employeeCount || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Учитавање...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Alert variant="destructive">
            <AlertDescription>
              Предузеће није пронађено.
            </AlertDescription>
          </Alert>
          <Link to="/app/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад на Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/app/dashboard">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {company.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              ПИБ: {company.pib}
            </p>
          </div>
          <div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Измени
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={updateMutation.isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isLoading ? 'Чување...' : 'Сачувај'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Откажи
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              ✅ Промене су успешно сачуване!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Company Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Подаци о предузећу</CardTitle>
            <CardDescription>
              Основне информације о предузећу
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Назив предузећа *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pib">ПИБ *</Label>
                <Input
                  id="pib"
                  value={formData.pib}
                  onChange={(e) => handleChange('pib', e.target.value.replace(/\D/g, ''))}
                  maxLength={9}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maticniBroj">Матични број</Label>
                <Input
                  id="maticniBroj"
                  value={formData.maticniBroj}
                  onChange={(e) => handleChange('maticniBroj', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityCode">Шифра делатности</Label>
                <Input
                  id="activityCode"
                  value={formData.activityCode}
                  onChange={(e) => handleChange('activityCode', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="activityDescription">Опис делатности</Label>
                <Input
                  id="activityDescription"
                  value={formData.activityDescription}
                  onChange={(e) => handleChange('activityDescription', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Адреса</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Град</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Поштански број</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value.replace(/\D/g, ''))}
                  maxLength={5}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="director">Директор</Label>
                <Input
                  id="director"
                  value={formData.director}
                  onChange={(e) => handleChange('director', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="directorJmbg">ЈМБГ директора</Label>
                <Input
                  id="directorJmbg"
                  value={formData.directorJmbg}
                  onChange={(e) => handleChange('directorJmbg', e.target.value.replace(/\D/g, ''))}
                  maxLength={13}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bzrResponsiblePerson">Одговорно лице за БЗР</Label>
                <Input
                  id="bzrResponsiblePerson"
                  value={formData.bzrResponsiblePerson}
                  onChange={(e) => handleChange('bzrResponsiblePerson', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bzrResponsibleJmbg">ЈМБГ одговорног лица</Label>
                <Input
                  id="bzrResponsibleJmbg"
                  value={formData.bzrResponsibleJmbg}
                  onChange={(e) => handleChange('bzrResponsibleJmbg', e.target.value.replace(/\D/g, ''))}
                  maxLength={13}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Број запослених</Label>
                <Input
                  id="employeeCount"
                  value={formData.employeeCount}
                  onChange={(e) => handleChange('employeeCount', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
