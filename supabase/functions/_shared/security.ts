
/**
 * Shared security utilities for edge functions
 */

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': "'self'",
  'style-src': "'self'",
  'img-src': "'self' data:",
  'font-src': "'self'",
  'connect-src': "'self' https://*.supabase.co",
  'frame-src': "'none'",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'"
};

/**
 * Generate Content Security Policy header value
 */
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
};

/**
 * Apply security headers to a response
 */
export const applySecurityHeaders = (response: Response): Response => {
  const headers = new Headers(response.headers);
  
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Apply CSP header
  headers.set('Content-Security-Policy', generateCSPHeader());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

/**
 * Validate and sanitize input
 */
export const sanitizeInput = (input: any): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/\0/g, '')
    .trim();
};

/**
 * Check for SQL injection patterns
 */
export const containsSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /('|(\\')|(;)|(\-\-)|(\s(or|and)\s)/i,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
    /(<script|javascript:|vbscript:|onload|onerror|onclick)/i,
    /(\bor\b|\band\b)\s*\d+\s*=\s*\d+/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};
