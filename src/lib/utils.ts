
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatPhoneForTwilio } from "@/utils/phoneFormatter";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Functions to handle phone verification
export const verifyPhoneNumber = async ({ phoneNumber, code }: { phoneNumber: string, code: string }) => {
  try {
    const formattedPhone = formatPhoneForTwilio(phoneNumber);
    console.log("🔍 Verifying phone:", { original: phoneNumber, formatted: formattedPhone });
    
    const response = await fetch(`https://yftvcixhifvrovwhtgtj.supabase.co/functions/v1/verify-phone`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHZjaXhoaWZ2cm92d2h0Z3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODY1ODQsImV4cCI6MjA2MTU2MjU4NH0.dk0-iM54olbkNnCEb92-KNsIeDw9u2owEg4B-fh5ggc`
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        code,
        actionType: "verify"
      })
    });
    
    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Verification request failed');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Verification failed');
    }
    
    return { 
      isValid: data.isValid || false, 
      error: data.isValid ? null : 'Invalid verification code' 
    };
  } catch (error: any) {
    console.error('Error verifying phone number:', error);
    return { isValid: false, error: error.message || 'Verification failed' };
  }
};

export const resendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
  try {
    const formattedPhone = formatPhoneForTwilio(phoneNumber);
    console.log("📤 Resending code to:", { original: phoneNumber, formatted: formattedPhone });
    
    const response = await fetch(`https://yftvcixhifvrovwhtgtj.supabase.co/functions/v1/verify-phone`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHZjaXhoaWZ2cm92d2h0Z3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODY1ODQsImV4cCI6MjA2MTU2MjU4NH0.dk0-iM54olbkNnCEb92-KNsIeDw9u2owEg4B-fh5ggc`
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        actionType: "send"
      })
    });
    
    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Failed to send code');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to send verification code');
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error resending verification code:', error);
    return { success: false, error: error.message || 'Failed to resend code' };
  }
};
