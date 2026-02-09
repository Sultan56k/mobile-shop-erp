/**
 * IMEI Validator
 * Validates IMEI numbers using the Luhn algorithm (checksum validation)
 */

/**
 * Validate IMEI format and checksum
 * @param {string} imei - IMEI number to validate
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateIMEI(imei) {
  // Check if IMEI is provided
  if (!imei) {
    return { valid: false, error: 'IMEI is required' };
  }

  // Convert to string and remove whitespace
  const imeiStr = String(imei).trim().replace(/\s/g, '');

  // Check if IMEI contains only digits
  if (!/^\d+$/.test(imeiStr)) {
    return { valid: false, error: 'IMEI must contain only digits' };
  }

  // Check IMEI length (must be 15 or 14 digits)
  if (imeiStr.length !== 15 && imeiStr.length !== 14) {
    return {
      valid: false,
      error: `IMEI must be 15 digits (got ${imeiStr.length})`
    };
  }

  // For 14-digit IMEI, validate without checksum
  if (imeiStr.length === 14) {
    return { valid: true, error: null };
  }

  // For 15-digit IMEI, validate using Luhn algorithm
  if (!luhnCheck(imeiStr)) {
    return {
      valid: false,
      error: 'Invalid IMEI checksum (failed Luhn algorithm)'
    };
  }

  return { valid: true, error: null };
}

/**
 * Luhn algorithm (Modulus 10) checksum validation
 * Used by IMEI, credit cards, etc.
 * @param {string} num - Number string to validate
 * @returns {boolean}
 */
function luhnCheck(num) {
  let sum = 0;
  let isEven = false;

  // Loop through values starting from the rightmost digit
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Format IMEI for display (adds spaces for readability)
 * Example: 123456789012345 -> 123456 789012 345
 * @param {string} imei - IMEI number
 * @returns {string}
 */
export function formatIMEI(imei) {
  if (!imei) return '';
  const cleaned = String(imei).replace(/\s/g, '');

  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 6)} ${cleaned.slice(6, 12)} ${cleaned.slice(12)}`;
  }

  return cleaned;
}

/**
 * Clean IMEI (remove spaces and formatting)
 * @param {string} imei - IMEI number
 * @returns {string}
 */
export function cleanIMEI(imei) {
  if (!imei) return '';
  return String(imei).trim().replace(/\s/g, '');
}

export default { validateIMEI, formatIMEI, cleanIMEI };
