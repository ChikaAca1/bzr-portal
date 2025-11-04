import { useState, useEffect } from 'react';
import { calculateRiskIndex, getRiskLevel } from '../../hooks/useRisks';
import { RiskLevelBadge } from '../ui/RiskLevelBadge';

/**
 * ResidualRiskInputs Component (T100)
 *
 * Input fields for residual risk assessment (E × P × F = R).
 * Validates that R < Ri (residual risk must be lower than initial risk).
 * Displays warning if R > 70 (high risk).
 *
 * Usage:
 *   <ResidualRiskInputs
 *     initialRiskIndex={120}
 *     e={residualE}
 *     p={residualP}
 *     f={residualF}
 *     onChange={({ e, p, f, r }) => ...}
 *   />
 */

interface ResidualRiskInputsProps {
  initialRiskIndex: number; // Ri value from initial assessment
  e?: number;
  p?: number;
  f?: number;
  onChange: (values: { e: number; p: number; f: number; r: number; valid: boolean }) => void;
  disabled?: boolean;
  errors?: {
    e?: string;
    p?: string;
    f?: string;
  };
  className?: string;
}

export function ResidualRiskInputs({
  initialRiskIndex,
  e = 1,
  p = 1,
  f = 1,
  onChange,
  disabled = false,
  errors = {},
  className = '',
}: ResidualRiskInputsProps) {
  const [exposure, setExposure] = useState(e);
  const [probability, setProbability] = useState(p);
  const [frequency, setFrequency] = useState(f);
  const [residualRisk, setResidualRisk] = useState(calculateRiskIndex(e, p, f));

  // Recalculate residual risk when any value changes
  useEffect(() => {
    const r = calculateRiskIndex(exposure, probability, frequency);
    setResidualRisk(r);

    const isValid = r < initialRiskIndex;
    onChange({ e: exposure, p: probability, f: frequency, r, valid: isValid });
  }, [exposure, probability, frequency, initialRiskIndex]);

  const riskLevel = getRiskLevel(residualRisk);
  const isReduced = residualRisk < initialRiskIndex;
  const isHighRisk = residualRisk > 70;

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">
        Преостали ризик након корективних мера (R = E × P × F)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* E - Exposure (Consequences) */}
        <div>
          <label htmlFor="residual-e" className="block text-sm font-medium mb-2">
            E - Последице (1-6) *
          </label>
          <input
            id="residual-e"
            type="number"
            min={1}
            max={6}
            value={exposure}
            onChange={(e) => setExposure(Number(e.target.value))}
            disabled={disabled}
            className={`
              w-full border rounded-md px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.e ? 'border-destructive' : 'border-input'}
            `}
          />
          {errors.e && <p className="text-xs text-destructive mt-1">{errors.e}</p>}
        </div>

        {/* P - Probability */}
        <div>
          <label htmlFor="residual-p" className="block text-sm font-medium mb-2">
            P - Вероватноћа (1-6) *
          </label>
          <input
            id="residual-p"
            type="number"
            min={1}
            max={6}
            value={probability}
            onChange={(e) => setProbability(Number(e.target.value))}
            disabled={disabled}
            className={`
              w-full border rounded-md px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.p ? 'border-destructive' : 'border-input'}
            `}
          />
          {errors.p && <p className="text-xs text-destructive mt-1">{errors.p}</p>}
        </div>

        {/* F - Frequency */}
        <div>
          <label htmlFor="residual-f" className="block text-sm font-medium mb-2">
            F - Учесталост (1-6) *
          </label>
          <input
            id="residual-f"
            type="number"
            min={1}
            max={6}
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            disabled={disabled}
            className={`
              w-full border rounded-md px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.f ? 'border-destructive' : 'border-input'}
            `}
          />
          {errors.f && <p className="text-xs text-destructive mt-1">{errors.f}</p>}
        </div>
      </div>

      {/* Residual Risk Calculation Result */}
      <div className={`border rounded-lg p-4 ${isReduced ? 'bg-green-50 border-green-200' : 'bg-destructive/10 border-destructive/20'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Индекс преосталог ризика (R)
            </p>
            <p className="text-3xl font-bold">
              {exposure} × {probability} × {frequency} = {residualRisk}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Почетни ризик (Ri) = {initialRiskIndex}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground mb-2">Ниво ризика</p>
            <RiskLevelBadge level={riskLevel} value={residualRisk} />
          </div>
        </div>

        {/* Validation Messages */}
        <div className="mt-3 space-y-2">
          {!isReduced && (
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">
                ❌ Грешка: Преостали ризик (R={residualRisk}) мора бити мањи од почетног ризика (Ri={initialRiskIndex})
              </p>
              <p className="text-xs text-destructive mt-1">
                Корективне мере нису довољно ефикасне. Размислите о додатним мерама за смањење ризика.
              </p>
            </div>
          )}

          {isReduced && isHighRisk && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Упозорење: Преостали ризик (R={residualRisk}) је још увек висок (R &gt; 70)
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Препоручује се имплементација додатних мера за даље смањење ризика.
              </p>
            </div>
          )}

          {isReduced && !isHighRisk && (
            <div className="p-2 bg-green-100 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">
                ✓ Ризик успешно смањен са {initialRiskIndex} на {residualRisk} (смањење: {((1 - residualRisk / initialRiskIndex) * 100).toFixed(1)}%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
