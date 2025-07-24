
# Duplicate Account Prevention Reference

## Overview
System to prevent duplicate accounts by checking email/phone uniqueness.

## Core Components
- **useDuplicateChecker**: Main duplicate checking hook
- **useCustomerSignupActions**: Customer signup with duplicate check
- **DuplicateAccountDialog**: User notification dialog
- **check-duplicates**: Edge function for validation

## Duplicate Checking Logic
```typescript
const checkDuplicatesViaEdgeFunction = async (
  email: string,
  phone: string,
  businessName?: string,
  address?: string,
  accountType: 'business' | 'customer'
): Promise<DuplicateCheckResult>
```

## Common Issues & Solutions

### Issue 1: False Positive Duplicates
**Symptoms**: Unique accounts flagged as duplicates
**Cause**: Case sensitivity or format differences
**Solution**: Normalize email/phone before comparison

### Issue 2: Duplicate Check Bypassed
**Symptoms**: Duplicate accounts created
**Cause**: Edge function not called or failed
**Solution**: Ensure duplicate check runs before account creation

### Issue 3: Slow Duplicate Checking
**Symptoms**: Long delay during signup
**Cause**: Database queries not optimized
**Solution**: Add indexes, optimize queries

## Testing Checklist
- [ ] Duplicate emails detected
- [ ] Duplicate phones detected within account type
- [ ] Dialog shows appropriate options
- [ ] Sign-in redirect works
- [ ] Different info allows continuation
- [ ] Performance acceptable (< 2 seconds)
