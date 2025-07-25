
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced rate limiting utility functions with account lockout
 */

export const checkRateLimit = async (
  identifier: string,
  attemptType: 'login' | 'signup' | 'reset_password' | 'verification',
  maxAttempts: number = 5,
  windowMinutes: number = 15,
  blockMinutes: number = 30
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_attempt_type: attemptType,
      p_max_attempts: maxAttempts,
      p_window_minutes: windowMinutes,
      p_block_minutes: blockMinutes
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }

    return data;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
};

export const checkRateLimitWithLockout = async (
  identifier: string,
  attemptType: 'login' | 'signup' | 'reset_password' | 'verification',
  maxAttempts: number = 5,
  windowMinutes: number = 15,
  blockMinutes: number = 30,
  lockoutAttempts: number = 10,
  lockoutDurationMinutes: number = 60
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit_with_lockout', {
      p_identifier: identifier,
      p_attempt_type: attemptType,
      p_max_attempts: maxAttempts,
      p_window_minutes: windowMinutes,
      p_block_minutes: blockMinutes,
      p_lockout_attempts: lockoutAttempts,
      p_lockout_duration_minutes: lockoutDurationMinutes
    });

    if (error) {
      console.error('Rate limit with lockout check error:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }

    return data;
  } catch (error) {
    console.error('Rate limit with lockout check error:', error);
    return true; // Allow on error
  }
};

export const logSecurityEvent = async (
  eventType: string,
  eventDescription: string,
  userId?: string,
  metadata?: any
): Promise<void> => {
  try {
    // Get IP address and user agent if available
    const ipAddress = await getClientIP();
    const userAgent = navigator.userAgent;

    await supabase.rpc('log_security_event', {
      p_user_id: userId || null,
      p_event_type: eventType,
      p_event_description: eventDescription,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_metadata: metadata ? JSON.stringify(metadata) : null
    });
  } catch (error) {
    console.error('Security event logging error:', error);
  }
};

const getClientIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return null;
  }
};
