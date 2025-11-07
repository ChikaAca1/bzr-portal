import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { trpc } from '../lib/trpc';
import { DashboardLayout } from '../components/layout/DashboardLayout';

/**
 * CompanyProfilePage Component (T112)
 *
 * Company profile management page for viewing and editing company information.
 * Accessible to BZR Officers and Company Admins.
 *
 * Features:
 * - View company details (name, PIB, address, activity)
 * - Edit company information
 * - Validation for PIB, Matični broj, Activity code
 * - Trial/Professional subscription status
 * - Serbian Cyrillic UI
 *
 * Usage:
 *   Route: /dashboard/company
 *   Requires authentication + company membership
 *
 * Requirements: FR-010 (Company management)
 */

const companyProfileSchema = z.object({
  companyName: z.string().min(2, 'Назив мора имати најмање 2 карактера'),
  companyPIB: z
    .string()
    .length(9, 'ПИБ мора имати тачно 9 цифара')
    .regex(/^\d+$/, 'ПИБ може садржати само цифре'),
  companyMaticniBroj: z
    .string()
    .length(8, 'Матични број мора имати тачно 8 цифара')
    .regex(/^\d+$/, 'Матични број може садржати само цифре'),
  companyAddress: z.string().min(5, 'Адреса мора имати најмање 5 карактера'),
  companyCity: z.string().min(2, 'Град мора имати најмање 2 карактера'),
  companyPostalCode: z
    .string()
    .length(5, 'Поштански број мора имати тачно 5 цифара')
    .regex(/^\d+$/, 'Поштански број може садржати само цифре'),
  companyActivityCode: z
    .string()
    .regex(/^\d{2}\.\d{2}$/, 'Шифра делатности мора бити у формату XX.XX (нпр. 41.20)'),
  companyActivityName: z.string().optional(),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

export function CompanyProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch current user and company data
  const { data: session } = trpc.auth.getSession.useQuery();
  const { data: company, isLoading: companyLoading, refetch } = trpc.company.getCompany.useQuery(
    { companyId: session?.user?.companyId || 0 },
    { enabled: !!session?.user?.companyId }
  );

  const form = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: company?.name || '',
      companyPIB: company?.pib || '',
      companyMaticniBroj: company?.maticniBroj || '',
      companyAddress: company?.address || '',
      companyCity: company?.city || '',
      companyPostalCode: company?.postalCode || '',
      companyActivityCode: company?.activityCode || '',
      companyActivityName: company?.activityName || '',
    },
  });

  // Update company mutation
  const updateCompanyMutation = trpc.company.updateCompany.useMutation({
    onSuccess: () => {
      setSaveSuccess(true);
      setIsEditing(false);
      refetch();

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error) => {
      form.setError('root', {
        message: error.message,
      });
    },
  });

  // Populate form when company data loads
  if (company && !form.formState.isDirty) {
    form.reset({
      companyName: company.name,
      companyPIB: company.pib,
      companyMaticniBroj: company.maticniBroj || '',
      companyAddress: company.address || '',
      companyCity: company.city || '',
      companyPostalCode: company.postalCode || '',
      companyActivityCode: company.activityCode || '',
      companyActivityName: company.activityName || '',
    });
  }

  const onSubmit = (data: CompanyProfileFormData) => {
    if (!company?.companyId) return;

    updateCompanyMutation.mutate({
      companyId: company.companyId,
      name: data.companyName,
      pib: data.companyPIB,
      maticniBroj: data.companyMaticniBroj,
      address: data.companyAddress,
      city: data.companyCity,
      postalCode: data.companyPostalCode,
      activityCode: data.companyActivityCode,
      activityName: data.companyActivityName,
    });
  };

  if (companyLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Компанија није пронађена. Молимо контактирајте подршку.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Профил компаније</h1>
            <p className="text-muted-foreground mt-1">
              Погледајте и измените податке о вашој компанији
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Subscription Badge */}
            <Badge variant={company.subscriptionTier === 'professional' ? 'default' : 'secondary'}>
              {company.subscriptionTier === 'trial' ? '🎁 Пробни период' : '⭐ Professional'}
            </Badge>

            {saveSuccess && (
              <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                <Check className="h-3 w-3" />
                Сачувано
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Company Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Подаци о компанији</CardTitle>
                  <CardDescription>
                    Основне информације о предузећу и делатности
                  </CardDescription>
                </div>
              </div>

              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Измени
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Основни подаци</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Назив предузећа *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='ДОО "Технопласт"'
                              disabled={!isEditing || updateCompanyMutation.isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyPIB"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ПИБ *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123456789"
                              disabled={!isEditing || updateCompanyMutation.isLoading}
                              maxLength={9}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>9 цифара</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyMaticniBroj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Матични број *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="12345678"
                              disabled={!isEditing || updateCompanyMutation.isLoading}
                              maxLength={8}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>8 цифара</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyActivityCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Шифра делатности *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="41.20"
                              disabled={!isEditing || updateCompanyMutation.isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Формат: XX.XX</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyActivityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Назив делатности</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Изградња стамбених и нестамбених зграда"
                            disabled={!isEditing || updateCompanyMutation.isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Адреса</h3>

                  <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Улица и број *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Kralj Petra I 15"
                            disabled={!isEditing || updateCompanyMutation.isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Град *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Београд"
                              disabled={!isEditing || updateCompanyMutation.isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Поштански број *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="11000"
                              disabled={!isEditing || updateCompanyMutation.isLoading}
                              maxLength={5}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>5 цифара</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Error Alert */}
                {form.formState.errors.root && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {form.formState.errors.root.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                      disabled={updateCompanyMutation.isLoading}
                    >
                      Откажи
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateCompanyMutation.isLoading}
                      className="gap-2"
                    >
                      {updateCompanyMutation.isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Чување...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Сачувај промене
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Subscription Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Претплата</CardTitle>
            <CardDescription>Информације о вашем плану</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Тренутни план:</span>
              <Badge variant={company.subscriptionTier === 'professional' ? 'default' : 'secondary'}>
                {company.subscriptionTier === 'trial' ? 'Пробни период' : 'Professional'}
              </Badge>
            </div>

            {company.subscriptionTier === 'trial' && company.trialEndsAt && (
              <Alert>
                <AlertDescription>
                  Пробни период истиче: <strong>{new Date(company.trialEndsAt).toLocaleDateString('sr-RS')}</strong>
                </AlertDescription>
              </Alert>
            )}

            {company.subscriptionTier === 'trial' && (
              <Button className="w-full">
                Надогради на Professional
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
