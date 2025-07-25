
/**
 * Security headers and Content Security Policy configuration
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
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'font-src': "'self' data:",
  'connect-src': "'self' https://*.supabase.co wss://*.supabase.co https://api.ipify.org",
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
 * Apply security headers to a response (for edge functions)
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
 * Validate session security
 */
export const validateSessionSecurity = (sessionData: any): boolean => {
  if (!sessionData || !sessionData.user) {
    return false;
  }
  
  const now = Date.now();
  const sessionAge = now - new Date(sessionData.user.created_at).getTime();
  
  // Check if session is too old (24 hours)
  if (sessionAge > 24 * 60 * 60 * 1000) {
    return false;
  }
  
  // Check if session needs refresh (1 hour)
  const lastRefresh = sessionData.user.last_sign_in_at ? 
    new Date(sessionData.user.last_sign_in_at).getTime() : 
    new Date(sessionData.user.created_at).getTime();
    
  if (now - lastRefresh > 60 * 60 * 1000) {
    return false;
  }
  
  return true;
};
