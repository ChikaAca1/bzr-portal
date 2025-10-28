/**
 * Risk Calculation Service Unit Tests (T049)
 *
 * Tests E×P×F risk calculation methodology per Serbian BZR standard:
 * - Ri (Initial Risk) = Ei × Pi × Fi
 * - R (Residual Risk) = E × P × F
 * - Validation: R < Ri (mandatory reduction)
 * - High Risk: R > 70 OR Ri > 70 (requires immediate action)
 *
 * References:
 * - spec.md FR-004: Initial risk calculation
 * - spec.md FR-005: Residual risk calculation
 * - spec.md FR-007: High risk flag
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRi,
  calculateR,
  validateRiskReduction,
  flagHighRisk,
  getRiskLevel,
  validateRiskParameters,
  assessRisk,
  type RiskAssessmentInput,
  type RiskAssessmentResult,
} from '../../../src/services/risk-calculation.service';

// =============================================================================
// Test Suite
// =============================================================================

describe('RiskService - E×P×F Calculation', () => {
  describe('calculateRi - Initial Risk Calculation', () => {
    it('should calculate Ri correctly for typical office work (low risk)', () => {
      // Screen work hazard: low consequences, medium probability, high frequency
      const ei = 2; // Minor discomfort
      const pi = 4; // Likely to occur
      const fi = 6; // Continuous exposure

      const ri = calculateRi(ei, pi, fi);

      expect(ri).toBe(48); // 2 × 4 × 6 = 48 (medium risk)
    });

    it('should calculate Ri correctly for high-risk work (construction)', () => {
      // Work at heights: high consequences, medium probability, occasional frequency
      const ei = 6; // Fatal consequences
      const pi = 3; // Possible
      const fi = 3; // Occasional

      const ri = calculateRi(ei, pi, fi);

      expect(ri).toBe(54); // 6 × 3 × 3 = 54 (medium risk)
    });

    it('should calculate Ri correctly for extreme risk scenario', () => {
      // Unguarded machinery: fatal consequences, high probability, frequent
      const ei = 6; // Fatal
      const pi = 5; // Very likely
      const fi = 5; // Frequent

      const ri = calculateRi(ei, pi, fi);

      expect(ri).toBe(150); // 6 × 5 × 5 = 150 (high risk > 70)
    });

    it('should calculate Ri correctly for minimal risk', () => {
      const ei = 1; // Negligible
      const pi = 1; // Rare
      const fi = 1; // Rare

      const ri = calculateRi(ei, pi, fi);

      expect(ri).toBe(1); // 1 × 1 × 1 = 1 (low risk)
    });

    it('should calculate Ri correctly for maximum values', () => {
      const ei = 6;
      const pi = 6;
      const fi = 6;

      const ri = calculateRi(ei, pi, fi);

      expect(ri).toBe(216); // 6 × 6 × 6 = 216 (extreme high risk)
    });
  });

  describe('calculateR - Residual Risk Calculation', () => {
    it('should calculate R correctly after implementing corrective measures', () => {
      // After installing guard rail for work at heights
      const e = 3; // Reduced consequences (injury instead of fatal)
      const p = 2; // Reduced probability (guard rail in place)
      const f = 3; // Same frequency

      const r = calculateR(e, p, f);

      expect(r).toBe(18); // 3 × 2 × 3 = 18 (low risk < 24)
    });

    it('should calculate R correctly for screen work with ergonomic measures', () => {
      // After ergonomic chair, proper lighting, breaks
      const e = 1; // Minimal consequences
      const p = 3; // Reduced probability
      const f = 5; // Still frequent exposure

      const r = calculateR(e, p, f);

      expect(r).toBe(15); // 1 × 3 × 5 = 15 (low risk)
    });
  });

  describe('validateRiskReduction - R < Ri Enforcement', () => {
    it('should pass validation when R < Ri', () => {
      const ri = 48; // Initial risk
      const r = 18; // Residual risk after measures

      const isValid = validateRiskReduction(ri, r);

      expect(isValid).toBe(true);
    });

    it('should fail validation when R >= Ri', () => {
      const ri = 48;
      const r = 48; // No improvement

      const isValid = validateRiskReduction(ri, r);

      expect(isValid).toBe(false);
    });

    it('should fail validation when R > Ri (risk increased)', () => {
      const ri = 48;
      const r = 72; // Risk increased (should never happen)

      const isValid = validateRiskReduction(ri, r);

      expect(isValid).toBe(false);
    });

    it('should pass validation with significant risk reduction', () => {
      const ri = 150; // High initial risk
      const r = 24; // Reduced to medium after extensive measures

      const isValid = validateRiskReduction(ri, r);

      expect(isValid).toBe(true);
    });
  });

  describe('flagHighRisk - R > 70 OR Ri > 70 Detection', () => {
    it('should flag high risk when Ri > 70', () => {
      const ri = 150;
      const r = 30; // Reduced below 70

      const isHigh = flagHighRisk(ri, r);

      expect(isHigh).toBe(true); // Initial risk was high
    });

    it('should flag high risk when R > 70', () => {
      const ri = 60;
      const r = 72; // Still high after measures

      const isHigh = flagHighRisk(ri, r);

      expect(isHigh).toBe(true);
    });

    it('should flag high risk when both Ri and R > 70', () => {
      const ri = 150;
      const r = 80;

      const isHigh = flagHighRisk(ri, r);

      expect(isHigh).toBe(true);
    });

    it('should not flag high risk when both Ri and R <= 70', () => {
      const ri = 48;
      const r = 18;

      const isHigh = flagHighRisk(ri, r);

      expect(isHigh).toBe(false);
    });

    it('should flag high risk at boundary (R = 71)', () => {
      const ri = 60;
      const r = 71;

      const isHigh = flagHighRisk(ri, r);

      expect(isHigh).toBe(true);
    });

    it('should not flag high risk at boundary (R = 70)', () => {
      const ri = 60;
      const r = 70;

      const isHigh = flagHighRisk(ri, r);

      expect(isHigh).toBe(false);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should reject E out of range (< 1)', () => {
      const result = assessRisk({
        ei: 0, // Invalid
        pi: 3,
        fi: 4,
        e: 2,
        p: 3,
        f: 4,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('E (Последице) мора бити између 1 и 6');
    });

    it('should reject E out of range (> 6)', () => {
      const result = assessRisk({
        ei: 7, // Invalid
        pi: 3,
        fi: 4,
        e: 2,
        p: 3,
        f: 4,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('E (Последице) мора бити између 1 и 6');
    });

    it('should reject P out of range', () => {
      const result = assessRisk({
        ei: 3,
        pi: 7, // Invalid
        fi: 4,
        e: 2,
        p: 3,
        f: 4,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('P (Вероватноћа) мора бити између 1 и 6');
    });

    it('should reject F out of range', () => {
      const result = assessRisk({
        ei: 3,
        pi: 3,
        fi: 0, // Invalid
        e: 2,
        p: 3,
        f: 4,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('F (Учесталост) мора бити између 1 и 6');
    });

    it('should reject multiple invalid parameters', () => {
      const result = assessRisk({
        ei: 0, // Invalid
        pi: 7, // Invalid
        fi: 4,
        e: 2,
        p: 3,
        f: 0, // Invalid
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });

    it('should reject when R >= Ri', () => {
      const result = assessRisk({
        ei: 3,
        pi: 4,
        fi: 4, // Ri = 48
        e: 4,
        p: 4,
        f: 3, // R = 48 (no reduction)
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Резидуални ризик (R) мора бити мањи од почетног ризика (Ri)');
    });
  });

  describe('getRiskLevel - Risk Categorization', () => {
    it('should categorize as low risk (R < 24)', () => {
      expect(getRiskLevel(1)).toBe('low');
      expect(getRiskLevel(12)).toBe('low');
      expect(getRiskLevel(23)).toBe('low');
    });

    it('should categorize as medium risk (24 <= R <= 70)', () => {
      expect(getRiskLevel(24)).toBe('medium');
      expect(getRiskLevel(48)).toBe('medium');
      expect(getRiskLevel(70)).toBe('medium');
    });

    it('should categorize as high risk (R > 70)', () => {
      expect(getRiskLevel(71)).toBe('high');
      expect(getRiskLevel(150)).toBe('high');
      expect(getRiskLevel(216)).toBe('high');
    });
  });

  describe('Integration Tests - Full Risk Assessment Flow', () => {
    it('should assess typical office work correctly', () => {
      // Accountant with screen work hazard
      const result = assessRisk({
        ei: 2, // Minor eye strain
        pi: 5, // Very likely
        fi: 6, // Continuous (8h/day)
        e: 1, // Minimal after ergonomic setup
        p: 3, // Reduced with breaks
        f: 5, // Still frequent
      });

      expect(result.ri).toBe(60); // 2 × 5 × 6
      expect(result.r).toBe(15); // 1 × 3 × 5
      expect(result.isHighRisk).toBe(false);
      expect(result.riskLevel).toBe('low');
      expect(result.isValid).toBe(true);
    });

    it('should assess construction work at heights correctly', () => {
      // Construction worker without guard rails
      const result = assessRisk({
        ei: 6, // Fatal fall
        pi: 5, // Very likely without protection
        fi: 4, // Frequent
        e: 3, // Injury with guard rails
        p: 2, // Unlikely with protection
        f: 4, // Same frequency
      });

      expect(result.ri).toBe(120); // 6 × 5 × 4
      expect(result.r).toBe(24); // 3 × 2 × 4
      expect(result.isHighRisk).toBe(true); // Ri > 70
      expect(result.riskLevel).toBe('medium');
      expect(result.isValid).toBe(true);
    });

    it('should detect invalid assessment (insufficient measures)', () => {
      // Inadequate corrective measures
      const result = assessRisk({
        ei: 5,
        pi: 4,
        fi: 3, // Ri = 60
        e: 5,
        p: 4,
        f: 3, // R = 60 (no reduction)
      });

      expect(result.ri).toBe(60);
      expect(result.r).toBe(60);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Резидуални ризик (R) мора бити мањи од почетног ризика (Ri)');
    });
  });
});
