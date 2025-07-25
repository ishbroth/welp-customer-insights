
import DOMPurify from 'dompurify';
import { logSecurityEvent } from './rateLimiting';

/**
 * Enhanced security utility functions
 */

/**
 * Enhanced email validation with security checks
 */
export const isValidEmail = (email: string): boolean => {
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return false;
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /script/i, // Script injection
    /javascript/i, // JavaScript injection
    /\<|\>/, // HTML tags
    /\.\.\//,  // Path traversal
    /\0/ // Null bytes
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(email))) {
    logSecurityEvent('suspicious_email', 'Email contains suspicious patterns', undefined, { email });
    return false;
  }
  
  return true;
};

/**
 * Sanitize form inputs with enhanced security
 */
export const sanitizeFormInput = (input: string): string => {
  if (!input) return '';
  
  // First sanitize with DOMPurify
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  });
  
  // Remove potentially dangerous characters
  sanitized = sanitized
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/\0/g, '') // Remove null bytes
    .trim();
  
  return sanitized;
};

/**
 * Validate and sanitize business ID/license numbers
 */
export const sanitizeBusinessId = (businessId: string): string => {
  if (!businessId) return '';
  
  // Remove all non-alphanumeric characters except hyphens and spaces
  const cleaned = businessId.replace(/[^a-zA-Z0-9\s-]/g, '');
  
  // Limit length to prevent abuse
  return cleaned.substring(0, 50);
};

/**
 * Check for common SQL injection patterns
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

/**
 * Validate verification codes with enhanced security
 */
export const isValidVerificationCode = (code: string): boolean => {
  // Must be exactly 6 digits
  const codeRegex = /^\d{6}$/;
  
  if (!codeRegex.test(code)) {
    return false;
  }
  
  // Check for obviously fake codes
  const invalidCodes = [
    '000000', '111111', '222222', '333333', '444444',
    '555555', '666666', '777777', '888888', '999999',
    '123456', '654321', '000123', '123000'
  ];
  
  return !invalidCodes.includes(code);
};

/**
 * Enhanced password validation (keeping current length requirements)
 */
export const validatePassword = (password: string, userType: 'business' | 'customer'): { isValid: boolean; message?: string } => {
  const minLength = userType === 'business' ? 6 : 8;
  
  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long` };
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', 'password123', '123456', '12345678', 'qwerty',
    'admin', 'admin123', 'letmein', 'welcome', 'password1'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: 'Password is too common. Please choose a stronger password' };
  }
  
  // Check for sequential characters
  const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password);
  
  if (hasSequential) {
    return { isValid: false, message: 'Password should not contain sequential characters' };
  }
  
  return { isValid: true };
};

/**
 * Enhanced input validation for forms
 */
export const validateFormData = (data: Record<string, any>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Check each field for potential security issues
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (typeof value === 'string') {
      // Check for SQL injection
      if (containsSQLInjection(value)) {
        errors[key] = 'Invalid characters detected';
      }
      
      // Check for XSS attempts
      if (value.includes('<script') || value.includes('javascript:')) {
        errors[key] = 'Invalid content detected';
      }
      
      // Check for path traversal
      if (value.includes('../') || value.includes('..\\')) {
        errors[key] = 'Invalid path detected';
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Secure random string generation
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Rate limiting helper
 */
export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');
  
  // Filter out old attempts
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false;
  }
  
  // Add current attempt
  recentAttempts.push(now);
  localStorage.setItem(`rateLimit_${key}`, JSON.stringify(recentAttempts));
  
  return true;
};
