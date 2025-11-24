import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * PositionBasicInfoForm Component
 *
 * Form for basic workplace position information - Step 1 of Position Wizard
 */

interface PositionBasicInfoFormProps {
  initialData?: {
    positionName?: string;
    positionDescription?: string;
    workplaceType?: string;
  };
  onComplete: (data: {
    positionName: string;
    positionDescription: string;
    workplaceType: string;
  }) => void;
  onCancel?: () => void;
}

export function PositionBasicInfoForm({ initialData, onComplete, onCancel }: PositionBasicInfoFormProps) {
  const [formData, setFormData] = useState({
    positionName: initialData?.positionName || '',
    positionDescription: initialData?.positionDescription || '',
    workplaceType: initialData?.workplaceType || '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.positionName.trim()) {
      setError('Назив радног места је обавезан');
      return;
    }

    if (formData.positionName.trim().length < 2) {
      setError('Назив радног места мора имати најмање 2 карактера');
      return;
    }

    // Call onComplete with validated data
    onComplete({
      positionName: formData.positionName.trim(),
      positionDescription: formData.positionDescription.trim(),
      workplaceType: formData.workplaceType.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="position-name">Назив радног места *</Label>
            <Input
              id="position-name"
              placeholder="нпр. Директор"
              value={formData.positionName}
              onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="position-desc">Опис послова</Label>
            <Textarea
              id="position-desc"
              placeholder="Детаљан опис радних задатака..."
              value={formData.positionDescription}
              onChange={(e) => setFormData({ ...formData, positionDescription: e.target.value })}
              rows={8}
            />
          </div>

          <div>
            <Label htmlFor="workplace-type">Тип радног места</Label>
            <Input
              id="workplace-type"
              placeholder="нпр. Канцеларијски, Теренски, Производни..."
              value={formData.workplaceType}
              onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Откажи
            </Button>
          )}
          <div className="flex-1" />
          <Button type="submit">
            Даље
          </Button>
        </div>
      </div>
    </form>
  );
}
