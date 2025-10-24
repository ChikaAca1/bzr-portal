import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCompany, useUpdateCompany } from '../../hooks/useCompanies';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

/**
 * PIB Validator (modulo-11 checksum)
 */
function validatePIB(pib: string): boolean {
  if (!/^\d{9}$/.test(pib)) return false;

  const digits = pib.split('').map(Number);
  const checksum =
    (11 -
      ((7 * digits[0]! +
        6 * digits[1]! +
        5 * digits[2]! +
        4 * digits[3]! +
        3 * digits[4]! +
        2 * digits[5]! +
        7 * digits[6]! +
        6 * digits[7]!) %
        11)) %
    11;

  return checksum === digits[8];
}

/**
 * Company Form Schema (copied from backend validator)
 */
const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Назив предузећа мора имати најмање 2 карактера')
    .max(255, 'Назив предузећа може имати максимално 255 карактера'),

  pib: z
    .string()
    .length(9, 'PIB мора имати тачно 9 цифара')
    .regex(/^\d{9}$/, 'PIB мора садржати само цифре')
    .refine(validatePIB, 'Неисправан PIB - провера modulo-11 није прошла'),

  activityCode: z
    .string()
    .length(4, 'Шифра делатности мора имати тачно 4 цифре')
    .regex(/^\d{4}$/, 'Шифра делатности мора садржати само цифре'),

  address: z
    .string()
    .min(5, 'Адреса мора имати најмање 5 карактера')
    .max(500, 'Адреса може имати максимално 500 карактера'),

  director: z
    .string()
    .min(2, 'Име директора мора имати најмање 2 карактера')
    .max(255, 'Име директора може имати максимално 255 карактера'),

  bzrResponsiblePerson: z
    .string()
    .min(2, 'Име лица за БЗР мора имати најмање 2 карактера')
    .max(255, 'Име лица за БЗР може имати максимално 255 карактера'),

  maticniBroj: z
    .string()
    .length(8, 'Матични број мора имати тачно 8 цифара')
    .regex(/^\d{8}$/, 'Матични број мора садржати само цифре')
    .optional()
    .or(z.literal('')),

  activityDescription: z.string().max(1000).optional().or(z.literal('')),

  city: z.string().max(100).optional().or(z.literal('')),

  postalCode: z
    .string()
    .max(10)
    .regex(/^\d+$/, 'Поштански број мора садржати само цифре')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .max(50)
    .regex(/^[0-9\s\-\+\(\)]+$/, 'Неисправан формат телефона')
    .optional()
    .or(z.literal('')),

  email: z.string().email('Неисправан формат email адресе').max(255).optional().or(z.literal('')),

  directorJmbg: z
    .string()
    .length(13, 'JMBG мора имати тачно 13 цифара')
    .regex(/^\d{13}$/, 'JMBG мора садржати само цифре')
    .optional()
    .or(z.literal('')),

  bzrResponsibleJmbg: z
    .string()
    .length(13, 'JMBG мора имати тачно 13 цифара')
    .regex(/^\d{13}$/, 'JMBG мора садржати само цифре')
    .optional()
    .or(z.literal('')),

  employeeCount: z.string().max(10).optional().or(z.literal('')),

  organizationChart: z.string().url('Неисправан URL').optional().or(z.literal('')),
});

type CompanyFormData = z.infer<typeof createCompanySchema>;

interface CompanyFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<CompanyFormData>;
  companyId?: number;
}

/**
 * CompanyForm Component (T061)
 *
 * Form for creating/updating companies with React Hook Form + Zod validation.
 * Validates PIB with modulo-11 checksum per FR-043b.
 */
export function CompanyForm({ onSuccess, defaultValues, companyId }: CompanyFormProps) {
  const { createCompany, isCreating, error: createError } = useCreateCompany();
  const { updateCompany, isUpdating, error: updateError } = useUpdateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: defaultValues || {
      name: '',
      pib: '',
      activityCode: '',
      address: '',
      director: '',
      bzrResponsiblePerson: '',
      maticniBroj: '',
      activityDescription: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      directorJmbg: '',
      bzrResponsibleJmbg: '',
      employeeCount: '',
      organizationChart: '',
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    // Convert empty strings to undefined for optional fields
    const cleanedData = {
      ...data,
      maticniBroj: data.maticniBroj || undefined,
      activityDescription: data.activityDescription || undefined,
      city: data.city || undefined,
      postalCode: data.postalCode || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      directorJmbg: data.directorJmbg || undefined,
      bzrResponsibleJmbg: data.bzrResponsibleJmbg || undefined,
      employeeCount: data.employeeCount || undefined,
      organizationChart: data.organizationChart || undefined,
    };

    if (companyId) {
      updateCompany({ id: companyId, ...cleanedData } as any, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    } else {
      createCompany(cleanedData as any, {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;
  const error = createError || updateError;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{companyId ? 'Измени предузеће' : 'Ново предузеће'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Обавезни подаци</h3>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Назив предузећа *
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="нпр. Предузеће за производњу д.о.о."
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pib" className="block text-sm font-medium mb-1">
                  PIB *
                </label>
                <input
                  {...register('pib')}
                  id="pib"
                  type="text"
                  maxLength={9}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456789"
                />
                {errors.pib && (
                  <p className="text-sm text-red-600 mt-1">{errors.pib.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="activityCode" className="block text-sm font-medium mb-1">
                  Шифра делатности *
                </label>
                <input
                  {...register('activityCode')}
                  id="activityCode"
                  type="text"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234"
                />
                {errors.activityCode && (
                  <p className="text-sm text-red-600 mt-1">{errors.activityCode.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Адреса *
              </label>
              <input
                {...register('address')}
                id="address"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Улица и број"
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="director" className="block text-sm font-medium mb-1">
                Директор *
              </label>
              <input
                {...register('director')}
                id="director"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Име и презиме директора"
              />
              {errors.director && (
                <p className="text-sm text-red-600 mt-1">{errors.director.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="bzrResponsiblePerson" className="block text-sm font-medium mb-1">
                Лице одговорно за БЗР *
              </label>
              <input
                {...register('bzrResponsiblePerson')}
                id="bzrResponsiblePerson"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Име и презиме лица одговорног за БЗР"
              />
              {errors.bzrResponsiblePerson && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.bzrResponsiblePerson.message}
                </p>
              )}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Опциони подаци</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="maticniBroj" className="block text-sm font-medium mb-1">
                  Матични број
                </label>
                <input
                  {...register('maticniBroj')}
                  id="maticniBroj"
                  type="text"
                  maxLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345678"
                />
                {errors.maticniBroj && (
                  <p className="text-sm text-red-600 mt-1">{errors.maticniBroj.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="employeeCount" className="block text-sm font-medium mb-1">
                  Број запослених
                </label>
                <input
                  {...register('employeeCount')}
                  id="employeeCount"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="нпр. 50"
                />
                {errors.employeeCount && (
                  <p className="text-sm text-red-600 mt-1">{errors.employeeCount.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="activityDescription" className="block text-sm font-medium mb-1">
                Опис делатности
              </label>
              <textarea
                {...register('activityDescription')}
                id="activityDescription"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Детаљан опис делатности предузећа"
              />
              {errors.activityDescription && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.activityDescription.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  Град
                </label>
                <input
                  {...register('city')}
                  id="city"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Београд"
                />
                {errors.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                  Поштански број
                </label>
                <input
                  {...register('postalCode')}
                  id="postalCode"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="11000"
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-600 mt-1">{errors.postalCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Телефон
                </label>
                <input
                  {...register('phone')}
                  id="phone"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+381 11 1234567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="kontakt@preduzece.rs"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="directorJmbg" className="block text-sm font-medium mb-1">
                  JMBG директора
                </label>
                <input
                  {...register('directorJmbg')}
                  id="directorJmbg"
                  type="text"
                  maxLength={13}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890123"
                />
                {errors.directorJmbg && (
                  <p className="text-sm text-red-600 mt-1">{errors.directorJmbg.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="bzrResponsibleJmbg" className="block text-sm font-medium mb-1">
                  JMBG лица за БЗР
                </label>
                <input
                  {...register('bzrResponsibleJmbg')}
                  id="bzrResponsibleJmbg"
                  type="text"
                  maxLength={13}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890123"
                />
                {errors.bzrResponsibleJmbg && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.bzrResponsibleJmbg.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="organizationChart" className="block text-sm font-medium mb-1">
                Систематизација (URL)
              </label>
              <input
                {...register('organizationChart')}
                id="organizationChart"
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/org-chart.pdf"
              />
              {errors.organizationChart && (
                <p className="text-sm text-red-600 mt-1">{errors.organizationChart.message}</p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Грешка при чувању:</p>
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Чување...' : companyId ? 'Сачувај измене' : 'Креирај предузеће'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
