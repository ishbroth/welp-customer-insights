
import { supabase } from "@/integrations/supabase/client";

export interface SendEmailVerificationCodeParams {
  email: string;
}

export interface SendEmailVerificationCodeResponse {
  success: boolean;
  error?: string;
}

export const sendEmailVerificationCode = async ({ 
  email 
}: SendEmailVerificationCodeParams): Promise<SendEmailVerificationCodeResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email-verification-code', {
      body: { email }
    });

    if (error) {
      console.error("Error sending email verification code:", error);
      return { success: false, error: error.message };
    }

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.message || "Failed to send verification code" };
    }
  } catch (error) {
    console.error("Unexpected error sending email verification code:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
};

export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
