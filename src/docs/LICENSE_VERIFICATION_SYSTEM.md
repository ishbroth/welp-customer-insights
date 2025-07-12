
# License Verification System Documentation

## Overview
This document tracks the implementation and changes to the automatic license verification system used during business registration.

## System Components

### 1. License Type Selection
- **File**: `src/components/signup/businessFormData.ts`
- **Purpose**: Defines available license types that guide verification
- **Current Options**:
  - EIN (Employer Identification Number)
  - Contractors
  - Liquor Licenses (bar)
  - Law/Legal (attorney)
  - Real Estate (realtor)
  - Medical/Dental (medical)
  - Restaurant/Food Service
  - Automotive Services (auto)
  - Insurance
  - Energy
  - Vendors/Sellers (rentals)
  - Retail/Business License
  - Other License Type

### 2. Verification Engine
- **Main File**: `src/utils/verification/index.ts`
- **Purpose**: Orchestrates verification using ONLY real license databases
- **Flow**:
  1. Attempts real verification with state databases
  2. NO MOCK FALLBACK - either succeeds with real verification or fails
  3. Failed verification results in unverified account creation

### 3. Real License Verification
- **File**: `src/utils/realLicenseVerification.ts`
- **Purpose**: Connects to actual state license databases
- **Supported States**: California, Texas, Florida, New York (partial)

### 4. Business Registration Integration
- **Hook**: `src/hooks/useBusinessVerification.ts`
- **Purpose**: Manages verification during registration process
- **Features**:
  - Real-time verification during signup
  - Automatic verified badge if real verification succeeds
  - Unverified account creation if real verification fails
  - Integration with existing manual verification email system

### 5. UI Components
- **Form**: `src/components/signup/BusinessInfoForm.tsx`
- **Field Label**: "License Type/EIN"
- **Verification**: Triggered automatically during form submission

## Verification Flow During Registration

1. **User Input**: User selects license type and enters license number
2. **Duplicate Check**: System checks for existing accounts
3. **Real License Verification ONLY**: 
   - Attempts verification using actual state databases
   - NO mock verification fallback
4. **Account Creation**:
   - If verified: Create account with verified badge
   - If not verified: Create unverified account, user can submit manual verification later

## Recent Changes

### 2024-12-XX - Removed Mock Verification
- Eliminated all mock verification fallback logic
- System now only attempts real license verification
- Failed real verification results in unverified account creation
- Users can use existing manual verification email system for verification

### 2024-12-XX - Field Label Update
- Changed "Business Type" to "License Type/EIN" for clarity
- Updated placeholder text to include EIN reference

### 2024-12-XX - License Type Options Restoration
- Restored original license type list with EIN as first option
- Ensured verification compatibility with real license databases

## Configuration Files

### Edge Functions
- **Verification Request**: `supabase/functions/send-verification-request/index.ts`
- **Business Verification**: `supabase/functions/verify-business/index.ts`

## Database Integration
- **Table**: `business_info`
- **Verification Requests**: `verification_requests`
- **Real-time Updates**: Business info updated immediately upon successful real verification
- **Verified Badge**: Only granted through real license verification or manual approval

## Manual Verification Fallback
- When real verification fails, users receive unverified accounts
- Existing email relay system available for manual verification requests
- Manual verification requires admin approval via email links

## Future Enhancements
- Add more state database integrations
- Implement additional license type support
- Enhance verification accuracy for existing states
- Add verification status tracking dashboard

## Troubleshooting
- Check console logs for real verification attempts
- Verify state database availability
- Ensure license format matches expected patterns for each state
- Review edge function logs for API errors
- No mock verification means failures are expected and handled gracefully

---
Last Updated: Current Date
Maintained by: Development Team
