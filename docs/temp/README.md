# Active Implementation Plans

This directory contains temporary planning documents for ongoing implementation work. Files in this directory should be deleted once their corresponding tasks are complete.

## Active Plans

### Phase 2: Core Utilities (Not Started)

#### 01-theme-style-extraction.md
**Status:** Pending
**Priority:** Medium
**Description:** Extract all theme colors, typography, spacing into centralized configuration
**Prerequisites:** None
**Next Steps:**
- Audit current theme usage
- Consolidate colors in tailwind.config.ts
- Remove dark mode configuration

#### 02-localization-infrastructure.md
**Status:** Pending
**Priority:** Low (should be last per master plan)
**Description:** Implement i18n infrastructure for multi-language support
**Prerequisites:** Most other work should be complete
**Next Steps:**
- Install react-i18next dependencies
- Create translation structure
- Extract hardcoded strings

#### 03-utc-date-handling.md
**Status:** Pending
**Priority:** High
**Description:** Centralize date/time operations, ensure UTC handling, DST safety
**Prerequisites:** None
**Next Steps:**
- Create src/utils/dateUtils.ts
- Implement DST-safe date operations using date-fns
- Replace all raw Date operations across 54 files

#### 04-database-utility-extraction.md
**Status:** Pending
**Priority:** High
**Description:** Create abstraction layer for database operations
**Prerequisites:** 03-utc-date-handling.md (for date operations)
**Next Steps:**
- Create database service layer by domain
- Build reusable query patterns
- Implement type-safe transformers

#### 05-dialog-messaging-consistency.md
**Status:** Pending
**Priority:** Medium
**Description:** Standardize all dialog, modal, alert, and toast patterns
**Prerequisites:** None
**Next Steps:**
- Create standard dialog components
- Build messaging utility
- Replace 29 existing dialog files

#### 06-logging-utility.md
**Status:** Pending
**Priority:** High (required for 14-console-cleanup.md)
**Description:** Create proper logging system with log levels
**Prerequisites:** None
**Next Steps:**
- Create src/utils/logger.ts
- Configure environment-based log levels
- Add ESLint rules (but don't replace console yet)

#### 07-email-encapsulation.md
**Status:** Pending
**Priority:** Medium
**Description:** Centralize email-related functionality
**Prerequisites:** None
**Next Steps:**
- Create shared email utility in Edge Functions
- Build email templates
- Update existing Edge Functions

#### 08-other-encapsulations.md
**Status:** Pending
**Priority:** Medium
**Description:** Consolidate scattered utilities (phone, address, validation, etc.)
**Prerequisites:** None
**Next Steps:**
- Consolidate phone number handling
- Centralize address utilities
- Create validation utilities

### Phase 1: Security (Partially Complete)

#### 10-otp-security-tightening.md
**Status:** Pending
**Priority:** High (Security)
**Description:** Improve OTP security per Supabase advisor recommendations
**Prerequisites:** None
**Next Steps:**
- Access Supabase Dashboard
- Reduce OTP expiry to 10 minutes
- Enable leaked password protection

#### 11-secrets-rotation.md
**Status:** **CRITICAL - ACTIVE ISSUE**
**Priority:** **URGENT**
**Description:** Remove exposed secrets from .env, rotate all compromised keys
**Warning:** .env file contains exposed STRIPE_SECRET_KEY and VITE_SUPABASE_SERVICE_ROLE_KEY
**Next Steps:**
- **IMMEDIATE:** Remove secrets from .env
- Rotate Stripe secret key
- Rotate Resend API key
- Configure Supabase Edge Function secrets
- Update .gitignore

### Phase 6: Cleanup & Polish (Not Started)

#### 12-documentation-alignment.md
**Status:** Pending
**Priority:** Low
**Description:** Reorganize and consolidate project documentation
**Prerequisites:** Most implementation work complete
**Next Steps:**
- Move root documentation files to docs/
- Create organized directory structure
- Update remaining Twilio references (mostly in AI-CODING-GUIDELINES.md)

#### 13-push-notifications-removal.md
**Status:** **Partially Complete**
**Priority:** Medium
**Description:** Remove push notification infrastructure (email only)
**Current State:**
- iOS setup includes push notifications plugin (completed but needs removal)
- Push notification files still exist in codebase
- @capacitor/push-notifications still in package.json
**Next Steps:**
- Remove @capacitor/push-notifications from package.json
- Delete supabase/functions/send-push-notification/
- Delete src/services/mobilePushNotifications.ts
- Delete src/hooks/useMobilePushNotifications.ts
- Delete src/components/mobile/PushNotificationTest.tsx

#### 14-console-cleanup.md
**Status:** Pending
**Priority:** Medium
**Description:** Replace all console.log statements with proper logging
**Prerequisites:** 06-logging-utility.md MUST be complete first
**Next Steps:**
- Wait for logging utility implementation
- Systematically replace 1,399 console statements across 193 files
- Add ESLint enforcement

## Completed Plans

### 09-ios-setup.md
**Status:** ✓ Completed
**Date Completed:** ~October 5, 2025
**Evidence:** ios/App/ directory exists with full Xcode project, CocoaPods installed
**Deleted:** Yes

### 00-MASTER-PLAN.md
**Status:** ✓ Reference document (organizational)
**Purpose:** Provided implementation order and dependencies
**Deleted:** Yes (no longer needed as organizational guide)

## Guidelines

### When to Delete a Temp File
Per AI-CODING-GUIDELINES.md: "DELETE the temp file when task is complete"

A task is complete when:
1. All code/infrastructure described in the plan exists in the codebase
2. The work has been tested and verified
3. No references to the temp file exist from other active work
4. The feature/improvement is fully functional

### Priority Order (Per Master Plan)
1. **Phase 1: Security** - 11-secrets-rotation.md (URGENT), 10-otp-security-tightening.md
2. **Phase 2: Core Utilities** - 06-logging-utility.md, 03-utc-date-handling.md, 04-database-utility-extraction.md
3. **Phase 3: UI Infrastructure** - 05-dialog-messaging-consistency.md, 01-theme-style-extraction.md
4. **Phase 4: Communication** - 07-email-encapsulation.md, 13-push-notifications-removal.md
5. **Phase 5: Other** - 08-other-encapsulations.md
6. **Phase 6: Cleanup** - 14-console-cleanup.md, 12-documentation-alignment.md, 02-localization-infrastructure.md

## Next Recommended Actions

1. **URGENT:** Address 11-secrets-rotation.md immediately (exposed secrets in .env)
2. Implement 06-logging-utility.md (required for console cleanup)
3. Implement 03-utc-date-handling.md (required for database utilities)
4. Complete 13-push-notifications-removal.md (partially started)
5. Work through remaining plans in priority order

---

Last Updated: October 5, 2025
Maintained by: AI coding assistant per docs/AI-CODING-GUIDELINES.md
