
import React, { useEffect } from 'react';
import { generateCSPHeader, SECURITY_HEADERS } from '@/utils/securityHeaders';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  useEffect(() => {
    // Apply security headers via meta tags where possible
    const applySecurityMeta = () => {
      // Add CSP meta tag if not already present
      if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = generateCSPHeader();
        document.head.appendChild(cspMeta);
      }
      
      // Add X-Content-Type-Options
      if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
        const nosniffMeta = document.createElement('meta');
        nosniffMeta.httpEquiv = 'X-Content-Type-Options';
        nosniffMeta.content = 'nosniff';
        document.head.appendChild(nosniffMeta);
      }
      
      // Add referrer policy
      if (!document.querySelector('meta[name="referrer"]')) {
        const referrerMeta = document.createElement('meta');
        referrerMeta.name = 'referrer';
        referrerMeta.content = 'strict-origin-when-cross-origin';
        document.head.appendChild(referrerMeta);
      }
    };
    
    applySecurityMeta();
    
    // Monitor for potential security issues
    const monitorSecurity = () => {
      // Listen for console errors that might indicate security issues
      window.addEventListener('error', (event) => {
        if (event.message.includes('Content Security Policy') || 
            event.message.includes('Mixed Content') ||
            event.message.includes('Refused to')) {
          console.warn('Security policy violation detected:', event.message);
        }
      });
      
      // Monitor for potential XSS attempts
      const originalInnerHTML = Element.prototype.innerHTML;
      Element.prototype.innerHTML = function(value) {
        if (typeof value === 'string' && (
          value.includes('<script') || 
          value.includes('javascript:') ||
          value.includes('on'))) {
          console.warn('Potential XSS attempt blocked:', value);
          return;
        }
        return originalInnerHTML.call(this, value);
      };
    };
    
    monitorSecurity();
  }, []);

  return <>{children}</>;
};
