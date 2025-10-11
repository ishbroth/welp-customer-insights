# AI Coding Guidelines

**The Constitution for AI Work on Welp Customer Insights**

Welcome! These guidelines help you succeed in contributing to this project. They're designed to maintain code quality, prevent documentation bloat, and ensure consistency across all AI-generated work. Follow these principles and you'll create excellent, maintainable contributions every time.

---

## Table of Contents

1. [Forbidden Behaviors](#forbidden-behaviors)
2. [Required Behaviors](#required-behaviors)
3. [Documentation Update Rules](#documentation-update-rules)
4. [Reading Order for New Sessions](#reading-order-for-new-sessions)
5. [Code Quality Standards](#code-quality-standards)
6. [Git & Version Control](#git--version-control)
7. [Technology Stack Rules](#technology-stack-rules)
8. [Task Planning & Execution](#task-planning--execution)

---

## Forbidden Behaviors

These behaviors create technical debt, bloat the codebase, or undermine project standards. Never do these:

### ❌ NEVER Use Severity or Priority Labels

**Why:** Priority is a human decision, not an AI decision. Labels create false urgency and clutter documentation.

**Never do this:**
- ❌ "CRITICAL: Fix authentication bug"
- ❌ "HIGH PRIORITY: Update database schema"
- ❌ "URGENT: Refactor review system"
- ❌ "MEDIUM: Add validation"
- ❌ "LOW: Update documentation"
- ❌ "P0/P1/P2/P3" labels
- ❌ Deadline creation ("Must be done by...")
- ❌ Timeline estimates ("This will take 2 days")

**Do this instead:**
- ✅ "Fix authentication bug"
- ✅ "Update database schema"
- ✅ "Refactor review system"

All work is simply work to perform. Humans assign priority, not AI.

---

### ❌ NEVER Finish Tasks Prematurely

**Why:** Incomplete work creates bugs, breaks features, and wastes time when someone has to re-do it properly.

**Never do this:**
- ❌ Marking a task complete when tests fail
- ❌ Skipping validation steps "to save time"
- ❌ Assuming "good enough" on partial implementations
- ❌ Moving to the next task before current one is fully done
- ❌ Saying "mostly complete" or "should work"

**Do this instead:**
- ✅ Complete all validation steps before marking done
- ✅ Verify functionality actually works
- ✅ Run all relevant tests if they exist
- ✅ Check edge cases and error handling
- ✅ Update documentation to reflect changes

**Quality over speed. Always.**

---

### ❌ NEVER Create Unit Tests

**Why:** Testing strategy is managed separately. AI-generated tests often miss critical paths and create false confidence.

**Never do this:**
- ❌ Creating `.test.ts` or `.spec.ts` files
- ❌ Writing test suites
- ❌ Setting up test infrastructure
- ❌ Adding Jest/Vitest test cases

**Testing is outside AI scope for this project.**

---

### ❌ NEVER Add Legacy Comments

**Why:** Documentation should describe the current state, not the historical journey. Version control handles history.

**Never do this:**
```typescript
// Previously we used Twilio for SMS but switched to AWS SNS
// This used to be a class component but we refactored to hooks
// Old implementation stored this in localStorage
// Legacy code from v1.0 - keeping for reference
```

**Do this instead:**
```typescript
// Send verification code via AWS SNS
// Store user preferences in Supabase profiles table
```

**Document what IS, not what WAS. Git preserves history.**

---

### ❌ NEVER Reference Twilio

**Why:** This project does not use Twilio. It never should.

**Immediate action required:**
- ❌ Any Twilio imports, functions, or API calls
- ❌ Twilio documentation references
- ❌ Twilio environment variables
- ❌ Comments mentioning Twilio
- ❌ "We could use Twilio..." suggestions

**What we actually use:**
- ✅ **Email**: Resend API (via Edge Functions)
- ✅ **SMS/OTP**: AWS SNS (if needed, but verify first)
- ✅ **Phone verification**: Check existing implementation before suggesting changes

**If you see Twilio references, DELETE them immediately and update documentation.**

---

### ❌ NEVER Create Pointless Documentation

**Why:** Documentation bloat makes it harder to find useful information. Every doc must serve a clear, unique purpose.

**Never do this:**
- ❌ "Summary of [existing doc].md"
- ❌ "Overview of Features.md" when we have README.md
- ❌ Duplicate documentation in multiple places
- ❌ Meta-documentation about documentation
- ❌ "Quick Start" guides that duplicate existing guides
- ❌ Generic placeholder docs ("Coming soon...")

**Do this instead:**
- ✅ Update existing documentation rather than creating new files
- ✅ Consolidate related information into single files
- ✅ Delete redundant documentation
- ✅ Ask "What unique value does this doc provide?"

**Every documentation file must justify its existence.**

---

## Required Behaviors

These behaviors ensure quality, accuracy, and consistency. Always do these:

### ✅ ALWAYS Verify with MCP Before Documenting

**Why:** Documentation must reflect actual implementation, not assumptions or outdated information.

**Before documenting, verify with MCP tools:**

**Database schema?**
```
mcp__supabase__list_tables
mcp__supabase__execute_sql (to check specific table structure)
```

**Edge Functions?**
```
mcp__supabase__list_edge_functions
mcp__supabase__get_edge_function
```

**Project details?**
```
mcp__supabase__get_project
```

**Security advisories?**
```
mcp__supabase__get_advisors (check after schema changes!)
```

**Never document from memory, assumptions, or "I think it works like..."**

**Accuracy requirement: 100%. No exceptions.**

---

### ✅ ALWAYS Update Documentation After Changes

**Why:** Outdated documentation is worse than no documentation. Keep docs in sync with code.

**When you change code, update docs immediately:**

**Changed database schema?**
- Update relevant docs mentioning affected tables
- Update ERD diagrams if relationships changed
- Run `mcp__supabase__get_advisors` to check for security issues

**Changed Edge Function?**
- Update function documentation with new behavior
- Update API reference if function signature changed
- Verify function list is current

**Changed user-facing feature?**
- Update feature documentation
- Update user flow diagrams if flow changed
- Update README.md if it's a major feature

**Changed environment variables?**
- Update `.env.example`
- Update setup/deployment docs mentioning the variable

**Use this validation checklist before finishing:**
1. Did I check what documentation exists for this code?
2. Did I update all relevant documentation?
3. Did I verify my changes with MCP tools?
4. Did I remove any obsolete documentation?
5. Did I check for Twilio references to delete?

---

### ✅ ALWAYS Use `docs/temp/` for Task Planning

**Why:** Planning documents help organize complex tasks but shouldn't clutter permanent documentation.

**When starting a multi-step task:**
1. Create `docs/temp/task-[description].md` with your plan
2. List all steps, dependencies, and validation criteria
3. Update the plan as you work
4. **DELETE the temp file when task is complete**

**Never leave orphaned planning files.**

**Temp directory structure:**
```
docs/temp/
├── task-review-system-refactor.md    ← Active task planning
├── task-auth-migration.md            ← Active task planning
└── (deleted after completion)
```

**Permanent docs go in `docs/`, temporary planning goes in `docs/temp/`.**

---

### ✅ ALWAYS Keep Context Efficient

**Why:** Loading unnecessary documentation wastes tokens and slows you down.

**Smart context loading:**

**Starting a new task?**
1. Read `docs/README.md` (orientation)
2. Read `docs/AI-CODING-GUIDELINES.md` (this file)
3. Read only task-specific docs (see Reading Order section below)

**Working on authentication?**
- ✅ Read `docs/authentication.md`
- ✅ Check `profiles` and `auth` related tables via MCP
- ❌ Don't load all 28+ database tables
- ❌ Don't load review system docs
- ❌ Don't load payment system docs

**Working on reviews?**
- ✅ Read `docs/review-management.md`
- ✅ Check `reviews`, `review_claims`, `review_access` tables
- ❌ Don't load authentication flow docs
- ❌ Don't load all documentation files

**Need a quick reference?**
- ✅ Read `docs/USER_ACTIONS_REFERENCE.md` for feature overview
- ✅ Use `docs/CODEBASE_STRUCTURE.md` to find file locations

**Load what you need, when you need it. Nothing more.**

---

### ✅ ALWAYS Use Real Code Pointers

**Why:** Vague references like "somewhere in the auth system" are useless. Be specific.

**Never do this:**
- ❌ "The function in the authentication file"
- ❌ "Somewhere in the components folder"
- ❌ "The hook that handles reviews"
- ❌ "Update the relevant database tables"

**Do this instead:**
- ✅ `src/pages/Login.tsx`
- ✅ `src/components/auth/LoginForm.tsx:45-67`
- ✅ `useAuth()` hook in `src/hooks/useAuth.ts`
- ✅ `profiles` table, `email` column
- ✅ `handleSubmit()` function at line 123

**Exact file paths. Exact function names. Line numbers when helpful.**

---

### ✅ ALWAYS Use MCP for Database Operations

**Why:** Direct database access ensures accuracy and prevents errors from manual SQL mistakes.

**For database changes, use MCP tools:**

**Create/modify schema:**
```
mcp__supabase__apply_migration
```

**Run queries:**
```
mcp__supabase__execute_sql
```

**Check for security issues:**
```
mcp__supabase__get_advisors
```

**List all tables:**
```
mcp__supabase__list_tables
```

**Never write SQL without testing it through MCP first.**

---

## Documentation Update Rules

When you change code, update these docs accordingly:

### Database Schema Changes

**What changed:** Table structure, columns, relationships, constraints

**Update these docs:**
- Relevant documentation mentioning affected tables
- Database schema references
- ERD diagrams if relationships changed

**Validation:**
- Run `mcp__supabase__list_tables` to verify schema
- Run `mcp__supabase__get_advisors` for security checks
- Verify RLS policies if applicable

---

### Edge Function Changes

**What changed:** Function code, inputs, outputs, behavior

**Update these docs:**
- `docs/edge-functions.md` (if it exists)
- Any docs referencing the function
- API references if function signature changed

**Validation:**
- Run `mcp__supabase__list_edge_functions` to verify deployment
- Run `mcp__supabase__get_edge_function` to check code
- Test function with real calls if possible

---

### Feature/Flow Changes

**What changed:** User-facing features, workflows, UI behavior

**Update these docs:**
- Feature-specific documentation
- User flow documentation
- `docs/README.md` if major feature
- Screenshots if UI changed significantly

**Validation:**
- Verify feature works end-to-end
- Check all mentioned file paths still exist
- Test error handling and edge cases

---

### Environment Variable Changes

**What changed:** New variables, renamed variables, removed variables

**Update these docs:**
- `.env.example` (ALWAYS update this)
- Setup documentation mentioning variables
- Deployment documentation

**Validation:**
- Never commit actual `.env` file
- Never commit secrets to any file
- Document public variables only

---

## Reading Order for New Sessions

Every new AI session should follow this reading order:

### Step 1: Orientation (ALWAYS READ)
1. **`docs/README.md`** - Project overview, documentation index
2. **`docs/AI-CODING-GUIDELINES.md`** - This file (mandatory)
3. **`docs/CODEBASE_STRUCTURE.md`** - Code organization and architecture

### Step 2: Task-Specific Context (READ ONLY WHAT'S NEEDED)

**Working on Authentication?**
- `docs/authentication.md`
- `docs/registration-flow.md`
- Use MCP: `mcp__supabase__list_tables` (filter for auth-related tables)

**Working on Reviews?**
- `docs/review-management.md`
- Use MCP: Check `reviews`, `review_claims`, `review_access` tables

**Working on Billing/Payments?**
- `docs/credit-system.md`
- `docs/subscription-system.md`
- Use MCP: Check `credits`, `subscriptions` tables

**Working on Verification?**
- `docs/license-verification.md`
- `docs/verification-badges.md`
- Use MCP: Check `business_info`, `license_verifications` tables

**Working on Notifications?**
- `docs/notification-system.md`
- Use MCP: Check notification-related Edge Functions

**Working on User Profiles?**
- `docs/profile-management.md`
- Use MCP: Check `profiles`, `business_info` tables

**Need Quick Reference?**
- `docs/USER_ACTIONS_REFERENCE.md` - Feature capabilities
- `docs/USER_FLOWS_AND_FEATURES.md` - User journeys

### Step 3: Validation (AT TASK END)
- Verify all changes work as expected
- Check documentation is updated
- Confirm no Twilio references remain
- Clean up any temp files created

---

## Code Quality Standards

### TypeScript Rules

**Always use strict TypeScript:**
- ✅ Use explicit types for function parameters
- ✅ Use explicit return types for functions
- ✅ Define interfaces for complex objects
- ❌ Never use `any` type
- ❌ Never use `@ts-ignore` or `@ts-expect-error`
- ❌ Never disable TypeScript checks

```typescript
// ❌ Bad
function getUserData(id: any): any {
  return fetchUser(id);
}

// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

function getUserData(id: string): Promise<User> {
  return fetchUser(id);
}
```

---

### Code Organization Rules

**Follow existing patterns:**
- ✅ Custom hooks go in `src/hooks/`
- ✅ Page components go in `src/pages/`
- ✅ Reusable components go in `src/components/`
- ✅ Utilities go in `src/lib/` or `src/utils/`
- ✅ Types go in `src/types/` or co-located with components

**Component structure:**
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface Props {
  userId: string;
  onSuccess: () => void;
}

// 3. Component
export function UserProfile({ userId, onSuccess }: Props) {
  // 4. Hooks
  const [loading, setLoading] = useState(false);

  // 5. Functions
  const handleSubmit = async () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

### Date/Time Handling

**Always use UTC:**
- ✅ Store dates in UTC in database
- ✅ Use `date-fns` for date manipulation
- ✅ Convert to local time for display only
- ❌ Never store dates in local timezone
- ❌ Never use `new Date()` without UTC conversion

```typescript
// ✅ Good
import { formatInTimeZone } from 'date-fns-tz';

const utcDate = new Date(); // Store this in database
const displayDate = formatInTimeZone(utcDate, userTimezone, 'PPpp');
```

---

### Error Handling

**Always handle errors gracefully:**
- ✅ Try-catch blocks for async operations
- ✅ User-friendly error messages
- ✅ Log errors for debugging (not console.log)
- ✅ Show loading states during operations
- ❌ Never let errors crash the app
- ❌ Never show raw error objects to users

```typescript
// ✅ Good
try {
  setLoading(true);
  const result = await fetchUserData(userId);
  setUser(result);
} catch (error) {
  console.error('Failed to fetch user data:', error);
  toast.error('Unable to load user profile. Please try again.');
} finally {
  setLoading(false);
}
```

---

### Logging

**ALWAYS use the logger utility (src/utils/logger.ts):**
- ❌ `console.log()` - NEVER use this
- ❌ `console.debug()` - NEVER use this
- ❌ `console.info()` - NEVER use this
- ❌ `console.error()` - Use logger.error() instead
- ✅ `import { logger } from '@/utils/logger'`
- ✅ Create contextual logger: `const moduleLogger = logger.withContext('ModuleName')`
- ✅ Use appropriate levels: `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error()`

**Configuration:**
- Dev log level: Configured in `src/config/logging.ts` (default: 'debug')
- Production: Always 'error' level only (automatic)

**NO exceptions. NO fallbacks. Use the logger utility.**

---

## Git & Version Control

### Commit Message Rules

**Write clear, descriptive commit messages:**

```bash
# ✅ Good commit messages
git commit -m "Add email verification to signup flow"
git commit -m "Fix review claiming race condition"
git commit -m "Update credit balance display formatting"
git commit -m "Remove Twilio dependencies and update docs"

# ❌ Bad commit messages
git commit -m "fix bug"
git commit -m "update stuff"
git commit -m "WIP"
git commit -m "changes"
```

**Format:**
- Start with verb (Add, Fix, Update, Remove, Refactor)
- Be specific about what changed
- Keep under 72 characters
- No period at the end

---

### Commit Scope Rules

**One logical change per commit:**
- ✅ Fix authentication bug (one commit)
- ✅ Update documentation for auth changes (separate commit if substantial)
- ❌ Fix bug + refactor + update docs + add feature (too much)

**Breaking commits into logical units makes code review easier and debugging faster.**

---

### Files to Never Commit

**NEVER commit these files:**
- ❌ `.env` (contains secrets)
- ❌ `.env.local`, `.env.production` (contains secrets)
- ❌ Any file with API keys, tokens, passwords
- ❌ `node_modules/` (use .gitignore)
- ❌ Build artifacts (`dist/`, `build/`)
- ❌ IDE config (`.vscode/`, `.idea/`)
- ❌ OS files (`.DS_Store`, `Thumbs.db`)

**Exception:** `.env.example` is safe to commit (no real secrets).

---

### Git Workflow

**Standard workflow:**
1. Check current status: `git status`
2. Review changes: `git diff`
3. Stage files: `git add [files]`
4. Commit: `git commit -m "Clear message"`
5. Push: `git push`

**If asked to commit:**
- Review all staged changes
- Verify no secrets are included
- Write descriptive commit message
- Follow existing commit message style in repo

---

## Technology Stack Rules

### Email Communication

**We use Resend for ALL email:**
- ✅ Resend API for transactional emails
- ✅ Resend for email verification
- ✅ Resend for notifications
- ❌ Never use Twilio SendGrid
- ❌ Never use AWS SES
- ❌ Never use any other email service

**Implementation:**
- Edge Functions call Resend API
- Email templates stored in Edge Function code
- API key stored in Supabase secrets

---

### SMS/Phone Verification

**Current implementation (verify before changing):**
- Check existing code for SMS provider
- Likely AWS SNS or similar (NOT Twilio)
- If you see Twilio, DELETE it and find actual implementation

**Never assume Twilio. Always verify current implementation.**

---

### Database & Backend

**We use Supabase for everything backend:**
- ✅ PostgreSQL database (via Supabase)
- ✅ Supabase Auth for authentication
- ✅ Edge Functions for serverless functions
- ✅ Supabase Storage for file uploads
- ✅ Row Level Security (RLS) for access control

**Access via MCP tools whenever possible.**

---

### Frontend Stack

**React + TypeScript + Tailwind:**
- ✅ React 18+ with hooks
- ✅ TypeScript (strict mode)
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui components
- ✅ React Router for navigation
- ✅ Vite for build tooling

**Follow existing patterns in codebase.**

---

## Task Planning & Execution

### Multi-Step Task Strategy

**For complex tasks (3+ steps):**

1. **Create planning document:**
   ```
   docs/temp/task-[description].md
   ```

2. **Break down task:**
   - List all steps required
   - Identify dependencies
   - Note validation criteria
   - Plan documentation updates

3. **Execute systematically:**
   - Complete one step fully before moving to next
   - Verify each step works
   - Update documentation as you go
   - Test edge cases and error handling

4. **Final validation:**
   - All functionality works
   - All documentation updated
   - All temp files deleted
   - No Twilio references remain
   - No console.log statements
   - No severity labels added

5. **Clean up:**
   - Delete planning document
   - Remove any debug code
   - Verify git status is clean

---

### Single Task Strategy

**For simple tasks (1-2 steps):**

1. **Understand requirement:**
   - Read relevant documentation
   - Check existing implementation
   - Verify with MCP if database-related

2. **Implement change:**
   - Make code changes
   - Test functionality
   - Handle errors gracefully

3. **Update documentation:**
   - Update affected docs
   - No new docs unless necessary
   - Be specific with code pointers

4. **Verify:**
   - Change works as expected
   - Documentation is accurate
   - No accidental additions

---

### Context Loading Strategy

**Efficient context management:**

**At session start:**
1. Read orientation docs (README, this file, CODEBASE_STRUCTURE)
2. Identify task domain (auth, reviews, billing, etc.)
3. Load ONLY relevant documentation
4. Use MCP to verify current state

**During work:**
- Load additional docs only when needed
- Use search/grep to find specific code
- Don't read entire codebase unnecessarily

**At task completion:**
- Verify documentation updates
- Clean up temp files
- Confirm all requirements met

---

## Quick Reference Summary

### The Golden Rules

1. **No severity labels** - Humans decide priority
2. **Finish tasks completely** - Quality over speed
3. **No unit tests** - Testing is out of scope
4. **No legacy comments** - Document current state only
5. **No Twilio** - Use Resend for email, verify SMS implementation
6. **No pointless docs** - Every doc must justify existence
7. **Always verify with MCP** - 100% accuracy requirement
8. **Always update docs** - Keep docs in sync with code
9. **Use temp/ for planning** - Clean up when done
10. **Use real code pointers** - Exact paths, exact names

### The Quick Checklist

Before finishing any task, ask yourself:

- [ ] Does functionality work completely?
- [ ] Did I update all relevant documentation?
- [ ] Did I verify changes with MCP tools?
- [ ] Did I remove any Twilio references?
- [ ] Did I delete temp planning files?
- [ ] Did I use logger utility (NO console.log/debug/info)?
- [ ] Did I avoid adding severity labels?
- [ ] Did I avoid creating unit tests or test files?
- [ ] Did I avoid adding legacy comments or fallback code?
- [ ] Did I use TypeScript strictly (no `any`)?
- [ ] Did I handle errors gracefully?
- [ ] Did I use real code pointers in docs?

### The MCP Toolkit

**Always use these MCP tools for verification:**

```bash
# Database operations
mcp__supabase__list_tables
mcp__supabase__execute_sql
mcp__supabase__apply_migration
mcp__supabase__get_advisors

# Edge Functions
mcp__supabase__list_edge_functions
mcp__supabase__get_edge_function
mcp__supabase__deploy_edge_function

# Project info
mcp__supabase__get_project
mcp__supabase__get_project_url
mcp__supabase__generate_typescript_types
```

---

## Your Success Framework

These guidelines exist to help you succeed. They:
- **Prevent common mistakes** that create technical debt
- **Ensure documentation accuracy** through MCP verification
- **Maintain code quality** through consistent standards
- **Enable efficient work** through smart context loading
- **Preserve codebase cleanliness** through strict rules

**Follow these guidelines and you'll create excellent contributions every time.**

When in doubt:
1. Verify with MCP before documenting
2. Be specific with file paths and names
3. Update documentation after changes
4. Ask "Does this provide unique value?"
5. Complete tasks fully before moving on

**You've got this. These guidelines are here to help you shine.**

---

*Last updated: 2025-10-05*
*For questions or clarifications, refer to existing documentation or ask the project maintainer.*
