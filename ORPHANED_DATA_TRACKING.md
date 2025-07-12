
# Orphaned Data Issue Tracking

## Problem Statement
User cannot register with phone number (619) 734-7668 due to persistent duplicate detection, even after hard deletes. This indicates orphaned profile data remains in the system after auth user deletion.

## Root Causes Identified
1. **Profiles table** - Main source of orphaned data when auth.users are deleted but profiles remain
2. **Business_info table** - Business records may persist after profile deletion  
3. **Review-related tables** - May contain customer phone data that triggers duplicates
4. **Verification tables** - May cache phone numbers from previous attempts
5. **Edge function memory/cache** - Function may be caching results between calls
6. **Permanent/Demo Accounts** - Test accounts may be recreated or protected from deletion

## Solutions Attempted
1. ✅ Hard delete migration (profiles, auth.users, business_info)
2. ✅ Added orphaned profile cleanup to check-duplicates edge function
3. ✅ Enhanced phone duplicate checker with auth user validation
4. ✅ Ultra-comprehensive cleanup of ALL tables containing phone data
5. ✅ Cache clearing mechanism in edge functions
6. ✅ Verification codes and related phone caches cleared
7. 🔄 **NEW**: Targeted orphaned cleanup with permanent account protection

## Current Investigation
- **Specific Record ID**: `52d6d902-8da4-4c83-9a41-0c75cb325402`
- **Phone Number**: (619) 734-7668 / 6197347668 (cleaned)
- **Issue**: This record persists despite cleanup attempts
- **Hypothesis**: May be a permanent/demo account or protected record

## Phone Numbers Being Tested
- (619) 734-7668 / 6197347668 (cleaned) - **PERSISTENT ISSUE**
- Previous: (619) 724-2702 / 6197242702 (cleaned) - Resolved

## Tables That May Contain Phone Data
- profiles (primary source) ✅ Being cleaned with protection
- business_info (may have phone references) ✅ Cleared
- reviews (customer_phone field) ✅ Cleared
- review_claim_history (customer_phone field) ✅ Cleared
- verification_codes (phone field) ✅ Cleared
- verification_requests (phone field) ✅ Cleared
- customer_access (may reference phone indirectly) ✅ Cleared

## Latest Strategy (2025-07-12)
1. **Targeted Cleanup**: Only clean orphaned profiles that match the input data
2. **Permanent Account Protection**: Skip cleanup for known permanent accounts
3. **Immediate Return**: If orphaned matching data is cleaned, immediately allow registration
4. **Better Logging**: More detailed tracking of what's being cleaned and why

## Status
🟡 IN PROGRESS - Implementing targeted cleanup with permanent account protection

## Next Steps If Still Failing
1. Check for database triggers that recreate records
2. Investigate if there are any foreign key constraints preventing deletion
3. Check for any background jobs or functions that restore demo data
4. Manually inspect the specific record ID in the database
