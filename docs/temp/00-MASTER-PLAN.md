# Master Implementation Plan

## Overview
This document outlines the recommended order for implementing all improvement plans to minimize rework and maximize efficiency.

## Database Security Review - COMPLETED ✓
All 28 public tables have RLS (Row Level Security) enabled. Database security is properly configured.

## Implementation Order

The work is organized into phases that build upon each other logically.

---

## Phase 1: Foundation & Security
**Goal**: Establish secure foundation and remove immediate security risks

### 1.1 Secrets Rotation (Plan 11)
**Why first**: Security risk - exposed keys must be addressed immediately
- Rotate all exposed API keys
- Move secrets to proper locations
- Clean up .env file
- Configure Supabase Edge Function secrets

### 1.2 OTP Security Tightening (Plan 10)
**Why second**: Security hardening while in Supabase Dashboard
- Reduce OTP expiry times
- Enable leaked password protection
- Implement rate limiting
- Simple Supabase config changes

---

## Phase 2: Core Utilities
**Goal**: Build reusable utility infrastructure that other work depends on

### 2.1 Logging Utility (Plan 06)
**Why first in utilities**: Required by almost everything else
- Create logger utility
- Set up environment-based levels
- Add ESLint rules
- Do NOT replace console.log yet (that's Phase 6)

### 2.2 UTC Date Handling (Plan 03)
**Why second**: Many features depend on date operations
- Create dateUtils module
- Standardize UTC handling
- Set up date formatting

### 2.3 Database Utility Extraction (Plan 04)
**Why third**: Provides clean abstraction for all database operations
- Create database service layer
- Build query builders
- Type-safe operations
- Error handling

---

## Phase 3: User-Facing Infrastructure
**Goal**: Establish consistent patterns for UI and communication

### 3.1 Dialog/Messaging Consistency (Plan 05)
**Why first**: Affects many components
- Create standard dialog components
- Build messaging utility
- Standardize toast patterns

### 3.2 Theme and Style Extraction (Plan 01)
**Why second**: Makes UI changes easier
- Consolidate theme configuration
- Standardize colors and typography
- Complete dark mode setup

---

## Phase 4: Communication Systems
**Goal**: Complete email and notification infrastructure

### 4.1 Email Encapsulation (Plan 07)
**Why first**: Simpler than push notifications
- Centralize email utilities
- Create email templates
- Update Edge Functions

### 4.2 Push Notifications Completion (Plan 13)
**Why second**: Depends on email patterns
- Set up FCM and APNs
- Rewrite Edge Function
- Implement client handlers
- Test on devices

---

## Phase 5: Other Encapsulations & Mobile
**Goal**: Complete remaining abstractions and mobile setup

### 5.1 Other Encapsulations (Plan 08)
**Why first**: Consolidate scattered utilities
- Phone number handling
- Address handling
- Form validation
- Currency/money handling
- String utilities
- File upload handling
- URL/route handling
- Storage utilities
- Analytics tracking
- Clipboard operations

### 5.2 iOS Setup (Plan 09)
**Why second**: Depends on utilities being stable
- Initialize iOS project
- Configure Xcode
- Set up certificates
- Prepare for App Store

---

## Phase 6: Cleanup & Polish
**Goal**: Clean up codebase and improve developer experience

### 6.1 Console.log Cleanup (Plan 14)
**Why first**: Depends on logging utility from Phase 2
- Systematic replacement of console statements
- Add ESLint enforcement
- Verify in production mode

### 6.2 Documentation Alignment (Plan 12)
**Why second**: Can be done while code stabilizes
- Reorganize documentation
- Update Twilio → Resend references
- Create proper structure
- Write onboarding guide

### 6.3 Localization Infrastructure (Plan 02)
**Why last**: Easiest to do when codebase is stable
- Install i18n dependencies
- Create translation structure
- Extract strings
- Implement translation hooks

---

## Implementation Timeline

### Immediate (This Week)
- Phase 1: Foundation & Security (Plans 11, 10)

### Week 2-3
- Phase 2: Core Utilities (Plans 06, 03, 04)

### Week 4-5
- Phase 3: User-Facing Infrastructure (Plans 05, 01)

### Week 6-7
- Phase 4: Communication Systems (Plans 07, 13)

### Week 8-9
- Phase 5: Other Encapsulations & Mobile (Plans 08, 09)

### Week 10-12
- Phase 6: Cleanup & Polish (Plans 14, 12, 02)

---

## Dependencies Map

```
Plan 11 (Secrets) ─→ Plan 10 (OTP Security)
                 ─→ Plan 07 (Email)
                 ─→ Plan 13 (Push Notifications)

Plan 06 (Logging) ─→ Plan 14 (Console Cleanup)
                  ─→ All other plans (should use logging)

Plan 03 (Dates) ─→ Plan 04 (Database)
                ─→ Plan 07 (Email)
                ─→ Most features

Plan 04 (Database) ─→ Plan 05 (Dialogs)
                   ─→ Plan 08 (Encapsulations)

Plan 05 (Dialogs) ─→ Plan 01 (Theme)

Plan 07 (Email) ─→ Plan 13 (Push Notifications)

Plan 08 (Encapsulations) ─→ Plan 09 (iOS)

Plan 06 (Logging) ─→ Plan 14 (Console Cleanup)

Plan 14 (Console) ─→ Plan 12 (Docs)

Plan 12 (Docs) ─→ Plan 02 (i18n)
```

---

## Parallel Work Opportunities

Can be worked on simultaneously by different people:

**Week 1**:
- Person A: Plan 11 (Secrets)
- Person B: Plan 10 (OTP Security)

**Week 2-3**:
- Person A: Plan 06 (Logging)
- Person B: Plan 03 (Dates)

**Week 4**:
- Person A: Plan 04 (Database)
- Person B: Plan 05 (Dialogs)

**Week 5**:
- Person A: Plan 01 (Theme)
- Person B: Continue Plan 05

**Week 6**:
- Person A: Plan 07 (Email)
- Person B: Plan 08 (Encapsulations)

**Week 7**:
- Person A: Plan 13 (Push Notifications)
- Person B: Plan 09 (iOS Setup)

**Week 8-9**:
- Person A: Plan 14 (Console Cleanup)
- Person B: Plan 12 (Docs)

**Week 10**:
- Person A: Plan 02 (i18n)
- Person B: Testing & QA

---

## Success Criteria

After completing all phases:

- ✓ All secrets secured and rotated
- ✓ OTP security hardened
- ✓ Centralized logging system
- ✓ Consistent UTC date handling
- ✓ Clean database abstraction
- ✓ Standard dialog patterns
- ✓ Organized theme system
- ✓ Centralized email handling
- ✓ Working push notifications
- ✓ All utilities consolidated
- ✓ iOS project ready
- ✓ Zero console.log statements
- ✓ Organized documentation
- ✓ i18n infrastructure ready

---

## Notes

- Each plan in `docs/temp/` contains detailed implementation steps
- Plans are numbered for reference, not strict ordering
- This master plan provides optimal ordering to minimize rework
- Adjust timeline based on team size and availability
- Some plans can be parallelized as shown above
- Test thoroughly after each phase before moving to next
- Keep documentation updated as you complete each plan
