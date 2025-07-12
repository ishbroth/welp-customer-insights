
# Orphaned Data Issue Tracking

## Problem Statement
User cannot register with phone number (619) 724-2702 due to persistent duplicate detection, even after hard deletes. This indicates orphaned profile data remains in the system after auth user deletion.

## Root Causes Identified
1. **Profiles table** - Main source of orphaned data when auth.users are deleted but profiles remain
2. **Business_info table** - Business records may persist after profile deletion
3. **Review-related tables** - May contain customer phone data that triggers duplicates
4. **Verification tables** - May cache phone numbers from previous attempts
5. **Edge function memory/cache** - Function may be caching results between calls

## Solutions Attempted
1. ✅ Hard delete migration (profiles, auth.users, business_info)
2. ✅ Added orphaned profile cleanup to check-duplicates edge function
3. ✅ Enhanced phone duplicate checker with auth user validation
4. ❌ **MISSING**: Comprehensive cleanup of ALL tables containing phone data
5. ❌ **MISSING**: Cache clearing mechanism in edge functions
6. ❌ **MISSING**: Verification codes and related phone caches

## Next Steps
1. Create ultra-comprehensive hard delete that clears ALL phone data
2. Add cache clearing to edge functions
3. Clear verification codes and related caches
4. Add systematic logging to track exactly where duplicates are coming from

## Phone Number Being Tested
(619) 724-2702 / 6197242702 (cleaned)

## Tables That May Contain Phone Data
- profiles (primary source)
- business_info (may have phone references)
- reviews (customer_phone field)
- review_claim_history (customer_phone field)
- verification_codes (phone field)
- verification_requests (phone field)
- customer_access (may reference phone indirectly)

## Status
🔴 UNRESOLVED - Phone duplicate still detected after multiple cleanup attempts
