
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const utilLogger = logger.withContext('debugOrphanedData');

/**
 * Debug utility to verify total database cleanup
 */
export const verifyTotalCleanup = async () => {
  utilLogger.debug("DEBUG: Verifying total database cleanup...");
  
  const allTables = [
    'profiles',
    'business_info', 
    'reviews',
    'review_claim_history',
    'verification_codes',
    'verification_requests',
    'customer_access',
    'guest_access',
    'responses',
    'review_photos',
    'review_reports',
    'user_review_notifications',
    'credit_transactions',
    'credits',
    'subscriptions',
    'device_tokens',
    'notification_preferences',
    'notifications_log',
    'user_sessions'
  ] as const;
  
  const results: any = {};
  let totalRecords = 0;
  
  for (const table of allTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    results[table] = {
      count: count || 0,
      error: error?.message
    };
    
    totalRecords += (count || 0);

    utilLogger.debug(`DEBUG: ${table} count: ${count || 0}`, error ? `(Error: ${error.message})` : '');
  }

  utilLogger.debug(`DEBUG: Total records across all tables: ${totalRecords}`);
  utilLogger.debug(`DEBUG: Database is ${totalRecords === 0 ? 'COMPLETELY EMPTY' : 'NOT EMPTY'}`);
  
  return {
    totalRecords,
    isEmpty: totalRecords === 0,
    tableResults: results
  };
};

/**
 * Debug utility to help track ANY orphaned data issues
 */
export const debugAnyOrphanedData = async (searchTerm: string) => {
  utilLogger.debug("DEBUG: Starting comprehensive orphaned data check for:", searchTerm);

  const cleanedTerm = searchTerm.replace(/\D/g, '');
  utilLogger.debug("DEBUG: Cleaned search term:", cleanedTerm);
  
  // Check profiles table for any matching data
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, phone, email, name, type')
    .or(`phone.ilike.%${searchTerm}%,phone.ilike.%${cleanedTerm}%,email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
  
  utilLogger.debug("DEBUG: Profiles check:", { profiles, profilesError });

  // Check verification codes for any phone matches
  const { data: verificationCodes, error: verificationError } = await supabase
    .from('verification_codes')
    .select('id, phone, created_at')
    .or(`phone.ilike.%${searchTerm}%,phone.ilike.%${cleanedTerm}%`);

  utilLogger.debug("DEBUG: Verification codes check:", { verificationCodes, verificationError });

  // Check reviews for any customer data matches
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, customer_phone, customer_name, customer_email')
    .or(`customer_phone.ilike.%${searchTerm}%,customer_phone.ilike.%${cleanedTerm}%,customer_name.ilike.%${searchTerm}%`);

  utilLogger.debug("DEBUG: Reviews check:", { reviews, reviewsError });

  // Check business info for any matches
  const { data: businessInfo, error: businessError } = await supabase
    .from('business_info')
    .select('id, business_name')
    .or(`business_name.ilike.%${searchTerm}%`);

  utilLogger.debug("DEBUG: Business info check:", { businessInfo, businessError });
  
  return {
    searchTerm,
    cleanedTerm,
    profiles: profiles || [],
    verificationCodes: verificationCodes || [],
    reviews: reviews || [],
    businessInfo: businessInfo || [],
    errors: {
      profilesError,
      verificationError,
      reviewsError,
      businessError
    }
  };
};

/**
 * Force clear all data that might contain the search term
 */
export const forceCleanAllData = async (searchTerm: string) => {
  utilLogger.debug("DEBUG: Force cleaning all data containing:", searchTerm);

  const cleanedTerm = searchTerm.replace(/\D/g, '');

  const results = [];

  // Clear verification codes
  const { error: verificationError } = await supabase
    .from('verification_codes')
    .delete()
    .or(`phone.ilike.%${searchTerm}%,phone.ilike.%${cleanedTerm}%`);

  results.push({ table: 'verification_codes', error: verificationError });

  // Note: We can't delete from other tables due to RLS, but the edge function should handle this

  utilLogger.debug("DEBUG: Force clean results:", results);
  
  return results;
};

/**
 * Get total database counts for verification
 */
export const getDatabaseCounts = async () => {
  utilLogger.debug("DEBUG: Getting comprehensive database counts...");
  
  const counts: any = {};
  let total = 0;
  
  const tables = [
    'profiles', 
    'business_info', 
    'reviews', 
    'verification_codes',
    'verification_requests', 
    'customer_access', 
    'guest_access',
    'responses', 
    'review_photos', 
    'review_reports', 
    'credits'
  ] as const;
  
  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    counts[table] = count || 0;
    total += (count || 0);
  }

  utilLogger.debug("DEBUG: Comprehensive database counts:", counts);
  utilLogger.debug("DEBUG: Total records:", total);
  
  return {
    ...counts,
    total,
    isEmpty: total === 0
  };
};
