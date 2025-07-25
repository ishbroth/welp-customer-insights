
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit, logSecurityEvent } from '@/utils/rateLimiting';
import { isValidVerificationCode, isValidPhoneNumber } from '@/utils/enhancedSecurityHelpers';
import { toast } from '@/components/ui/sonner';

export const useSecureVerification = () => {
  const [loading, setLoading] = useState(false);

  const secureVerifyCode = async (code: string, identifier: string, type: 'phone' | 'email' = 'phone') => {
    setLoading(true);
    
    try {
      // Validate code format
      if (!isValidVerificationCode(code)) {
        toast.error('Please enter a valid 6-digit verification code');
        return { success: false, error: 'Invalid verification code format' };
      }
      
      // Check rate limiting
      const canAttempt = await checkRateLimit(identifier, 'verification', 5, 15, 30);
      if (!canAttempt) {
        const errorMessage = 'Too many verification attempts. Please try again later.';
        toast.error(errorMessage);
        await logSecurityEvent('verification_rate_limited', `Verification rate limited for ${type}: ${identifier}`);
        return { success: false, error: errorMessage };
      }
      
      // Validate the code using the database function
      const { data, error } = await supabase.rpc('validate_verification_code', {
        p_code: code,
        p_identifier: identifier,
        p_type: type
      });
      
      if (error) {
        await logSecurityEvent('verification_failed', `Verification failed for ${type}: ${identifier}`, undefined, { error: error.message });
        return { success: false, error: error.message };
      }
      
      if (!data) {
        await logSecurityEvent('verification_invalid', `Invalid verification code for ${type}: ${identifier}`);
        return { success: false, error: 'Invalid or expired verification code' };
      }
      
      await logSecurityEvent('verification_success', `Verification successful for ${type}: ${identifier}`);
      return { success: true, data };
      
    } catch (error) {
      console.error('Verification error:', error);
      await logSecurityEvent('verification_error', `Verification system error`, undefined, { error: error.message });
      return { success: false, error: 'An unexpected error occurred during verification' };
    } finally {
      setLoading(false);
    }
  };

  const secureRequestCode = async (identifier: string, type: 'phone' | 'email' = 'phone') => {
    setLoading(true);
    
    try {
      // Validate identifier format
      if (type === 'phone' && !isValidPhoneNumber(identifier)) {
        toast.error('Please enter a valid phone number');
        return { success: false, error: 'Invalid phone number format' };
      }
      
      // Check rate limiting
      const canAttempt = await checkRateLimit(identifier, 'verification', 3, 60, 60);
      if (!canAttempt) {
        const errorMessage = 'Too many verification requests. Please try again later.';
        toast.error(errorMessage);
        await logSecurityEvent('verification_request_rate_limited', `Verification request rate limited for ${type}: ${identifier}`);
        return { success: false, error: errorMessage };
      }
      
      // Request verification code
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          [type === 'phone' ? 'phoneNumber' : 'email']: identifier,
          type: type
        }
      });
      
      if (error) {
        await logSecurityEvent('verification_request_failed', `Verification request failed for ${type}: ${identifier}`, undefined, { error: error.message });
        return { success: false, error: error.message };
      }
      
      await logSecurityEvent('verification_request_sent', `Verification code sent to ${type}: ${identifier}`);
      return { success: true, data };
      
    } catch (error) {
      console.error('Verification request error:', error);
      await logSecurityEvent('verification_request_error', `Verification request system error`, undefined, { error: error.message });
      return { success: false, error: 'An unexpected error occurred while requesting verification code' };
    } finally {
      setLoading(false);
    }
  };

  return {
    secureVerifyCode,
    secureRequestCode,
    loading
  };
};
