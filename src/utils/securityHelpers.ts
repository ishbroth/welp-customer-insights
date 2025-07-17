
import DOMPurify from 'dompurify';

/**
 * Security utility functions for the application
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOWED_URI_REGEXP: /^https?:\/\/|^\/|^#/
  });
};

/**
 * Sanitize CSS content to prevent CSS injection
 */
export const sanitizeCSS = (css: string): string => {
  return DOMPurify.sanitize(css, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  });
};

/**
 * Validate and sanitize URL inputs
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '#';
    }
    return urlObj.toString();
  } catch {
    return '#';
  }
};

/**
 * Escape special characters in user input for safe display
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Generate secure random tokens
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate phone number format (basic validation)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};
