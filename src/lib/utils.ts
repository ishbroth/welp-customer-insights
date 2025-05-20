
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Functions to handle phone verification
export const verifyPhoneNumber = async ({ phoneNumber, code }: { phoneNumber: string, code: string }) => {
  try {
    const { data, error } = await fetch(`https://yftvcixhifvrovwhtgtj.functions.supabase.co/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        code,
        actionType: "verify"
      })
    }).then(res => res.json());
    
    if (error) {
      throw new Error(error.message || 'Verification failed');
    }
    
    return { 
      isValid: data?.isValid || false, 
      error: data?.isValid ? null : 'Invalid verification code' 
    };
  } catch (error: any) {
    console.error('Error verifying phone number:', error);
    return { isValid: false, error: error.message || 'Verification failed' };
  }
};

export const resendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
  try {
    const { data, error } = await fetch(`https://yftvcixhifvrovwhtgtj.functions.supabase.co/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        actionType: "send"
      })
    }).then(res => res.json());
    
    if (error) {
      throw new Error(error.message || 'Failed to send code');
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error resending verification code:', error);
    return { success: false, error: error.message || 'Failed to resend code' };
  }
};
