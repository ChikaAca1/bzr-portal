/**
 * Validation Utilities (T045)
 *
 * PIB, activity code, and JMBG validation for Serbian regulations.
 * Complements Zod schemas in shared/schemas/.
 */

// =============================================================================
// PIB Validation (Serbian Tax ID)
// =============================================================================

/**
 * Validate Serbian PIB (9-digit tax ID with iterative modulo checksum)
 *
 * Algorithm (per Serbian Tax Authority):
 * 1. Initialize sum = 10
 * 2. For each of first 8 digits:
 *    - sum = (sum + digit) mod 10
 *    - sum = (sum === 0 ? 10 : sum) * 2 mod 11
 * 3. Checksum = (11 - sum) mod 10
 * 4. Compare with 9th digit
 *
 * Source: https://mladsoft.com/2019/06/04/validacija-pib-mb-i-dr/
 *
 * @param pib - 9-digit PIB string
 * @returns boolean - true if valid
 *
 * Example valid PIBs: 100001011, 106006802, 100003574
 */
export function validatePIB(pib: string): boolean {
  // Check format: exactly 9 digits
  if (!/^\d{9}$/.test(pib)) {
    return false;
  }

  // Iterative checksum calculation
  let suma = 10;
  for (let i = 0; i < 8; i++) {
    suma = (suma + parseInt(pib.charAt(i), 10)) % 10;
    suma = (suma === 0 ? 10 : suma) * 2 % 11;
  }

  const expectedChecksum = (11 - suma) % 10;
  const actualChecksum = parseInt(pib.charAt(8), 10);

  return actualChecksum === expectedChecksum;
}

/**
 * Validate PIB and throw descriptive error
 */
export function validatePIBOrThrow(pib: string): void {
  if (!validatePIB(pib)) {
    throw new Error(`Неважећи ПИБ: ${pib}. ПИБ мора имати 9 цифара са валидном контролном сумом.`);
  }
}

// =============================================================================
// Activity Code Validation (Serbian Classification)
// =============================================================================

/**
 * Validate Serbian activity code (4-digit classification)
 *
 * Format: XXXX (4 digits)
 * Example: 4520 (Auto mechanic services)
 *
 * @param code - 4-digit activity code
 * @returns boolean - true if valid format
 */
export function validateActivityCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

/**
 * Validate activity code and throw error
 */
export function validateActivityCodeOrThrow(code: string): void {
  if (!validateActivityCode(code)) {
    throw new Error(`Неважећа шифра делатности: ${code}. Шифра мора имати тачно 4 цифре.`);
  }
}

// =============================================================================
// JMBG Validation (Serbian Personal ID)
// =============================================================================

/**
 * Validate Serbian JMBG (13-digit personal identification number)
 *
 * Format: DDMMYYYRRBBBC
 * - DD: day (01-31)
 * - MM: month (01-12)
 * - YYY: year (last 3 digits)
 * - RR: region code
 * - BBB: birth order number
 * - C: checksum digit
 *
 * Algorithm: Modulo 11 with cycling multipliers 2-7 (reverse order)
 * Source: https://mladsoft.com/2019/06/04/validacija-pib-mb-i-dr/
 *
 * @param jmbg - 13-digit JMBG string
 * @returns boolean - true if valid
 */
export function validateJMBG(jmbg: string): boolean {
  // Check format: exactly 13 digits
  if (!/^\d{13}$/.test(jmbg)) {
    return false;
  }

  // Extract parts
  const day = parseInt(jmbg.substring(0, 2), 10);
  const month = parseInt(jmbg.substring(2, 4), 10);

  // Basic date validation
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return false;
  }

  // Calculate checksum using mladsoft algorithm (reverse order, cycling multipliers 2-7)
  let kb = 0;
  for (let i = 11, multiplier = 2; i >= 0; i--) {
    kb += parseInt(jmbg.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  let expectedChecksum = 11 - (kb % 11);

  // Handle special cases
  if (expectedChecksum === 10) {
    return false; // Invalid JMBG
  }
  if (expectedChecksum === 11) {
    expectedChecksum = 0;
  }

  const actualChecksum = parseInt(jmbg.charAt(12), 10);
  return actualChecksum === expectedChecksum;
}

/**
 * Validate JMBG and throw error
 */
export function validateJMBGOrThrow(jmbg: string): void {
  if (!validateJMBG(jmbg)) {
    throw new Error(`Неважећи ЈМБГ: ${jmbg}. ЈМБГ мора имати 13 цифара са валидном контролном сумом.`);
  }
}

// =============================================================================
// Postal Code Validation (Serbian)
// =============================================================================

/**
 * Validate Serbian postal code (5 digits)
 *
 * @param postalCode - 5-digit postal code
 * @returns boolean - true if valid
 */
export function validatePostalCode(postalCode: string): boolean {
  return /^\d{5}$/.test(postalCode);
}

// =============================================================================
// Matični Broj Validation (Company Registration Number)
// =============================================================================

/**
 * Validate Serbian matični broj (8 digits)
 *
 * @param maticniBroj - 8-digit registration number
 * @returns boolean - true if valid
 */
export function validateMaticniBroj(maticniBroj: string): boolean {
  return /^\d{8}$/.test(maticniBroj);
}

// =============================================================================
// Export All Validators
// =============================================================================

export const validators = {
  pib: validatePIB,
  pibOrThrow: validatePIBOrThrow,
  activityCode: validateActivityCode,
  activityCodeOrThrow: validateActivityCodeOrThrow,
  jmbg: validateJMBG,
  jmbgOrThrow: validateJMBGOrThrow,
  postalCode: validatePostalCode,
  maticniBroj: validateMaticniBroj,
};
