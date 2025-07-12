
# Orphaned Data Issue Tracking

## Problem Statement
User cannot register with phone number (619) 734-7668 due to persistent duplicate detection, even after hard deletes. This indicates orphaned profile data remains in the system after auth user deletion.

## SOLUTION: COMPLETE DATABASE WIPE
**STATUS: IN PROGRESS - 2025-07-12**

User has requested to start with a completely clean slate with NO permanent accounts whatsoever. 

## Root Causes Identified
1. **Orphaned Profile Data** - Profile record `52d6d902-8da4-4c83-9a41-0c75cb325402` with phone `(619) 734-7668` persists
2. **Incomplete Cleanup** - Previous attempts protected "permanent" accounts, but user wants NO accounts
3. **Cross-Table References** - Phone data may exist across multiple related tables

## Current Strategy (2025-07-12)
1. **COMPLETE DATABASE WIPE**: Delete ALL profiles, ALL auth users, ALL related data
2. **NO PERMANENT ACCOUNT PROTECTION**: Remove all safeguards that were protecting demo accounts
3. **Comprehensive Table Clearing**: Clear every table that could contain phone references
4. **Final Verification**: Ensure database is completely empty before allowing registration

## Expected Outcome
- Database should be completely empty (0 profiles, 0 auth users)
- Phone number (619) 734-7668 should be available for registration
- NO duplicate detection should occur for any phone number or email

## Phone Numbers Being Tested
- (619) 734-7668 / 6197347668 (cleaned) - **TARGET FOR CLEANUP**

## Tables Being Cleared
- profiles (primary source) ✅ WILL BE COMPLETELY CLEARED
- business_info ✅ WILL BE COMPLETELY CLEARED
- reviews ✅ WILL BE COMPLETELY CLEARED
- review_claim_history ✅ WILL BE COMPLETELY CLEARED
- verification_codes ✅ WILL BE COMPLETELY CLEARED
- verification_requests ✅ WILL BE COMPLETELY CLEARED
- customer_access ✅ WILL BE COMPLETELY CLEARED
- All other related tables ✅ WILL BE COMPLETELY CLEARED

## Status
🟡 IN PROGRESS - Implementing complete database wipe with no permanent account protection

## Next Steps
1. User should try registration with phone (619) 734-7668
2. Edge function should perform complete wipe and return "no duplicates"
3. Registration should proceed successfully
4. If still failing, investigate database triggers or constraints that might be preventing deletion
