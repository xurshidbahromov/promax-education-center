/**
 * Format Uzbek phone numbers automatically into standard format: +998 (XX) XXX-XX-XX
 */
export function formatUzPhone(input?: string | null): string {
  if (!input) return '';

  // Extract digits
  let digits = input.replace(/\D/g, '');

  // Strip initial 998 if present
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }

  // Max 9 digits for national phone number
  digits = digits.slice(0, 9);

  if (digits.length === 0) {
    return '';
  }

  let formatted = '+998';

  if (digits.length > 0) {
    formatted += ` (${digits.slice(0, 2)}`;
  }
  if (digits.length >= 2) {
    formatted += `) ${digits.slice(2, 5)}`;
  }
  if (digits.length >= 5) {
    formatted += `-${digits.slice(5, 7)}`;
  }
  if (digits.length >= 7) {
    formatted += `-${digits.slice(7, 9)}`;
  }

  return formatted;
}

/**
 * Clean phone number to raw e164 string like +998901234567 for database storage
 */
export function cleanUzPhone(input?: string | null): string {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');
  if (!digits.startsWith('998') && digits.length === 9) {
    digits = '998' + digits;
  }
  return digits ? '+' + digits : '';
}
