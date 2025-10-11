
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimitWithLockout, logSecurityEvent } from '@/utils/rateLimiting';
import { isValidEmail, validatePassword, sanitizeFormInput, containsSQLInjection } from '@/utils/enhancedSecurityHelpers';
import { toast } from '@/components/ui/sonner';
import { logger } from '@/utils/logger';

const authLogger = logger.withContext('SecureAuth');

export const useSecureAuth = () => {
  const [loading, setLoading] = useState(false);

  const secureLogin = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeFormInput(email);
      
      // Validate email format
      if (!isValidEmail(sanitizedEmail)) {
        toast.error('Please enter a valid email address');
        return { success: false, error: 'Invalid email format' };
      }
      
      // Check for SQL injection attempts
      if (containsSQLInjection(sanitizedEmail) || containsSQLInjection(password)) {
        await logSecurityEvent('sql_injection_attempt', 'SQL injection detected in login attempt', undefined, { email: sanitizedEmail });
        toast.error('Invalid input detected');
        return { success: false, error: 'Invalid input detected' };
      }
      
      // Check rate limiting with account lockout
      const canAttempt = await checkRateLimitWithLockout(sanitizedEmail, 'login', 5, 15, 30, 10, 60);
      if (!canAttempt) {
        const errorMessage = 'Too many login attempts. Please try again later.';
        toast.error(errorMessage);
        await logSecurityEvent('login_rate_limited', `Login rate limited for email: ${sanitizedEmail}`);
        return { success: false, error: errorMessage };
      }
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password
      });
      
      if (error) {
        await logSecurityEvent('login_failed', `Login failed for email: ${sanitizedEmail}`, undefined, { error: error.message });
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        await logSecurityEvent('login_success', `User logged in successfully`, data.user.id);
      }
      
      return { success: true, data };

    } catch (error) {
      authLogger.error('Login error:', error);
      await logSecurityEvent('login_error', `Login system error`, undefined, { error: error.message });
      return { success: false, error: 'An unexpected error occurred during login' };
    } finally {
      setLoading(false);
    }
  };

  const secureSignup = async (email: string, password: string, userData: any) => {
    setLoading(true);
    
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeFormInput(email);
      const sanitizedUserData = {
        ...userData,
        name: sanitizeFormInput(userData.name || ''),
        firstName: sanitizeFormInput(userData.firstName || ''),
        lastName: sanitizeFormInput(userData.lastName || ''),
        phone: sanitizeFormInput(userData.phone || ''),
        address: sanitizeFormInput(userData.address || ''),
        city: sanitizeFormInput(userData.city || ''),
        state: sanitizeFormInput(userData.state || ''),
        zipCode: sanitizeFormInput(userData.zipCode || ''),
        businessName: sanitizeFormInput(userData.businessName || '')
      };
      
      // Validate email
      if (!isValidEmail(sanitizedEmail)) {
        toast.error('Please enter a valid email address');
        return { success: false, error: 'Invalid email format' };
      }
      
      // Check for SQL injection attempts
      if (containsSQLInjection(sanitizedEmail) || containsSQLInjection(password) || 
          Object.values(sanitizedUserData).some(value => typeof value === 'string' && containsSQLInjection(value))) {
        await logSecurityEvent('sql_injection_attempt', 'SQL injection detected in signup attempt', undefined, { email: sanitizedEmail });
        toast.error('Invalid input detected');
        return { success: false, error: 'Invalid input detected' };
      }
      
      // Validate password
      const passwordValidation = validatePassword(password, userData.type || 'customer');
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return { success: false, error: passwordValidation.message };
      }
      
      // Check rate limiting with account lockout
      const canAttempt = await checkRateLimitWithLockout(sanitizedEmail, 'signup', 3, 60, 60, 5, 120);
      if (!canAttempt) {
        const errorMessage = 'Too many signup attempts. Please try again later.';
        toast.error(errorMessage);
        await logSecurityEvent('signup_rate_limited', `Signup rate limited for email: ${sanitizedEmail}`);
        return { success: false, error: errorMessage };
      }
      
      // Attempt signup
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
        options: {
          data: sanitizedUserData
        }
      });
      
      if (error) {
        await logSecurityEvent('signup_failed', `Signup failed for email: ${sanitizedEmail}`, undefined, { error: error.message });
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        await logSecurityEvent('signup_success', `User signed up successfully`, data.user.id, { userType: userData.type });
      }
      
      return { success: true, data };

    } catch (error) {
      authLogger.error('Signup error:', error);
      await logSecurityEvent('signup_error', `Signup system error`, undefined, { error: error.message });
      return { success: false, error: 'An unexpected error occurred during signup' };
    } finally {
      setLoading(false);
    }
  };

  const securePasswordReset = async (email: string) => {
    setLoading(true);
    
    try {
      // Sanitize email
      const sanitizedEmail = sanitizeFormInput(email);
      
      // Validate email
      if (!isValidEmail(sanitizedEmail)) {
        toast.error('Please enter a valid email address');
        return { success: false, error: 'Invalid email format' };
      }
      
      // Check for SQL injection attempts
      if (containsSQLInjection(sanitizedEmail)) {
        await logSecurityEvent('sql_injection_attempt', 'SQL injection detected in password reset attempt', undefined, { email: sanitizedEmail });
        toast.error('Invalid input detected');
        return { success: false, error: 'Invalid input detected' };
      }
      
      // Check rate limiting with account lockout
      const canAttempt = await checkRateLimitWithLockout(sanitizedEmail, 'reset_password', 3, 60, 60, 5, 120);
      if (!canAttempt) {
        const errorMessage = 'Too many password reset attempts. Please try again later.';
        toast.error(errorMessage);
        await logSecurityEvent('password_reset_rate_limited', `Password reset rate limited for email: ${sanitizedEmail}`);
        return { success: false, error: errorMessage };
      }
      
      // Attempt password reset
      const { data, error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        await logSecurityEvent('password_reset_failed', `Password reset failed for email: ${sanitizedEmail}`, undefined, { error: error.message });
        return { success: false, error: error.message };
      }
      
      await logSecurityEvent('password_reset_requested', `Password reset requested for email: ${sanitizedEmail}`);
      return { success: true, data };

    } catch (error) {
      authLogger.error('Password reset error:', error);
      await logSecurityEvent('password_reset_error', `Password reset system error`, undefined, { error: error.message });
      return { success: false, error: 'An unexpected error occurred during password reset' };
    } finally {
      setLoading(false);
    }
  };

  return {
    secureLogin,
    secureSignup,
    securePasswordReset,
    loading
  };
};
