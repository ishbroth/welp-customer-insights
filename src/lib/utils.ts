
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Functions to handle phone verification
export const verifyPhoneNumber = async ({ phoneNumber, code }: { phoneNumber: string, code: string }) => {
  try {
    const response = await fetch(`${window.location.protocol}//${window.location.host}/functions/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
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
    const response = await fetch(`${window.location.protocol}//${window.location.host}/functions/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
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
