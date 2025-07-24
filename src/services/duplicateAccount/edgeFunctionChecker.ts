
import { supabase } from "@/integrations/supabase/client";
import { DuplicateCheckResult } from "./types";

/**
 * Check for duplicates using the edge function that bypasses RLS
 */
export const checkDuplicatesViaEdgeFunction = async (
  email?: string,
  phone?: string,
  businessName?: string,
  address?: string,
  accountType: 'business' | 'customer' = 'business'
): Promise<DuplicateCheckResult> => {
  try {
    console.log("=== EDGE FUNCTION DUPLICATE CHECK START ===");
    console.log("Checking duplicates via edge function:", { email, phone, businessName, address, accountType });

    const { data, error } = await supabase.functions.invoke('check-duplicates', {
      body: {
        email,
        phone,
        businessName,
        address,
        accountType
      }
    });

    console.log("Edge function response:", { data, error });

    if (error) {
      console.error("Edge function error:", error);
      console.log("=== EDGE FUNCTION DUPLICATE CHECK END (ERROR) ===");
      return {
        isDuplicate: false,
        duplicateType: null,
        allowContinue: false
      };
    }

    console.log("=== EDGE FUNCTION DUPLICATE CHECK END (SUCCESS) ===");
    return data as DuplicateCheckResult;

  } catch (error) {
    console.error("Error calling edge function:", error);
    console.log("=== EDGE FUNCTION DUPLICATE CHECK END (CATCH ERROR) ===");
    return {
      isDuplicate: false,
      duplicateType: null,
      allowContinue: false
    };
  }
};

/**
 * Check if an email already exists using edge function (account-type-specific)
 */
export const checkEmailExistsViaEdgeFunction = async (email: string, accountType: 'business' | 'customer' = 'business'): Promise<boolean> => {
  const result = await checkDuplicatesViaEdgeFunction(email, undefined, undefined, undefined, accountType);
  return result.isDuplicate && result.duplicateType === 'email';
};

/**
 * Check if a phone already exists using edge function (account-type-specific)
 */
export const checkPhoneExistsViaEdgeFunction = async (phone: string, accountType: 'business' | 'customer' = 'business'): Promise<boolean> => {
  const result = await checkDuplicatesViaEdgeFunction(undefined, phone, undefined, undefined, accountType);
  return result.isDuplicate && result.duplicateType === 'phone';
};
