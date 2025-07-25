
/**
 * Supabase security configuration utilities
 */

export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMITS: {
    LOGIN: {
      maxAttempts: 5,
      windowMinutes: 15,
      blockMinutes: 30
    },
    SIGNUP: {
      maxAttempts: 3,
      windowMinutes: 60,
      blockMinutes: 60
    },
    PASSWORD_RESET: {
      maxAttempts: 3,
      windowMinutes: 60,
      blockMinutes: 60
    },
    VERIFICATION: {
      maxAttempts: 5,
      windowMinutes: 15,
      blockMinutes: 30
    }
  },
  
  // Session configuration
  SESSION: {
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    refreshThreshold: 60 * 60, // 1 hour in seconds
    inactivityTimeout: 30 * 60 // 30 minutes in seconds
  },
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  },
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https:",
    'font-src': "'self' data:",
    'connect-src': "'self' https://*.supabase.co wss://*.supabase.co",
    'frame-src': "'none'",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'"
  }
};

/**
 * Apply security headers to responses
 */
export const applySecurityHeaders = (response: Response): Response => {
  const headers = new Headers(response.headers);
  
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Build CSP header
  const cspHeader = Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
  
  headers.set('Content-Security-Policy', cspHeader);
  
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
  
  // Check if session is too old
  if (sessionAge > SECURITY_CONFIG.SESSION.maxAge * 1000) {
    return false;
  }
  
  // Check if session needs refresh
  const lastRefresh = sessionData.user.last_sign_in_at ? 
    new Date(sessionData.user.last_sign_in_at).getTime() : 
    new Date(sessionData.user.created_at).getTime();
    
  if (now - lastRefresh > SECURITY_CONFIG.SESSION.refreshThreshold * 1000) {
    return false;
  }
  
  return true;
};
