/**
 * Risk Calculation Service (T050)
 *
 * Pure business logic functions for E×P×F risk calculation.
 * Implements Serbian BZR standard per FR-004, FR-005, FR-006, FR-007.
 *
 * This service provides standalone calculation functions that can be used
 * independently of database operations (useful for frontend previews).
 */

import {
  calculateRisk,
  getRiskLevel as getLevel,
  validateEPFParameters,
  validateRiskReduction as validateReduction,
  type RiskLevel,
  type RiskValidationError,
} from '../lib/utils/risk-calculator';

// =============================================================================
// Types
// =============================================================================

export interface RiskCalculation {
  e: number; // Consequences (Extent) 1-6
  p: number; // Probability 1-6
  f: number; // Frequency 1-6
}

export interface RiskAssessmentInput {
  ei: number; // Initial consequences
  pi: number; // Initial probability
  fi: number; // Initial frequency
  e: number; // Residual consequences
  p: number; // Residual probability
  f: number; // Residual frequency
}

export interface RiskAssessmentResult {
  ri: number; // Initial risk (Ei × Pi × Fi)
  r: number; // Residual risk (E × P × F)
  isHighRisk: boolean; // R > 70 OR Ri > 70
  riskLevel: 'low' | 'medium' | 'high'; // Risk categorization
  isValid: boolean; // R < Ri validation
  errors: string[];
}

// =============================================================================
// Core Calculation Functions
// =============================================================================

/**
 * Calculate initial risk (Ri = Ei × Pi × Fi)
 *
 * @param ei - Initial consequences (1-6)
 * @param pi - Initial probability (1-6)
 * @param fi - Initial frequency (1-6)
 * @returns Initial risk value
 *
 * @example
 * calculateRi(2, 5, 6) // → 60 (office screen work)
 * calculateRi(6, 5, 5) // → 150 (unguarded machinery)
 */
export function calculateRi(ei: number, pi: number, fi: number): number {
  return calculateRisk(ei, pi, fi);
}

/**
 * Calculate residual risk (R = E × P × F)
 *
 * @param e - Residual consequences (1-6) after corrective measures
 * @param p - Residual probability (1-6) after corrective measures
 * @param f - Residual frequency (1-6)
 * @returns Residual risk value
 *
 * @example
 * calculateR(1, 3, 5) // → 15 (screen work with ergonomic measures)
 * calculateR(3, 2, 4) // → 24 (work at heights with guard rails)
 */
export function calculateR(e: number, p: number, f: number): number {
  return calculateRisk(e, p, f);
}

/**
 * Validate risk reduction (R < Ri enforcement)
 *
 * Per FR-006: Residual risk MUST be lower than initial risk.
 *
 * @param ri - Initial risk
 * @param r - Residual risk
 * @returns true if R < Ri, false otherwise
 *
 * @example
 * validateRiskReduction(48, 18) // → true (valid reduction)
 * validateRiskReduction(48, 48) // → false (no reduction)
 * validateRiskReduction(48, 72) // → false (risk increased!)
 */
export function validateRiskReduction(ri: number, r: number): boolean {
  return r < ri;
}

/**
 * Flag high risk (R > 70 OR Ri > 70)
 *
 * Per FR-007: High risk requires immediate action, annual medical exams,
 * specialized training, and enhanced supervision.
 *
 * @param ri - Initial risk
 * @param r - Residual risk
 * @returns true if R > 70 OR Ri > 70
 *
 * @example
 * flagHighRisk(150, 30) // → true (initial risk was high)
 * flagHighRisk(60, 72) // → true (residual risk is high)
 * flagHighRisk(48, 18) // → false (both below 70)
 */
export function flagHighRisk(ri: number, r: number): boolean {
  return ri > 70 || r > 70;
}

/**
 * Get risk level categorization
 *
 * Risk levels per Serbian BZR standard:
 * - Low: R < 24
 * - Medium: 24 <= R <= 70
 * - High: R > 70
 *
 * @param r - Risk value
 * @returns Risk level: 'low', 'medium', or 'high'
 *
 * @example
 * getRiskLevel(18) // → 'low'
 * getRiskLevel(48) // → 'medium'
 * getRiskLevel(150) // → 'high'
 */
export function getRiskLevel(r: number): 'low' | 'medium' | 'high' {
  if (r > 70) return 'high';
  if (r >= 24) return 'medium';
  return 'low';
}

/**
 * Validate risk parameters (E, P, F must be 1-6)
 *
 * @param e - Consequences (1-6)
 * @param p - Probability (1-6)
 * @param f - Frequency (1-6)
 * @returns Array of Serbian error messages (empty if valid)
 *
 * @example
 * validateRiskParameters(0, 3, 4) // → ['E (Последице) мора бити између 1 и 6']
 * validateRiskParameters(3, 7, 4) // → ['P (Вероватноћа) мора бити између 1 и 6']
 * validateRiskParameters(3, 3, 4) // → [] (valid)
 */
export function validateRiskParameters(e: number, p: number, f: number): string[] {
  const errors: string[] = [];

  if (e < 1 || e > 6) {
    errors.push('E (Последице) мора бити између 1 и 6');
  }
  if (p < 1 || p > 6) {
    errors.push('P (Вероватноћа) мора бити између 1 и 6');
  }
  if (f < 1 || f > 6) {
    errors.push('F (Учесталост) мора бити између 1 и 6');
  }

  return errors;
}

// =============================================================================
// Full Risk Assessment Function
// =============================================================================

/**
 * Perform complete risk assessment with validation
 *
 * This function:
 * 1. Validates all E/P/F parameters (1-6 range)
 * 2. Calculates Ri and R
 * 3. Validates risk reduction (R < Ri)
 * 4. Determines high risk flag (R > 70 OR Ri > 70)
 * 5. Categorizes risk level
 *
 * @param input - Risk assessment input with initial and residual parameters
 * @returns Complete assessment result with validation errors
 *
 * @example
 * const result = assessRisk({
 *   ei: 2, pi: 5, fi: 6, // Screen work: minor consequences, very likely, continuous
 *   e: 1, p: 3, f: 5,    // After ergonomic setup: minimal consequences, reduced probability
 * });
 * // → { ri: 60, r: 15, isHighRisk: false, riskLevel: 'low', isValid: true, errors: [] }
 */
export function assessRisk(input: RiskAssessmentInput): RiskAssessmentResult {
  const errors: string[] = [];

  // Validate initial risk parameters
  errors.push(...validateRiskParameters(input.ei, input.pi, input.fi));

  // Validate residual risk parameters
  errors.push(...validateRiskParameters(input.e, input.p, input.f));

  // Calculate risks
  const ri = calculateRi(input.ei, input.pi, input.fi);
  const r = calculateR(input.e, input.p, input.f);

  // Validate risk reduction
  const isReductionValid = validateRiskReduction(ri, r);
  if (!isReductionValid) {
    errors.push('Резидуални ризик (R) мора бити мањи од почетног ризика (Ri)');
  }

  return {
    ri,
    r,
    isHighRisk: flagHighRisk(ri, r),
    riskLevel: getRiskLevel(r),
    isValid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// Export all functions
// =============================================================================

export const RiskCalculationService = {
  calculateRi,
  calculateR,
  validateRiskReduction,
  flagHighRisk,
  getRiskLevel,
  validateRiskParameters,
  assessRisk,
};
