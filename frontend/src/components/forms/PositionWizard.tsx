import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useCompanies } from '../../hooks/useCompanies';

/**
 * Position Form Schema (copied from backend validator)
 */
const createPositionSchema = z.object({
  companyId: z.number().int().positive('ID предузећа је обавезан'),

  positionName: z
    .string()
    .min(2, 'Назив радног места мора имати најмање 2 карактера')
    .max(255, 'Назив радног места може имати максимално 255 карактера'),

  department: z.string().max(255).optional().or(z.literal('')),

  positionCode: z.string().max(50).optional().or(z.literal('')),

  jobDescription: z.string().max(5000).optional().or(z.literal('')),

  workEnvironment: z.string().max(2000).optional().or(z.literal('')),

  equipmentUsed: z.string().max(2000).optional().or(z.literal('')),

  hazardousMaterials: z.string().max(2000).optional().or(z.literal('')),

  requiredEducation: z.string().max(255).optional().or(z.literal('')),

  requiredExperience: z.string().max(255).optional().or(z.literal('')),

  additionalQualifications: z.string().max(2000).optional().or(z.literal('')),

  workSchedule: z.string().max(255).optional().or(z.literal('')),

  shiftWork: z.boolean().default(false),

  nightWork: z.boolean().default(false),

  overtimeFrequency: z.string().max(100).optional().or(z.literal('')),

  maleCount: z.number().int().min(0, 'Број мушкараца не може бити негативан').default(0),

  femaleCount: z.number().int().min(0, 'Број жена не може бити негативан').default(0),

  totalCount: z.number().int().min(0, 'Укупан број не може бити негативан').default(0),
});

type PositionFormData = z.infer<typeof createPositionSchema>;

interface PositionWizardProps {
  onSubmit: (data: PositionFormData) => void;
  onCancel?: () => void;
  defaultValues?: Partial<PositionFormData>;
  isSubmitting?: boolean;
}

/**
 * PositionWizard Component (T062)
 *
 * Multi-step form wizard for creating/updating work positions.
 * Steps: Basic Info → Job Description → Work Hours
 */
export function PositionWizard({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
}: PositionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { companies } = useCompanies();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<PositionFormData>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: defaultValues || {
      companyId: companies[0]?.id,
      positionName: '',
      department: '',
      positionCode: '',
      jobDescription: '',
      workEnvironment: '',
      equipmentUsed: '',
      hazardousMaterials: '',
      requiredEducation: '',
      requiredExperience: '',
      additionalQualifications: '',
      workSchedule: '',
      shiftWork: false,
      nightWork: false,
      overtimeFrequency: '',
      maleCount: 0,
      femaleCount: 0,
      totalCount: 0,
    },
  });

  const totalSteps = 3;

  // Validate current step before proceeding
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof PositionFormData)[] = [];

    if (step === 1) {
      fieldsToValidate = [
        'companyId',
        'positionName',
        'department',
        'positionCode',
        'maleCount',
        'femaleCount',
        'totalCount',
      ];
    } else if (step === 2) {
      fieldsToValidate = [
        'jobDescription',
        'workEnvironment',
        'equipmentUsed',
        'hazardousMaterials',
        'requiredEducation',
        'requiredExperience',
        'additionalQualifications',
      ];
    } else if (step === 3) {
      fieldsToValidate = ['workSchedule', 'shiftWork', 'nightWork', 'overtimeFrequency'];
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = handleSubmit((data) => {
    // Convert empty strings to undefined
    const cleanedData = {
      ...data,
      department: data.department || undefined,
      positionCode: data.positionCode || undefined,
      jobDescription: data.jobDescription || undefined,
      workEnvironment: data.workEnvironment || undefined,
      equipmentUsed: data.equipmentUsed || undefined,
      hazardousMaterials: data.hazardousMaterials || undefined,
      requiredEducation: data.requiredEducation || undefined,
      requiredExperience: data.requiredExperience || undefined,
      additionalQualifications: data.additionalQualifications || undefined,
      workSchedule: data.workSchedule || undefined,
      overtimeFrequency: data.overtimeFrequency || undefined,
    };

    onSubmit(cleanedData as PositionFormData);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Ново радно место - Корак {currentStep}/{totalSteps}
        </CardTitle>
        {/* Progress indicator */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded ${
                step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Основни подаци</h3>

              <div>
                <label htmlFor="companyId" className="block text-sm font-medium mb-1">
                  Предузеће *
                </label>
                <select
                  {...register('companyId', { valueAsNumber: true })}
                  id="companyId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p className="text-sm text-red-600 mt-1">{errors.companyId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="positionName" className="block text-sm font-medium mb-1">
                  Назив радног места *
                </label>
                <input
                  {...register('positionName')}
                  id="positionName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="нпр. Оператер на машини"
                />
                {errors.positionName && (
                  <p className="text-sm text-red-600 mt-1">{errors.positionName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium mb-1">
                    Организациона јединица
                  </label>
                  <input
                    {...register('department')}
                    id="department"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="нпр. Производња"
                  />
                  {errors.department && (
                    <p className="text-sm text-red-600 mt-1">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="positionCode" className="block text-sm font-medium mb-1">
                    Шифра радног места
                  </label>
                  <input
                    {...register('positionCode')}
                    id="positionCode"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="нпр. РМ-001"
                  />
                  {errors.positionCode && (
                    <p className="text-sm text-red-600 mt-1">{errors.positionCode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Број запослених</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="maleCount" className="block text-xs text-gray-600 mb-1">
                      Мушкарци
                    </label>
                    <input
                      {...register('maleCount', { valueAsNumber: true })}
                      id="maleCount"
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.maleCount && (
                      <p className="text-xs text-red-600 mt-1">{errors.maleCount.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="femaleCount" className="block text-xs text-gray-600 mb-1">
                      Жене
                    </label>
                    <input
                      {...register('femaleCount', { valueAsNumber: true })}
                      id="femaleCount"
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.femaleCount && (
                      <p className="text-xs text-red-600 mt-1">{errors.femaleCount.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="totalCount" className="block text-xs text-gray-600 mb-1">
                      Укупно
                    </label>
                    <input
                      {...register('totalCount', { valueAsNumber: true })}
                      id="totalCount"
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.totalCount && (
                      <p className="text-xs text-red-600 mt-1">{errors.totalCount.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job Description */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Опис посла</h3>

              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium mb-1">
                  Детаљан опис посла
                </label>
                <textarea
                  {...register('jobDescription')}
                  id="jobDescription"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Опишите задатке и одговорности на овом радном месту..."
                />
                {errors.jobDescription && (
                  <p className="text-sm text-red-600 mt-1">{errors.jobDescription.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="workEnvironment" className="block text-sm font-medium mb-1">
                  Радно окружење
                </label>
                <textarea
                  {...register('workEnvironment')}
                  id="workEnvironment"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="нпр. Производна хала, температура, бука, вибрације..."
                />
                {errors.workEnvironment && (
                  <p className="text-sm text-red-600 mt-1">{errors.workEnvironment.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="equipmentUsed" className="block text-sm font-medium mb-1">
                  Опрема и алати
                </label>
                <textarea
                  {...register('equipmentUsed')}
                  id="equipmentUsed"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Наведите опрему, машине и алате који се користе..."
                />
                {errors.equipmentUsed && (
                  <p className="text-sm text-red-600 mt-1">{errors.equipmentUsed.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="hazardousMaterials" className="block text-sm font-medium mb-1">
                  Опасне материје
                </label>
                <textarea
                  {...register('hazardousMaterials')}
                  id="hazardousMaterials"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Наведите хемикалије, опасне материје или штетне агенсе..."
                />
                {errors.hazardousMaterials && (
                  <p className="text-sm text-red-600 mt-1">{errors.hazardousMaterials.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="requiredEducation" className="block text-sm font-medium mb-1">
                    Потребна стручна спрема
                  </label>
                  <input
                    {...register('requiredEducation')}
                    id="requiredEducation"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="нпр. III степен, SSS"
                  />
                  {errors.requiredEducation && (
                    <p className="text-sm text-red-600 mt-1">{errors.requiredEducation.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="requiredExperience" className="block text-sm font-medium mb-1">
                    Потребно искуство
                  </label>
                  <input
                    {...register('requiredExperience')}
                    id="requiredExperience"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="нпр. 2 године на сличним пословима"
                  />
                  {errors.requiredExperience && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.requiredExperience.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="additionalQualifications"
                  className="block text-sm font-medium mb-1"
                >
                  Додатне квалификације
                </label>
                <textarea
                  {...register('additionalQualifications')}
                  id="additionalQualifications"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="нпр. Дозволе, сертификати, обуке..."
                />
                {errors.additionalQualifications && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.additionalQualifications.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Work Hours */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Радно време</h3>

              <div>
                <label htmlFor="workSchedule" className="block text-sm font-medium mb-1">
                  Распоред рада
                </label>
                <input
                  {...register('workSchedule')}
                  id="workSchedule"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="нпр. Пон-Пет 08:00-16:00"
                />
                {errors.workSchedule && (
                  <p className="text-sm text-red-600 mt-1">{errors.workSchedule.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    {...register('shiftWork')}
                    id="shiftWork"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="shiftWork" className="ml-2 text-sm font-medium">
                    Рад у сменама
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...register('nightWork')}
                    id="nightWork"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="nightWork" className="ml-2 text-sm font-medium">
                    Ноћни рад
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="overtimeFrequency" className="block text-sm font-medium mb-1">
                  Учесталост прековременог рада
                </label>
                <input
                  {...register('overtimeFrequency')}
                  id="overtimeFrequency"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="нпр. Повремено, по потреби"
                />
                {errors.overtimeFrequency && (
                  <p className="text-sm text-red-600 mt-1">{errors.overtimeFrequency.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 mt-6 border-t">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Назад
              </Button>
            )}

            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Откажи
              </Button>
            )}

            <div className="flex-1" />

            {currentStep < totalSteps && (
              <Button type="button" onClick={handleNext}>
                Даље
              </Button>
            )}

            {currentStep === totalSteps && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Чување...' : 'Сачувај'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
