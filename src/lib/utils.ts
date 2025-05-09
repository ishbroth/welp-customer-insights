import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Functions to handle phone verification
export const verifyPhoneNumber = async ({ phoneNumber, code }: { phoneNumber: string, code: string }) => {
  try {
    // In a real implementation, we would call a Supabase Edge Function or API
    // For now, let's simulate a verification with a simple check (any 6-digit code)
    const isValidFormat = /^\d{6}$/.test(code);
    
    // For demo purposes, let's consider any 6-digit code as valid
    return { isValid: isValidFormat, error: isValidFormat ? null : 'Invalid code format' };
  } catch (error: any) {
    console.error('Error verifying phone number:', error);
    return { isValid: false, error: error.message || 'Verification failed' };
  }
};

export const resendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
  try {
    // In a real implementation, we would call a Supabase Edge Function or API
    // For now, we'll just simulate a successful code resend
    console.log(`Simulating code resend to ${phoneNumber}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error resending verification code:', error);
    return { success: false, error: error.message || 'Failed to resend code' };
  }
};
