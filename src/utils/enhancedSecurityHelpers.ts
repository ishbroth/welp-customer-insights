import { logSecurityEvent } from "./securityLogging";

// Rate Limiting Store (In-Memory - Replace with Redis for production)
const rateLimitStore: { [key: string]: { count: number; expiry: number } } = {};

// Function to generate a unique key for rate limiting
const generateRateLimitKey = (identifier: string, action: string): string => {
  return `rate_limit:${action}:${identifier}`;
};

// Function to check if an action is rate limited
export const isRateLimited = (identifier: string, action: string, limit: number, duration: number): boolean => {
  const key = generateRateLimitKey(identifier, action);
  const now = Date.now();

  if (rateLimitStore[key] && rateLimitStore[key].expiry > now) {
    rateLimitStore[key].count++;
    if (rateLimitStore[key].count > limit) {
      return true; // Rate limited
    }
  } else {
    rateLimitStore[key] = { count: 1, expiry: now + duration };
  }

  return false; // Not rate limited
};

// Function to sanitize HTML content to prevent XSS attacks
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';

  let sanitized = html;

  // Remove potentially dangerous tags and attributes
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/onerror(=| )(["']?).*?\2/gi, '');
  sanitized = sanitized.replace(/onload(=| )(["']?).*?\2/gi, '');
  sanitized = sanitized.replace(/onmouseover(=| )(["']?).*?\2/gi, '');
  sanitized = sanitized.replace(/javascript:*/gi, '');
  sanitized = sanitized.replace(/vbscript:*/gi, '');

  return sanitized;
};

export const validateSecureInput = (input: string, type: 'email' | 'phone' | 'text' = 'text'): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // Check for common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    /'.*union.*select/i,
    /'.*drop.*table/i,
    /'.*insert.*into/i,
    /'.*delete.*from/i,
    /eval\(/i,
    /expression\(/i,
    /url\(/i,
    /import\(/i
  ];

  const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(input));
  
  if (hasDangerousContent) {
    logSecurityEvent('dangerous_input_detected', { input: input.substring(0, 100), type });
    return false;
  }

  // Type-specific validation
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) && input.length <= 254;
    case 'phone':
      return /^\+?[\d\s\-\(\)]+$/.test(input) && input.length <= 20;
    case 'text':
      return input.length <= 1000; // Fixed the syntax error here
    default:
      return true;
  }
};

// Function to generate a strong password
export const generateStrongPassword = (): string => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;<>,.?/";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

// Function to escape special characters in a string for use in a regular expression
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
