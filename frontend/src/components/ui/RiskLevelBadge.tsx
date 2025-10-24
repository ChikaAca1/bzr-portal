/**
 * RiskLevelBadge Component (T067)
 *
 * Displays risk level with color-coded badge.
 * Per Serbian BZR regulations FR-019:
 * - Green (≤36): Низак ризик (прихватљив)
 * - Yellow (37-70): Средњи ризик (потребно праћење)
 * - Red (>70): Висок ризик (неприхватљив)
 */

import { Badge } from './badge';

export interface RiskLevelBadgeProps {
  /**
   * Risk value (1-216, calculated from E×P×F)
   */
  riskValue: number;

  /**
   * Show numeric value alongside text
   */
  showValue?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Determine risk level based on value
 */
function getRiskLevel(riskValue: number): {
  level: 'low' | 'medium' | 'high';
  label: string;
  variant: 'success' | 'warning' | 'danger';
} {
  if (riskValue <= 36) {
    return {
      level: 'low',
      label: 'Низак ризик',
      variant: 'success',
    };
  } else if (riskValue <= 70) {
    return {
      level: 'medium',
      label: 'Средњи ризик',
      variant: 'warning',
    };
  } else {
    return {
      level: 'high',
      label: 'Висок ризик',
      variant: 'danger',
    };
  }
}

/**
 * RiskLevelBadge component
 */
export function RiskLevelBadge({
  riskValue,
  showValue = true,
  className,
}: RiskLevelBadgeProps) {
  const { label, variant } = getRiskLevel(riskValue);

  return (
    <Badge variant={variant} className={className}>
      {showValue ? `${label} (${riskValue})` : label}
    </Badge>
  );
}
