
import { supabase } from "@/integrations/supabase/client";

/**
 * Debug utility to help track orphaned data issues
 */
export const debugOrphanedData = async (phoneNumber: string) => {
  console.log("🔍 DEBUG: Starting orphaned data check for phone:", phoneNumber);
  
  const cleanedPhone = phoneNumber.replace(/\D/g, '');
  console.log("🔍 DEBUG: Cleaned phone number:", cleanedPhone);
  
  // Check profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, phone, email, name, type')
    .ilike('phone', `%${cleanedPhone}%`);
  
  console.log("🔍 DEBUG: Profiles check:", { profiles, profilesError });
  
  // Check verification codes
  const { data: verificationCodes, error: verificationError } = await supabase
    .from('verification_codes')
    .select('id, phone, created_at')
    .ilike('phone', `%${cleanedPhone}%`);
  
  console.log("🔍 DEBUG: Verification codes check:", { verificationCodes, verificationError });
  
  // Check reviews with customer phone
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, customer_phone, customer_name')
    .ilike('customer_phone', `%${cleanedPhone}%`);
  
  console.log("🔍 DEBUG: Reviews check:", { reviews, reviewsError });
  
  return {
    phoneNumber,
    cleanedPhone,
    profiles: profiles || [],
    verificationCodes: verificationCodes || [],
    reviews: reviews || [],
    errors: {
      profilesError,
      verificationError,
      reviewsError
    }
  };
};

/**
 * Clear all verification codes for a phone number
 */
export const clearVerificationCodes = async (phoneNumber: string) => {
  console.log("🧹 DEBUG: Clearing verification codes for phone:", phoneNumber);
  
  const cleanedPhone = phoneNumber.replace(/\D/g, '');
  
  const { error } = await supabase
    .from('verification_codes')
    .delete()
    .ilike('phone', `%${cleanedPhone}%`);
  
  if (error) {
    console.error("❌ Error clearing verification codes:", error);
  } else {
    console.log("✅ Verification codes cleared successfully");
  }
  
  return { success: !error, error };
};

/**
 * Check for permanent accounts that should not be deleted
 */
export const checkPermanentAccounts = async (email?: string, phone?: string) => {
  console.log("🔒 DEBUG: Checking for permanent accounts:", { email, phone });
  
  const permanentEmails = [
    'demo@welp.com',
    'test@welp.com', 
    'permanent@welp.com',
    'iw@sdcarealty.com' // Known business account
  ];
  
  const permanentPhones = [
    '(619) 724-2702', // Known problematic phone
    '6197242702' // Cleaned version
  ];
  
  const cleanedPhone = phone ? phone.replace(/\D/g, '') : '';
  
  const isPermanentEmail = email && permanentEmails.includes(email);
  const isPermanentPhone = phone && (
    permanentPhones.includes(phone) || 
    permanentPhones.includes(cleanedPhone)
  );
  
  console.log("🔒 DEBUG: Permanent account check results:", {
    isPermanentEmail,
    isPermanentPhone,
    email,
    phone,
    cleanedPhone
  });
  
  return {
    isPermanent: isPermanentEmail || isPermanentPhone,
    reason: isPermanentEmail ? 'email' : isPermanentPhone ? 'phone' : null
  };
};
