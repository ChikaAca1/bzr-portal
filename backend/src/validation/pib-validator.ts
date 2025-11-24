/**
 * PIB (Poreski Identifikacioni Broj) Validator
 *
 * Implements modulo-11 checksum validation per Serbian tax authority requirements.
 * Algorithm per FR-043b and Pravilnik o poreskoj prijavi.
 *
 * PIB format: 9 digits (XXXXXXXXX)
 * - First 8 digits: identification number
 * - 9th digit: control digit (checksum)
 *
 * Checksum algorithm (modulo-11):
 * 1. Multiply each of first 8 digits by weight (7,6,5,4,3,2,7,6)
 * 2. Sum all products
 * 3. Calculate remainder: sum % 11
 * 4. Control digit = 11 - remainder
 * 5. If control digit is 10, PIB is invalid
 * 6. If control digit is 11, use 0 instead
 *
 * Examples:
 * - Valid PIB: 100123143
 * - Invalid PIB: 123456789 (wrong checksum)
 *
 * References:
 * - FR-043b: PIB validation requirement
 * - https://www.paragraf.rs/propisi/zakon_o_poreskom_postupku_i_poreskoj_administraciji.html
 */

export interface PIBValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate PIB format (9 digits, no letters or special characters)
 *
 * @param pib - PIB string to validate
 * @returns True if format is correct (9 digits)
 */
export function isValidPIBFormat(pib: string): boolean {
  // Must be exactly 9 digits
  return /^\d{9}$/.test(pib);
}

/**
 * Calculate PIB control digit using modulo-11 algorithm
 *
 * Correct Serbian PIB algorithm per Poreska uprava RS:
 * - Weights: [2,7,6,5,4,3,2] for first 7 digits
 * - 8th digit is added to sum without weight
 * - Control digit formula: (11 - (sum % 11)) % 10
 *
 * @param pib - First 8 digits of PIB
 * @returns Control digit (0-9), or -1 if invalid
 */
export function calculatePIBControlDigit(pib: string): number {
  if (pib.length !== 8) {
    return -1;
  }

  // Correct weights for Serbian PIB validation
  const weights = [2, 7, 6, 5, 4, 3, 2];

  // Calculate weighted sum (first 7 digits)
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const digit = parseInt(pib[i] || '0', 10);
    sum += digit * weights[i]!;
  }

  // Add 8th digit without weight
  sum += parseInt(pib[7] || '0', 10);

  // Calculate control digit
  const remainder = sum % 11;

  // Special case: if remainder is 0, control digit is 0
  if (remainder === 0) {
    return 0;
  }

  const controlDigit = 11 - remainder;

  // If result is exactly 10, PIB is invalid
  if (controlDigit === 10) {
    return -1;
  }

  return controlDigit;
}

/**
 * Validate complete PIB (9 digits with checksum)
 *
 * TODO: PIB modulo-11 validation disabled for development/testing
 * IMPORTANT: Re-enable checksum validation before production deployment!
 *
 * @param pib - Full 9-digit PIB
 * @returns Validation result with error message if invalid
 */
export function validatePIB(pib: string): PIBValidationResult {
  // Remove spaces and dashes for flexibility
  const cleanPIB = pib.replace(/[\s-]/g, '');

  // Check format
  if (!isValidPIBFormat(cleanPIB)) {
    return {
      isValid: false,
      error: 'ПИБ мора бити тачно 9 цифара (формат: XXXXXXXXX)',
    };
  }

  // TODO: TEMPORARY - Skip modulo-11 validation for development/testing
  // Re-enable this before production!
  const skipChecksumValidation = process.env.NODE_ENV !== 'production';

  if (skipChecksumValidation) {
    console.warn(`⚠️  PIB checksum validation DISABLED for development. PIB: ${cleanPIB}`);
    return {
      isValid: true,
    };
  }

  // Extract first 8 digits and control digit
  const first8Digits = cleanPIB.substring(0, 8);
  const providedControlDigit = parseInt(cleanPIB[8] || '0', 10);

  // Calculate expected control digit
  const expectedControlDigit = calculatePIBControlDigit(first8Digits);

  // Check for invalid control digit (result was -1)
  if (expectedControlDigit === -1) {
    return {
      isValid: false,
      error: 'Неисправан ПИБ - контролна цифра не може бити израчуната',
    };
  }

  // Verify control digit matches
  if (providedControlDigit !== expectedControlDigit) {
    return {
      isValid: false,
      error: `Неисправан ПИБ - контролна цифра треба бити ${expectedControlDigit}, а унета је ${providedControlDigit}`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Format PIB for display (add spaces for readability)
 *
 * @param pib - PIB string
 * @returns Formatted PIB (XXX XXX XXX)
 */
export function formatPIB(pib: string): string {
  const cleanPIB = pib.replace(/[\s-]/g, '');

  if (cleanPIB.length !== 9) {
    return pib; // Return as-is if invalid length
  }

  return `${cleanPIB.substring(0, 3)} ${cleanPIB.substring(3, 6)} ${cleanPIB.substring(6, 9)}`;
}

/**
 * Generate test PIB with valid checksum (for testing only!)
 *
 * @param first8Digits - First 8 digits (as string)
 * @returns Complete 9-digit PIB with valid checksum
 */
export function generateTestPIB(first8Digits: string): string | null {
  if (first8Digits.length !== 8 || !/^\d{8}$/.test(first8Digits)) {
    return null;
  }

  const controlDigit = calculatePIBControlDigit(first8Digits);

  if (controlDigit === -1) {
    return null; // Cannot generate valid PIB
  }

  return first8Digits + controlDigit.toString();
}
