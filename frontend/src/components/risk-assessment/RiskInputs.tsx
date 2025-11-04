import { useState, useEffect } from 'react';
import { calculateRiskIndex, getRiskLevel } from '../../hooks/useRisks';
import { RiskLevelBadge } from '../ui/RiskLevelBadge';

/**
 * RiskInputs Component (T098)
 *
 * Input fields for initial risk assessment (E × P × F = Ri).
 * Displays real-time risk index calculation and color-coded badge.
 *
 * E = Exposure (Posledice / Consequences)
 * P = Probability (Verovatnoća / Probability)
 * F = Frequency (Učestalost / Frequency)
 * Ri = Risk Index (Initial)
 *
 * Usage:
 *   <RiskInputs
 *     e={exposure}
 *     p={probability}
 *     f={frequency}
 *     onChange={({ e, p, f, ri }) => ...}
 *   />
 */

interface RiskInputsProps {
  e?: number;
  p?: number;
  f?: number;
  onChange: (values: { e: number; p: number; f: number; ri: number }) => void;
  disabled?: boolean;
  errors?: {
    e?: string;
    p?: string;
    f?: string;
  };
  className?: string;
}

export function RiskInputs({
  e = 1,
  p = 1,
  f = 1,
  onChange,
  disabled = false,
  errors = {},
  className = '',
}: RiskInputsProps) {
  const [exposure, setExposure] = useState(e);
  const [probability, setProbability] = useState(p);
  const [frequency, setFrequency] = useState(f);
  const [riskIndex, setRiskIndex] = useState(calculateRiskIndex(e, p, f));

  // Recalculate risk index when any value changes
  useEffect(() => {
    const ri = calculateRiskIndex(exposure, probability, frequency);
    setRiskIndex(ri);
    onChange({ e: exposure, p: probability, f: frequency, ri });
  }, [exposure, probability, frequency]);

  const riskLevel = getRiskLevel(riskIndex);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">Почетна процена ризика (Ri = E × P × F)</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* E - Exposure (Consequences) */}
        <div>
          <label htmlFor="risk-e" className="block text-sm font-medium mb-2">
            E - Последице (1-6) *
          </label>
          <input
            id="risk-e"
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
          <p className="text-xs text-muted-foreground mt-1">
            1 = Минималне, 6 = Катастрофалне
          </p>
        </div>

        {/* P - Probability */}
        <div>
          <label htmlFor="risk-p" className="block text-sm font-medium mb-2">
            P - Вероватноћа (1-6) *
          </label>
          <input
            id="risk-p"
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
          <p className="text-xs text-muted-foreground mt-1">
            1 = Готово немогуће, 6 = Извесно
          </p>
        </div>

        {/* F - Frequency */}
        <div>
          <label htmlFor="risk-f" className="block text-sm font-medium mb-2">
            F - Учесталост (1-6) *
          </label>
          <input
            id="risk-f"
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
          <p className="text-xs text-muted-foreground mt-1">
            1 = Годишње, 6 = Стално
          </p>
        </div>
      </div>

      {/* Risk Index Calculation Result */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Индекс почетног ризика (Ri)
            </p>
            <p className="text-3xl font-bold">
              {exposure} × {probability} × {frequency} = {riskIndex}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground mb-2">Ниво ризика</p>
            <RiskLevelBadge level={riskLevel} value={riskIndex} />
          </div>
        </div>

        {riskIndex > 70 && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Висок ризик (Ri &gt; 70) - Хитне корективне мере потребне!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
