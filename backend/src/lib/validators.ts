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
 * Validate Serbian PIB (9-digit tax ID with modulo-11 checksum)
 *
 * Algorithm:
 * 1. First 8 digits are base number
 * 2. 9th digit is checksum: 11 - ((d1*7 + d2*6 + ... + d8*2) mod 11)
 * 3. If result is 10, PIB is invalid
 * 4. If result is 11, checksum is 0
 *
 * @param pib - 9-digit PIB string
 * @returns boolean - true if valid
 *
 * Example valid PIB: 106006801
 */
export function validatePIB(pib: string): boolean {
  // Check format: exactly 9 digits
  if (!/^\d{9}$/.test(pib)) {
    return false;
  }

  // Extract digits
  const digits = pib.split('').map(Number);
  const checksum = digits[8];

  // Calculate expected checksum
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * (7 - i);
  }

  const remainder = sum % 11;
  let expectedChecksum = 11 - remainder;

  // Special cases
  if (expectedChecksum === 10) {
    return false; // Invalid PIB
  }
  if (expectedChecksum === 11) {
    expectedChecksum = 0;
  }

  return checksum === expectedChecksum;
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

  // Calculate checksum
  const digits = jmbg.split('').map(Number);
  const checksum = digits[12];

  let sum = 0;
  for (let i = 0; i < 6; i++) {
    sum += digits[i] * (7 - i);
  }
  for (let i = 6; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }

  const expectedChecksum = 11 - (sum % 11);

  // Handle special cases
  if (expectedChecksum === 10) {
    return false; // Invalid JMBG
  }
  if (expectedChecksum === 11) {
    return checksum === 0;
  }

  return checksum === expectedChecksum;
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
