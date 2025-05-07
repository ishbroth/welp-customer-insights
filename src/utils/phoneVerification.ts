
import { supabase } from "@/integrations/supabase/client";

// Function to send SMS verification code
export const sendSmsVerification = async (phoneNumber: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-sms-verification", {
      body: JSON.stringify({ phoneNumber }),
    });

    if (error) {
      console.error("Error invoking send-sms-verification function:", error);
      throw new Error(error.message || "Failed to send verification code");
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to send verification code");
    }

    return {
      success: true,
      verificationCode: data.verificationCode,
      message: "Verification code sent successfully"
    };
  } catch (error) {
    console.error("Error sending SMS verification:", error);
    return {
      success: false,
      message: error.message || "Failed to send verification code"
    };
  }
};

// Function to validate phone number format
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic validation for US phone numbers
  // Accepts formats: (123) 456-7890, 123-456-7890, 1234567890
  const phoneRegex = /^(\+?1)?[-\s]?\(?(\d{3})\)?[-\s]?(\d{3})[-\s]?(\d{4})$/;
  return phoneRegex.test(phoneNumber);
};

// Function to format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the number starts with country code 1
  const hasCountryCode = cleaned.length > 10 && cleaned.startsWith('1');
  
  // Extract the last 10 digits
  const lastTen = cleaned.slice(hasCountryCode ? -10 : 0);
  
  if (lastTen.length !== 10) {
    return phoneNumber; // Return original if not valid
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${lastTen.slice(0, 3)}) ${lastTen.slice(3, 6)}-${lastTen.slice(6)}`;
};
