import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

/**
 * PositionWorkersForm Component - Step 2 of Position Wizard
 *
 * Form for adding individual workers with their details
 */

interface Worker {
  fullName: string;
  jmbg: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  education: string;
  coefficient: string;
  yearsOfExperience: string;
}

interface PositionWorkersFormProps {
  initialData?: {
    workers?: Worker[];
  };
  onComplete: (data: { workers: Worker[] }) => void;
  onBack: () => void;
}

export function PositionWorkersForm({ initialData, onComplete, onBack }: PositionWorkersFormProps) {
  const [workers, setWorkers] = useState<Worker[]>(
    initialData?.workers || []
  );
  const [error, setError] = useState('');

  // Add new empty worker
  const handleAddWorker = () => {
    setWorkers([
      ...workers,
      {
        fullName: '',
        jmbg: '',
        gender: 'M',
        dateOfBirth: '',
        education: '',
        coefficient: '',
        yearsOfExperience: '',
      },
    ]);
  };

  // Remove worker at index
  const handleRemoveWorker = (index: number) => {
    setWorkers(workers.filter((_, i) => i !== index));
  };

  // Update worker field
  const handleWorkerChange = (index: number, field: keyof Worker, value: string) => {
    const updated = [...workers];
    updated[index] = { ...updated[index], [field]: value };
    setWorkers(updated);
  };

  // Validate and submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (workers.length === 0) {
      setError('Додајте најмање једног радника');
      return;
    }

    // Validate each worker
    for (let i = 0; i < workers.length; i++) {
      const worker = workers[i];

      if (!worker.fullName.trim()) {
        setError(`Радник ${i + 1}: Име и презиме је обавезно`);
        return;
      }

      if (worker.jmbg && worker.jmbg.length !== 13) {
        setError(`Радник ${i + 1}: ЈМБГ мора имати тачно 13 цифара`);
        return;
      }
    }

    // Call onComplete with validated data
    onComplete({ workers });
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

        {/* Workers List */}
        <div className="space-y-4">
          {workers.map((worker, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Радник {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWorker(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor={`worker-${index}-name`}>Име и презиме *</Label>
                    <Input
                      id={`worker-${index}-name`}
                      placeholder="нпр. Петар Петровић"
                      value={worker.fullName}
                      onChange={(e) => handleWorkerChange(index, 'fullName', e.target.value)}
                    />
                  </div>

                  {/* JMBG */}
                  <div>
                    <Label htmlFor={`worker-${index}-jmbg`}>ЈМБГ</Label>
                    <Input
                      id={`worker-${index}-jmbg`}
                      placeholder="13 цифара"
                      maxLength={13}
                      value={worker.jmbg}
                      onChange={(e) =>
                        handleWorkerChange(index, 'jmbg', e.target.value.replace(/\D/g, ''))
                      }
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <Label htmlFor={`worker-${index}-gender`}>Пол</Label>
                    <select
                      id={`worker-${index}-gender`}
                      value={worker.gender}
                      onChange={(e) =>
                        handleWorkerChange(index, 'gender', e.target.value as 'M' | 'F')
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="M">Мушки</option>
                      <option value="F">Женски</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <Label htmlFor={`worker-${index}-dob`}>Датум рођења</Label>
                    <Input
                      id={`worker-${index}-dob`}
                      type="date"
                      value={worker.dateOfBirth}
                      onChange={(e) => handleWorkerChange(index, 'dateOfBirth', e.target.value)}
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <Label htmlFor={`worker-${index}-education`}>Стручна спрема</Label>
                    <Input
                      id={`worker-${index}-education`}
                      placeholder="нпр. III, IV, VII/1"
                      value={worker.education}
                      onChange={(e) => handleWorkerChange(index, 'education', e.target.value)}
                    />
                  </div>

                  {/* Coefficient */}
                  <div>
                    <Label htmlFor={`worker-${index}-coefficient`}>Коефицијент</Label>
                    <Input
                      id={`worker-${index}-coefficient`}
                      placeholder="нпр. 1.5"
                      value={worker.coefficient}
                      onChange={(e) => handleWorkerChange(index, 'coefficient', e.target.value)}
                    />
                  </div>

                  {/* Years of Experience */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`worker-${index}-experience`}>Радно искуство (године)</Label>
                    <Input
                      id={`worker-${index}-experience`}
                      placeholder="нпр. 5"
                      value={worker.yearsOfExperience}
                      onChange={(e) =>
                        handleWorkerChange(index, 'yearsOfExperience', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Worker Button */}
        <Button type="button" variant="outline" onClick={handleAddWorker} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Додај радника
        </Button>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Назад
          </Button>
          <div className="flex-1" />
          <Button type="submit">Даље</Button>
        </div>
      </div>
    </form>
  );
}
