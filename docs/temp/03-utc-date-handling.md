# UTC Date Handling Plan

## Overview
Centralize all date/time operations to ensure consistent UTC handling and proper timezone conversions.

## Current State
- 99 instances of raw Date operations across 54 files
- Inconsistent timezone handling
- No UTC enforcement
- Direct use of `new Date()`, `toISOString()`, `toLocaleString()`

## Work to be Done

### 1. Create Date Utilities Module
Create `src/utils/dateUtils.ts` with functions:
- `toUTC(date)` - Convert any date to UTC
- `fromUTC(utcDate)` - Convert UTC to local timezone
- `formatDate(date, format)` - Format date consistently
- `formatDateTime(date)` - Format with time
- `formatTime(date)` - Format time only
- `formatRelative(date)` - "2 hours ago", "yesterday", etc.
- `parseDate(dateString)` - Parse string to Date
- `isValidDate(date)` - Validate date objects
- `getCurrentUTC()` - Get current time in UTC
- `addDays(date, days)` - Date arithmetic
- `isBefore(date1, date2)` - Date comparison
- `isAfter(date1, date2)` - Date comparison

### 2. Leverage date-fns Library
Already installed, use for:
- Date arithmetic operations
- Date formatting
- Date parsing
- Timezone handling with `date-fns-tz`

### 3. Database Operations
Ensure all dates stored/retrieved as UTC:
- Review all Supabase queries using dates
- Use `.toISOString()` before sending to database
- Parse as UTC when retrieving
- Update all timestamp columns handling

### 4. Display Formatting
- Format all displayed dates in user's local timezone
- Show timezone indicator where appropriate
- Use consistent format patterns across app

### 5. Form Inputs
- Date pickers should handle UTC conversion
- Store selections as UTC
- Display in local timezone

### 6. Replace Direct Date Usage
Search and replace patterns:
- `new Date()` → `dateUtils.getCurrentUTC()`
- `date.toISOString()` → `dateUtils.formatForDatabase(date)`
- `date.toLocaleString()` → `dateUtils.formatDateTime(date)`
- Manual date parsing → `dateUtils.parseDate()`

### 7. Edge Functions
- Ensure Edge Functions use UTC
- Add date utilities to Edge Function shared code
- Consistent date handling in notifications

## Files to Create
- `src/utils/dateUtils.ts` - Core date utilities
- `src/utils/dateFormats.ts` - Format constants
- `supabase/functions/_shared/dateUtils.ts` - Edge Function version

## Files to Update
All 54 files currently using Date operations:
- Services (photoUploadService, reviewSubmissionService, etc.)
- Pages (Profile, BusinessProfile, etc.)
- Hooks (useCustomerSearch, useGuestAccess, etc.)
- Components (ConversationThread, ReviewCard, etc.)

## Deliverables
- Centralized date utility module
- All dates stored as UTC in database
- Consistent date display across app
- Proper timezone handling
- Documentation for date handling standards
