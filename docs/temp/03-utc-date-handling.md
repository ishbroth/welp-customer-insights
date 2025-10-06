# UTC Date Handling Plan

## Overview
Centralize all date/time operations to ensure consistent UTC handling, proper timezone conversions, and Daylight Saving Time (DST) safety.

## Current State
- 99 instances of raw Date operations across 54 files
- Inconsistent timezone handling
- No UTC enforcement
- No DST consideration
- Direct use of `new Date()`, `toISOString()`, `toLocaleString()`

## Work to be Done

### 1. Create Date Utilities Module
Create `src/utils/dateUtils.ts` with functions:
- `toUTC(date)` - Convert any date to UTC (DST-safe)
- `fromUTC(utcDate)` - Convert UTC to local timezone (DST-aware)
- `formatDate(date, format)` - Format date consistently
- `formatDateTime(date)` - Format with time
- `formatTime(date)` - Format time only
- `formatRelative(date)` - "2 hours ago", "yesterday", etc.
- `parseDate(dateString)` - Parse string to Date (UTC)
- `isValidDate(date)` - Validate date objects
- `getCurrentUTC()` - Get current time in UTC
- `addDays(date, days)` - Date arithmetic (DST-safe)
- `addHours(date, hours)` - Hour arithmetic (DST-safe)
- `isBefore(date1, date2)` - Date comparison
- `isAfter(date1, date2)` - Date comparison
- `getDSTTransition(date)` - Check if date is during DST transition
- `isDST(date, timezone)` - Check if timezone is in DST

### 2. Leverage date-fns and date-fns-tz Libraries
Already installed, use for DST-safe operations:

**Install date-fns-tz if needed:**
```bash
npm install date-fns-tz
```

**Use for:**
- Date arithmetic operations (automatically handles DST)
- Date formatting with timezone awareness
- Date parsing
- Timezone handling with `date-fns-tz`
- `zonedTimeToUtc()` - Convert timezone-aware date to UTC
- `utcToZonedTime()` - Convert UTC to specific timezone
- `format()` with timezone options

**DST Benefits:**
- Handles "spring forward" (2 AM → 3 AM, skip hour)
- Handles "fall back" (2 AM happens twice)
- No duplicate timestamps
- No missing timestamps
- Correct hour calculations across DST boundaries

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

### 8. Daylight Saving Time (DST) Handling
**Critical scenarios to handle:**

**A. Subscription/Trial Expiration**
- Store expiry as UTC timestamp
- Example: Trial expires "30 days from now"
- DST transition during trial doesn't affect expiry time
- User sees correct local time on expiry day

**B. Scheduled Operations**
- OTP expiry (10 minutes from now)
- Guest access expiry (24 hours from now)
- Never expires "early" or "late" due to DST

**C. Display "Time Ago"**
- "2 hours ago" calculation must account for DST
- If DST happened in between, still shows correct duration
- Use `date-fns` `formatDistanceToNow()` (handles DST automatically)

**D. Date Range Queries**
- "Reviews from last week" must include DST transition
- Database queries use UTC (no DST issues)
- Display converts to user's local time

**E. Recurring Events**
- If we ever add recurring features
- "Every Monday at 9 AM" in user's timezone
- Adjust for DST transitions

**DST Transition Dates (US):**
- Spring Forward: Second Sunday in March (2 AM → 3 AM)
- Fall Back: First Sunday in November (2 AM → 1 AM, repeat hour)

**Implementation:**
```typescript
// Good: UTC storage, DST-safe
const expiresAt = addHours(getCurrentUTC(), 24) // Uses date-fns
database.save({ expires_at: expiresAt.toISOString() })

// Bad: Local time, DST issues
const expiresAt = new Date()
expiresAt.setHours(expiresAt.getHours() + 24) // Breaks during DST
```

### 9. Testing DST Scenarios
Create test cases for:
- Date arithmetic across DST boundaries
- "Spring forward" hour (doesn't exist)
- "Fall back" hour (exists twice)
- Subscription expiring during DST transition
- OTP expiring during DST transition
- Time-based queries spanning DST change

**Test dates to use:**
- March 10, 2024, 1:30 AM (before spring forward)
- March 10, 2024, 2:30 AM (doesn't exist!)
- November 3, 2024, 1:30 AM (ambiguous, happens twice)

### 10. User Timezone Detection
- Detect user's timezone: `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Store in user preferences if needed
- Always convert UTC → User timezone for display
- Never store user's local time directly

## Files to Create
- `src/utils/dateUtils.ts` - Core date utilities (DST-safe)
- `src/utils/dateFormats.ts` - Format constants
- `src/utils/timezoneUtils.ts` - Timezone detection and handling
- `supabase/functions/_shared/dateUtils.ts` - Edge Function version
- `src/__tests__/dateUtils.dst.test.ts` - DST scenario tests

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
- **DST-safe date arithmetic and conversions**
- **No data corruption during DST transitions**
- **Accurate "time ago" calculations year-round**
- **Correct subscription/expiry handling across DST**
- Documentation for date handling standards
- DST test coverage

## DST Safety Checklist
- [ ] All dates stored as UTC ISO strings
- [ ] Using date-fns/date-fns-tz for all arithmetic
- [ ] User timezone detected and used for display only
- [ ] Subscription expiry uses UTC timestamps
- [ ] OTP expiry uses UTC timestamps
- [ ] Guest access expiry uses UTC timestamps
- [ ] "Time ago" uses DST-aware calculations
- [ ] Date range queries use UTC
- [ ] No local time stored in database
- [ ] DST transition tests passing
- [ ] Documentation warns against local time storage
