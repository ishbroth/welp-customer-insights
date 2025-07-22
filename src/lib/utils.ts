
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const verifyPhoneNumber = async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-phone-code', {
      body: {
        phoneNumber,
        code,
        userData: {} // This will be handled by the verification actions hook
      }
    });

    if (error) {
      console.error("Phone verification error:", error);
      return { isValid: false, error: error.message };
    }

    return { isValid: data.success, error: data.message };
  } catch (error) {
    console.error("Phone verification error:", error);
    return { isValid: false, error: "Failed to verify phone number" };
  }
};

export const resendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-verification-code", {
      body: {
        phoneNumber: phoneNumber
      }
    });
    
    if (error) {
      console.error("Error resending verification code:", error);
      return { success: false, error: error.message };
    }
    
    return { success: data?.success || false, error: data?.message };
  } catch (error) {
    console.error("Error resending verification code:", error);
    return { success: false, error: "Failed to resend verification code" };
  }
};
