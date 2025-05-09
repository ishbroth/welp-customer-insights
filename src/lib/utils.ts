
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock functions for phone verification - would connect to a real verification service in production
export async function verifyPhoneNumber({ 
  phoneNumber, 
  code 
}: { 
  phoneNumber: string; 
  code: string 
}): Promise<{ isValid: boolean }> {
  console.log(`Verifying code ${code} for phone number ${phoneNumber}`);
  
  // For testing purposes, we'll consider "123456" as a valid code
  // In a real app, this would validate against a verification service
  return Promise.resolve({ isValid: code === "123456" });
}

export async function resendVerificationCode({ 
  phoneNumber 
}: { 
  phoneNumber: string 
}): Promise<{ success: boolean }> {
  console.log(`Resending verification code to ${phoneNumber}`);
  
  // Mock successful resending of code
  // In a real app, this would connect to a verification service API
  return Promise.resolve({ success: true });
}
