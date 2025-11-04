import { Textarea } from '../ui/textarea';

/**
 * CorrectiveMeasures Component (T099)
 *
 * Textarea for entering corrective measures to reduce risk.
 * Enforces minimum 20 characters per FR-044c requirement.
 *
 * Usage:
 *   <CorrectiveMeasures
 *     value={measures}
 *     onChange={setMeasures}
 *   />
 */

interface CorrectiveMeasuresProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function CorrectiveMeasures({
  value = '',
  onChange,
  disabled = false,
  error,
  className = '',
}: CorrectiveMeasuresProps) {
  const MIN_LENGTH = 20;
  const charCount = value.length;
  const isValid = charCount >= MIN_LENGTH;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor="corrective-measures" className="block text-sm font-medium">
        Корективне мере за смањење ризика *
      </label>

      <Textarea
        id="corrective-measures"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Опишите мере које ће се предузети за смањење ризика (нпр. обука запослених, набавка заштитне опреме, измена процеса рада)..."
        rows={4}
        className={error ? 'border-destructive' : ''}
      />

      <div className="flex items-center justify-between text-xs">
        <div>
          {error && <span className="text-destructive">{error}</span>}
          {!error && !isValid && (
            <span className="text-muted-foreground">
              Минимум {MIN_LENGTH} карактера обавезно
            </span>
          )}
          {!error && isValid && (
            <span className="text-green-600">✓ Валидно</span>
          )}
        </div>

        <span
          className={`
            ${charCount < MIN_LENGTH ? 'text-destructive' : 'text-muted-foreground'}
          `}
        >
          {charCount} / {MIN_LENGTH}+
        </span>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Примери корективних мера:</p>
        <ul className="list-disc list-inside pl-2 space-y-0.5">
          <li>Обука запослених за безбедан рад са опремом</li>
          <li>Набавка и обавезна употреба личне заштитне опреме (ЛЗО)</li>
          <li>Редовно одржавање и сервисирање машина</li>
          <li>Побољшање вентилације радног простора</li>
          <li>Ограничење времена изложености опасности</li>
          <li>Технички контроле и безбедносни системи</li>
        </ul>
      </div>
    </div>
  );
}
