
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
  try {
    console.log("📤 Sending verification code to:", phoneNumber);
    
    const { data, error } = await supabase.functions.invoke("send-verification-code", {
      body: {
        phoneNumber: phoneNumber
      }
    });
    
    console.log("📊 SMS send result:", { data, error });
    
    if (error) {
      console.error("❌ Error sending SMS:", error);
      return { success: false, error: error.message };
    }
    
    if (data?.success) {
      console.log("✅ SMS sent successfully");
      return { success: true };
    } else {
      console.error("❌ SMS send failed:", data?.message);
      return { success: false, error: data?.message || "Failed to send verification code" };
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const verifyPhoneNumber = async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
  try {
    console.log("📱 Verifying phone number:", phoneNumber, "with code:", code);
    
    const { data, error } = await supabase.functions.invoke("verify-phone", {
      body: {
        phoneNumber: phoneNumber,
        code: code,
        actionType: "verify"
      }
    });
    
    console.log("📊 Verification result:", { data, error });
    
    if (error) {
      console.error("❌ Verification error:", error);
      return { isValid: false, error: error.message };
    }
    
    if (data?.success && data?.valid) {
      console.log("✅ Phone verification successful");
      return { isValid: true };
    } else {
      console.error("❌ Phone verification failed:", data?.message);
      return { isValid: false, error: data?.message || "Invalid verification code" };
    }
  } catch (error) {
    console.error("💥 Unexpected verification error:", error);
    return { isValid: false, error: "An unexpected error occurred during verification" };
  }
};

export const resendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
  return sendVerificationCode({ phoneNumber });
};
