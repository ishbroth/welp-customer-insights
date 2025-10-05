# Other Encapsulations Plan

## Overview
Identify and encapsulate other scattered functionality that should be centralized.

## Areas to Encapsulate

### 1. Phone Number Handling
**Current State**: `phoneFormatter.ts` and `phoneUtils.ts` both exist

**Work**:
- Consolidate into single `src/utils/phone.ts`
- Functions needed:
  - `formatPhoneNumber(phone)` - Display format
  - `normalizePhoneNumber(phone)` - Database format
  - `validatePhoneNumber(phone)` - Validation
  - `parsePhoneNumber(phone)` - Parse into parts
  - `formatInternational(phone)` - E.164 format
- Replace all inline phone formatting
- Update all components using phone numbers

### 2. Address Handling
**Current State**: Multiple address-related utilities

**Work**:
- Consolidate address utilities:
  - `addressNormalization.ts`
  - `addressExtraction.ts`
  - `addressAutocompleteUI.ts`
- Create `src/utils/address/index.ts`:
  - `normalizeAddress(address)`
  - `parseAddress(text)`
  - `formatAddress(address)`
  - `validateAddress(address)`
  - `compareAddresses(addr1, addr2)`

### 3. Form Validation
**Current State**: Validation scattered in components

**Work**:
- Create `src/utils/validation/index.ts`
- Common validators:
  - `required(value, message)`
  - `email(value, message)`
  - `phone(value, message)`
  - `minLength(value, min, message)`
  - `maxLength(value, max, message)`
  - `pattern(value, regex, message)`
  - `custom(value, validator, message)`
- Use with react-hook-form and zod

### 4. Currency/Money Handling
**Current State**: Direct number operations for money

**Work**:
- Create `src/utils/currency.ts`
- Functions:
  - `formatCurrency(amount)` - "$10.00"
  - `parseCurrency(text)` - "10.00" → 1000 cents
  - `toCents(dollars)` - Convert to cents
  - `fromCents(cents)` - Convert to dollars
  - `calculateTotal(items)`
  - `calculateTax(amount, rate)`

### 5. String Utilities
**Current State**: `stringSimilarity.ts`, `nameFormatter.ts`

**Work**:
- Create `src/utils/string/index.ts`
- Consolidate:
  - `similarity(str1, str2)` - From stringSimilarity
  - `formatName(name)` - From nameFormatter
  - `truncate(text, length)`
  - `capitalize(text)`
  - `slugify(text)`
  - `sanitize(text)` - Remove special chars
  - `generateId()` - Random string generation

### 6. File Upload Handling
**Current State**: Upload logic in components

**Work**:
- Create `src/utils/upload.ts`
- Functions:
  - `validateFile(file, options)` - Size, type checking
  - `uploadToStorage(file, path)` - Supabase Storage
  - `compressImage(file, quality)` - Image compression
  - `generateThumbnail(file)` - Thumbnail creation
  - `getFileUrl(path)` - Get public URL
- Handle upload progress
- Handle upload errors

### 7. URL/Route Handling
**Current State**: Hardcoded routes in components

**Work**:
- Create `src/utils/routes.ts`
- Define all routes as constants:
  - `ROUTES.HOME`
  - `ROUTES.LOGIN`
  - `ROUTES.PROFILE`
  - `ROUTES.BUSINESS_PROFILE(id)`
  - `ROUTES.REVIEW(id)`
- Helper functions:
  - `buildRoute(template, params)`
  - `parseRoute(url)`
  - `getQueryParams()`

### 8. Storage Utilities
**Current State**: localStorage usage scattered

**Work**:
- Create `src/utils/storage.ts`
- Wrapper for localStorage/sessionStorage:
  - `setItem(key, value)` - JSON serialization
  - `getItem(key)` - JSON parsing
  - `removeItem(key)`
  - `clear()`
  - Type-safe storage keys
  - Encryption option for sensitive data

### 9. Analytics/Tracking
**Current State**: No centralized tracking

**Work**:
- Create `src/utils/analytics.ts`
- Track events:
  - `trackPageView(page)`
  - `trackEvent(event, properties)`
  - `trackError(error)`
  - `identifyUser(userId)`
- Prepare for Google Analytics/Mixpanel/etc.

### 10. Clipboard Operations
**Current State**: Direct navigator.clipboard usage

**Work**:
- Create `src/utils/clipboard.ts`
- Functions:
  - `copyToClipboard(text)`
  - `pasteFromClipboard()`
  - `useCopyToClipboard()` - Hook version
- Handle permissions
- Show success feedback

## Files to Create
- `src/utils/phone.ts`
- `src/utils/address/index.ts`
- `src/utils/validation/index.ts`
- `src/utils/currency.ts`
- `src/utils/string/index.ts`
- `src/utils/upload.ts`
- `src/utils/routes.ts`
- `src/utils/storage.ts`
- `src/utils/analytics.ts`
- `src/utils/clipboard.ts`

## Files to Update
- Replace direct usage with utility functions across all components
- Update imports
- Remove duplicate utility files

## Deliverables
- Centralized utility functions
- Consistent behavior across app
- Easier to maintain
- Better code reuse
- Reduced duplication
