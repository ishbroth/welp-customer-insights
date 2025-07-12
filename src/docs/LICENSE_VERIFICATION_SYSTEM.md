
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
- **Purpose**: Orchestrates verification across different license types
- **Flow**:
  1. Attempts real verification first (state databases)
  2. Falls back to mock verification if real verification unavailable
  3. Returns verification result with status and details

### 3. Real License Verification
- **File**: `src/utils/realLicenseVerification.ts`
- **Purpose**: Connects to actual state license databases
- **Supported States**: Various (implementation specific)

### 4. Business Registration Integration
- **Hook**: `src/hooks/useBusinessVerification.ts`
- **Purpose**: Manages verification during registration process
- **Features**:
  - Real-time verification during signup
  - Fallback account creation if verification fails
  - State-specific verification handling

### 5. UI Components
- **Form**: `src/components/signup/BusinessInfoForm.tsx`
- **Field Label**: "License Type/EIN"
- **Verification**: Triggered automatically during form submission

## Verification Flow During Registration

1. **User Input**: User selects license type and enters license number
2. **Duplicate Check**: System checks for existing accounts
3. **License Verification**: 
   - Real verification attempted first using state databases
   - Mock verification as fallback
4. **Account Creation**:
   - If verified: Proceed with verified status
   - If not verified: Create account with pending verification status

## Recent Changes

### 2024-12-XX - Field Label Update
- Changed "Business Type" to "License Type/EIN" for clarity
- Updated placeholder text to include EIN reference

### 2024-12-XX - License Type Options Restoration
- Restored original 12-item license type list
- Ensured EIN is first option
- Maintained verification compatibility

## Configuration Files

### License Utilities
- **File**: `src/components/signup/licenseUtils.ts`
- **Purpose**: Provides license-specific labels and guidance
- **Functions**:
  - `getLicenseLabel()`: Returns appropriate label for license type
  - `getGuidanceMessage()`: Provides state-specific guidance

### Edge Functions
- **Verification Request**: `supabase/functions/send-verification-request/index.ts`
- **Business Verification**: `supabase/functions/verify-business/index.ts`

## Database Integration
- **Table**: `business_info`
- **Verification Requests**: `verification_requests`
- **Real-time Updates**: Business info updated immediately upon successful verification

## Future Enhancements
- Add more state database integrations
- Implement additional license type support
- Enhance verification accuracy
- Add verification status tracking

## Troubleshooting
- Check console logs for verification attempts
- Verify state database availability
- Ensure license format matches expected patterns
- Review edge function logs for API errors

---
Last Updated: Current Date
Maintained by: Development Team
