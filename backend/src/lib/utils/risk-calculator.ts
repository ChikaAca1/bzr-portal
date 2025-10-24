/**
 * Risk Calculator Utility
 *
 * Implements E×P×F risk calculation methodology per Serbian BZR regulations.
 * Maps to FR-004, FR-005, FR-006, FR-007 requirements in spec.md.
 *
 * Risk Formula:
 * - R = E × P × F
 * - E (Consequences): 1-6 scale
 * - P (Probability): 1-6 scale
 * - F (Frequency): 1-6 scale
 *
 * Risk Levels:
 * - R ≤ 36: Низак ризик (Low Risk)
 * - 36 < R ≤ 70: Средњи ризик (Medium Risk)
 * - R > 70: Повећан ризик (High Risk) - требају хитне мере (immediate action required)
 */

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskCalculationResult {
  risk: number;
  level: RiskLevel;
  isHighRisk: boolean;
}

export interface RiskValidationError {
  field: string;
  message: string;
}

/**
 * Calculate risk value using E×P×F formula
 *
 * @param e - Consequences (1-6)
 * @param p - Probability (1-6)
 * @param f - Frequency (1-6)
 * @returns Calculated risk value
 */
export function calculateRisk(e: number, p: number, f: number): number {
  return e * p * f;
}

/**
 * Determine risk level based on calculated risk value
 *
 * @param risk - Calculated risk value (R or Ri)
 * @returns Risk level: 'low', 'medium', or 'high'
 */
export function getRiskLevel(risk: number): RiskLevel {
  if (risk <= 36) return 'low';
  if (risk <= 70) return 'medium';
  return 'high';
}

/**
 * Calculate risk with level classification
 *
 * @param e - Consequences (1-6)
 * @param p - Probability (1-6)
 * @param f - Frequency (1-6)
 * @returns Risk calculation result with level and high-risk flag
 */
export function calculateRiskWithLevel(
  e: number,
  p: number,
  f: number
): RiskCalculationResult {
  const risk = calculateRisk(e, p, f);
  const level = getRiskLevel(risk);
  const isHighRisk = risk > 70;

  return {
    risk,
    level,
    isHighRisk,
  };
}

/**
 * Validate E, P, F parameters
 *
 * All parameters must be integers between 1 and 6 (inclusive).
 *
 * @param e - Consequences
 * @param p - Probability
 * @param f - Frequency
 * @returns Array of validation errors (empty if valid)
 */
export function validateEPFParameters(
  e: number,
  p: number,
  f: number
): RiskValidationError[] {
  const errors: RiskValidationError[] = [];

  if (!Number.isInteger(e) || e < 1 || e > 6) {
    errors.push({
      field: 'e',
      message: 'E (последице) mora бити цео број од 1 до 6',
    });
  }

  if (!Number.isInteger(p) || p < 1 || p > 6) {
    errors.push({
      field: 'p',
      message: 'P (вероватноћа) мора бити цео број од 1 до 6',
    });
  }

  if (!Number.isInteger(f) || f < 1 || f > 6) {
    errors.push({
      field: 'f',
      message: 'F (фреквенција) мора бити цео број од 1 до 6',
    });
  }

  return errors;
}

/**
 * Validate risk reduction (FR-006)
 *
 * Residual risk (R) MUST be lower than initial risk (Ri).
 * Additionally, if initial risk > 70, residual risk SHOULD be ≤ 70.
 *
 * @param ri - Initial risk (pre-mitigation)
 * @param r - Residual risk (post-mitigation)
 * @returns Validation result with errors/warnings
 */
export function validateRiskReduction(
  ri: number,
  r: number
): {
  isValid: boolean;
  errors: RiskValidationError[];
  warnings: RiskValidationError[];
} {
  const errors: RiskValidationError[] = [];
  const warnings: RiskValidationError[] = [];

  // FR-006: R MUST be < Ri
  if (r >= ri) {
    errors.push({
      field: 'r',
      message: `Резидуални ризик (R=${r}) мора бити мањи од иницијалног ризика (Ri=${ri}). Корективне мере нису ефикасне.`,
    });
  }

  // FR-007: If Ri > 70, recommend R ≤ 70
  if (ri > 70 && r > 70) {
    warnings.push({
      field: 'r',
      message: `⚠️ УПОЗОРЕЊЕ: Иницијални ризик био је повећан (Ri=${ri} > 70). Препоручује се да резидуални ризик буде ≤ 70. Тренутно R=${r}.`,
    });
  }

  // Additional check: R > 70 requires immediate action
  if (r > 70) {
    warnings.push({
      field: 'r',
      message: `⚠️ ПОВЕЋАН РИЗИК: R=${r} > 70. Ово радно место захтева хитне додатне корективне мере пре доделе радника. Према Члану 9, Закона о БЗР, неопходне су појачан надзор, чешћи медицински прегледи (годишње) и специјализована обука.`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get Serbian label for risk level
 *
 * @param level - Risk level
 * @returns Serbian Cyrillic label
 */
export function getRiskLevelLabelSr(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: 'Низак ризик',
    medium: 'Средњи ризик',
    high: 'Повећан ризик',
  };
  return labels[level];
}

/**
 * Get risk level color for UI
 *
 * WCAG AA compliant colors per FR-054c
 *
 * @param level - Risk level
 * @returns Hex color code
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: '#107C10', // Green
    medium: '#CA5010', // Orange
    high: '#D13438', // Red
  };
  return colors[level];
}

/**
 * Get E (Consequences) interpretation
 *
 * Per E-001 requirement in spec.md
 *
 * @param e - Consequences value (1-6)
 * @returns Serbian description
 */
export function getEInterpretation(e: number): string {
  const interpretations: Record<number, string> = {
    1: 'Незнатне повреде (огреботине, површинске посекотине)',
    2: 'Мање повреде (дубље посекотине, модрице)',
    3: 'Озбиљне повреде (преломи, опекотине)',
    4: 'Веома тешке повреде (вишеструки преломи, губитак удова)',
    5: 'Повреде са трајним последицама (инвалидитет)',
    6: 'Смртни исход',
  };
  return interpretations[e] || 'Непозната вредност';
}

/**
 * Get P (Probability) interpretation
 *
 * Per P-001 requirement in spec.md
 *
 * @param p - Probability value (1-6)
 * @returns Serbian description with percentage
 */
export function getPInterpretation(p: number): string {
  const interpretations: Record<number, string> = {
    1: 'Практично немогуће (< 0.1%) - теоријски могуће али никада забележено',
    2: 'Веома мало вероватно (0.1-1%) - могуће само у изузетним околностима',
    3: 'Мало вероватно (1-10%) - могуће али ретко',
    4: 'Вероватно (10-50%) - десиће се повремено',
    5: 'Врло вероватно (50-90%) - десиће се често',
    6: 'Готово сигурно (> 90%) - десиће се осим ако се не предузму превентивне мере',
  };
  return interpretations[p] || 'Непозната вредност';
}

/**
 * Get F (Frequency) interpretation
 *
 * Per F-001 requirement in spec.md
 *
 * @param f - Frequency value (1-6)
 * @returns Serbian description with time period
 */
export function getFInterpretation(f: number): string {
  const interpretations: Record<number, string> = {
    1: 'Ретко (годишње или ређе) - годишњи прегледи, ретке операције',
    2: 'Повремено (месечно) - месечно одржавање',
    3: 'Недељно (1-4 пута недељно)',
    4: 'Дневно (неколико пута дневно)',
    5: 'Сатно (неколико пута на сат)',
    6: 'Стално (континуирано током смене) - рад на екрану, стајање',
  };
  return interpretations[f] || 'Непозната вредност';
}
