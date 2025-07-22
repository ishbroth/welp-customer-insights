
# Phone Verification System - Reference Documentation

This document provides a complete reference for the phone verification system that was implemented in Welp. This code has been preserved for future use if phone verification needs to be re-implemented.

## Overview
The phone verification system used SMS messages sent via AWS SNS to verify user phone numbers during registration for both customer and business accounts.

## Key Components

### 1. Edge Functions
- **File:** `supabase/functions/verify-phone/index.ts` (347 lines)
- **Purpose:** Handles both sending SMS codes and verifying submitted codes
- **Actions:** 
  - `send`: Generates 6-digit code, stores in DB, sends SMS via AWS SNS
  - `verify`: Validates submitted code against database

### 2. Database Table
- **Table:** `verification_codes`
- **Columns:** phone, code, expires_at (10 min expiry), verification_type
- **RLS:** Complete lockdown - only edge functions can access

### 3. React Components
- **VerificationCodeInput** (`src/components/verification/VerificationCodeInput.tsx`)
- **VerifyCodeButton** (`src/components/verification/VerifyCodeButton.tsx`)
- **ResendCodeButton** (`src/components/verification/ResendCodeButton.tsx`)
- **VerifyPhone page** (`src/pages/VerifyPhone.tsx`)

### 4. Custom Hooks
- **usePhoneVerification** (`src/hooks/usePhoneVerification.ts`)
- **Features:** Code validation, resend logic, account creation handling

### 5. Utility Functions
- **phoneFormatter.ts** (`src/utils/phoneFormatter.ts`)
- **sendVerificationCode** (`src/lib/utils.ts`)

## AWS SNS Configuration
Required environment variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY` 
- `AWS_REGION`
- `AWS_SNS_ORIGINATION_NUMBER`

## Registration Flow
1. User enters phone number in registration form
2. System sends SMS verification code via AWS SNS
3. User redirected to verification page
4. User enters 6-digit code
5. System validates code and creates account
6. User redirected to dashboard

## Key Features
- 6-digit numeric codes
- 10-minute expiration
- Resend functionality with 60-second cooldown
- Support for both customer and business account types
- E.164 phone number formatting
- Comprehensive error handling and logging

## Integration Points
The phone verification system was integrated into:
- Customer signup flow (`CustomerSignupForm.tsx`)
- Business signup flow (`BusinessSignupForm.tsx`)
- Phone validation in forms (`PhoneInput` component)

This system was fully functional but put on hold due to AWS SNS production access delays.
