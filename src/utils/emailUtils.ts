
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const utilLogger = logger.withContext('emailUtils');

interface EmailVerificationRequest {
  email: string;
}

/**
 * Sends an email verification code to the specified email address
 *
 * @param email The email address to send verification code to
 * @returns Promise with result of sending the verification code
 */
export const sendEmailVerificationCode = async (params: EmailVerificationRequest): Promise<{
  success: boolean;
  message: string;
  debug?: any;
}> => {
  try {
    utilLogger.info(`Sending verification code to: ${params.email}`);
    
    const { data, error } = await supabase.functions.invoke('send-email-verification-code', {
      body: { email: params.email }
    });

    if (error) {
      utilLogger.error("Error sending email verification code:", error);
      throw error;
    }

    return data;
  } catch (error) {
    utilLogger.error("Failed to send email verification code:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send verification code"
    };
  }
};

/**
 * Verifies an email verification code
 * 
 * @param email The email address to verify
 * @param code The verification code to check
 * @param accountType The type of account being created (customer or business)
 * @param userData Additional user data for account creation
 * @returns Promise with result of the verification
 */
export const verifyEmailCode = async (
  email: string,
  code: string,
  accountType: 'customer' | 'business',
  userData: any
): Promise<{
  success: boolean;
  isValid: boolean;
  message: string;
  userData?: any;
  session?: any;
  user?: any;
}> => {
  try {
    utilLogger.info(`Verifying email code for: ${email}`);

    const { data, error } = await supabase.functions.invoke('verify-email-code', {
      body: {
        email,
        code,
        accountType,
        userData
      }
    });

    if (error) {
      utilLogger.error("Error verifying email code:", error);
      throw error;
    }

    return data;
  } catch (error) {
    utilLogger.error("Failed to verify email code:", error);
    return {
      success: false,
      isValid: false,
      message: error instanceof Error ? error.message : "Failed to verify email code"
    };
  }
};
