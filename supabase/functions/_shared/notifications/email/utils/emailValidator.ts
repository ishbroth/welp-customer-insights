export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateAndSanitizeEmail(email: string) {
  const clean = sanitizeEmail(email);
  if (!clean) return { valid: false, email: clean, error: 'Required' };
  if (!isValidEmail(clean)) return { valid: false, email: clean, error: 'Invalid' };
  return { valid: true, email: clean };
}
