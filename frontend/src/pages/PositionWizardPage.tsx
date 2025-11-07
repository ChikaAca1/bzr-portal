import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PositionBasicInfoForm } from '../components/positions/PositionBasicInfoForm';
import { PositionWorkersForm } from '../components/positions/PositionWorkersForm';
import { RiskAssessmentWizard } from '../components/risk-assessment/RiskAssessmentWizard';

/**
 * PositionWizardPage Component (T113)
 *
 * Multi-step wizard for creating new workplace positions with risk assessments.
 * Guides users through position setup, worker assignment, and risk evaluation.
 *
 * Features:
 * - 3-step wizard: Basic Info → Workers → Risk Assessment
 * - Progress indicator
 * - Form validation at each step
 * - Save draft functionality
 * - Serbian Cyrillic UI
 *
 * Steps:
 * 1. Basic Info: Position name, description, workplace type
 * 2. Workers: Assign workers to position (name, JMBG, gender, DOB)
 * 3. Risk Assessment: Identify hazards and assess risks
 *
 * Usage:
 *   Route: /dashboard/positions/new
 *   Requires authentication + company membership
 *
 * Requirements: FR-014 (Position wizard), FR-019 (Risk assessment)
 */

type WizardStep = 'basic-info' | 'workers' | 'risk-assessment';

interface PositionDraft {
  positionName?: string;
  positionDescription?: string;
  workplaceType?: string;
  workers?: Array<{
    fullName: string;
    jmbg: string;
    gender: 'M' | 'F';
    dateOfBirth: string;
  }>;
  risks?: Array<{
    hazardCode: string;
    hazardName: string;
    initialE: number;
    initialP: number;
    initialF: number;
    correctiveMeasures: string;
    residualE: number;
    residualP: number;
    residualF: number;
  }>;
}

const STEPS: Array<{
  id: WizardStep;
  title: string;
  description: string;
}> = [
  {
    id: 'basic-info',
    title: 'Основни подаци',
    description: 'Унесите назив и опис радног места',
  },
  {
    id: 'workers',
    title: 'Радници',
    description: 'Додајте раднике на ово радно место',
  },
  {
    id: 'risk-assessment',
    title: 'Процена ризика',
    description: 'Идентификујте опасности и процените ризике',
  },
];

export function PositionWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic-info');
  const [positionDraft, setPositionDraft] = useState<PositionDraft>({});

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    } else {
      navigate('/dashboard/positions');
    }
  };

  const handleBasicInfoComplete = (data: {
    positionName: string;
    positionDescription: string;
    workplaceType: string;
  }) => {
    setPositionDraft((prev) => ({
      ...prev,
      ...data,
    }));
    handleNext();
  };

  const handleWorkersComplete = (data: {
    workers: Array<{
      fullName: string;
      jmbg: string;
      gender: 'M' | 'F';
      dateOfBirth: string;
    }>;
  }) => {
    setPositionDraft((prev) => ({
      ...prev,
      ...data,
    }));
    handleNext();
  };

  const handleRiskAssessmentComplete = (data: {
    risks: Array<{
      hazardCode: string;
      hazardName: string;
      initialE: number;
      initialP: number;
      initialF: number;
      correctiveMeasures: string;
      residualE: number;
      residualP: number;
      residualF: number;
    }>;
  }) => {
    setPositionDraft((prev) => ({
      ...prev,
      ...data,
    }));

    // Complete wizard - save position with risks
    console.log('Position Draft:', { ...positionDraft, ...data });

    // TODO: Call tRPC mutation to save position
    // navigate('/dashboard/positions');
  };

  const handleSaveDraft = () => {
    // TODO: Save draft to localStorage or backend
    console.log('Saving draft:', positionDraft);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ново радно место</h1>
            <p className="text-muted-foreground mt-1">
              Креирајте радно место и процените ризике у 3 корака
            </p>
          </div>

          <Button variant="outline" onClick={handleSaveDraft}>
            Сачувај драфт
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Корак {currentStepIndex + 1} од {STEPS.length}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                          ? 'bg-primary/10 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : ''}`}>
                      {step.title}
                    </p>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <Separator
                    className={`flex-1 ${isCompleted ? 'bg-primary' : ''}`}
                    orientation="horizontal"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{STEPS[currentStepIndex].title}</CardTitle>
                <CardDescription>{STEPS[currentStepIndex].description}</CardDescription>
              </div>

              <Badge variant="outline">
                {currentStepIndex + 1}/{STEPS.length}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {/* Step 1: Basic Info */}
            {currentStep === 'basic-info' && (
              <PositionBasicInfoForm
                initialData={positionDraft}
                onComplete={handleBasicInfoComplete}
                onCancel={() => navigate('/dashboard/positions')}
              />
            )}

            {/* Step 2: Workers */}
            {currentStep === 'workers' && (
              <PositionWorkersForm
                initialData={positionDraft}
                onComplete={handleWorkersComplete}
                onBack={handleBack}
              />
            )}

            {/* Step 3: Risk Assessment */}
            {currentStep === 'risk-assessment' && (
              <RiskAssessmentWizard
                positionId={null} // New position, no ID yet
                initialRisks={positionDraft.risks || []}
                onComplete={handleRiskAssessmentComplete}
                onBack={handleBack}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation Hint */}
        <div className="text-center text-sm text-muted-foreground">
          💡 Можете сачувати драфт и наставити касније
        </div>
      </div>
    </DashboardLayout>
  );
}
