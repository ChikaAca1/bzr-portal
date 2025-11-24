import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Info } from 'lucide-react';

/**
 * RiskAssessmentWizard Component (Placeholder)
 *
 * Multi-step wizard for assessing risks for a workplace position.
 * TODO: Implement full wizard flow with hazard selection and E×P×F input
 */

interface RiskAssessmentWizardProps {
  positionId?: string;
  onComplete?: () => void;
}

export function RiskAssessmentWizard({ positionId, onComplete }: RiskAssessmentWizardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Процена ризика</CardTitle>
        <CardDescription>
          Идентификујте опасности и проценит е ризик за ово радно место
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Wizard за процену ризика је у развоју. Користите тренутне компоненте за унос ризика.
          </AlertDescription>
        </Alert>

        {positionId && (
          <p className="mt-4 text-sm text-muted-foreground">
            Радно место ID: {positionId}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
