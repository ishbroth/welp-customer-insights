# Welp Customer Insights - AI Documentation Hub

**START HERE**: This is the entry point for all AI agents working on this project.

## AI Startup Workflow

**MANDATORY 4-Step Discovery Process**

Every AI agent working on this project MUST follow this exact workflow before writing any code:

### Step 1: Read Startup Context

**Required Reading** (in order):
1. **docs/AI-CODING-GUIDELINES.md** - Your constitution. Non-negotiable rules.
2. **docs/QUICK-REFERENCE.md** - Fast feature and capability lookup
3. **docs/VALIDATION-CHECKLIST.md** - Run after EVERY task

**Quick Orientation**:
- 28 database tables (all with RLS enabled)
- 32 Edge Functions (Deno runtime)
- React + TypeScript + Tailwind frontend
- Supabase backend (PostgreSQL, Auth, Storage)
- Stripe for billing
- Resend for all email (NO Twilio)
- **Logging: Use logger utility (src/utils/logger.ts) - NO console.log**

### Step 2: Ask User for Task

**Get clarity on:**
- What needs to be done?
- Any specific requirements?
- Any constraints or preferences?
- Expected outcome?

**Don't assume. Ask.**

### Step 3: Thorough Documentation Discovery

**Review relevant docs for your task:**

**Authentication Task?**
- `docs/database/schema-auth.md` - Auth tables
- `docs/edge-functions/auth-functions.md` - Auth functions
- Relevant hooks and components

**Review System Task?**
- `docs/database/schema-core.md` - reviews, responses, review_photos tables
- `docs/database/schema-reviews.md` - review_claims, review_reports
- `docs/edge-functions/notification-functions.md` - Review notifications

**Billing Task?**
- `docs/database/schema-billing.md` - credits, subscriptions
- `docs/edge-functions/billing-functions.md` - Stripe integration

**Conversation Task?**
- `docs/database/schema-conversations.md` - Messaging tables

**Database Change?**
- `docs/database/README.md` - Database overview
- Relevant `docs/database/schema-*.md` files
- `docs/database/constraints.md` - Foreign keys
- `docs/database/rls-policies.md` - Access control

**Edge Function Change?**
- `docs/edge-functions/README.md` - Function overview
- Relevant `docs/edge-functions/*.md` category files

**Use MCP Tools to Verify Current State:**
- `mcp__supabase__list_tables` - Verify database schema
- `mcp__supabase__list_edge_functions` - Verify deployed functions
- `mcp__supabase__execute_sql` - Check specific table structures
- `mcp__supabase__get_advisors` - Security recommendations

**Be thorough. Load all relevant docs. Verify with MCP.**

### Step 4: Code Discovery & Plan Display

**Code Discovery:**
1. Read actual source files mentioned in documentation
2. Verify documentation matches current code
3. Identify files that need modification
4. Check for dependencies and impacts

**Plan Display:**
1. Present detailed plan to user
2. Include specific files to modify
3. Include database/Edge Function changes
4. Include documentation updates needed

**Self-Audit:**
- Will this plan actually work?
- Did I check all dependencies?
- Did I verify with MCP tools?
- Did I read the relevant docs?
- Am I following AI-CODING-GUIDELINES.md?

**Confirm with user before executing.**

---

## Documentation Structure

### Core Documentation
- **AI-CODING-GUIDELINES.md** - Rules and standards (MANDATORY)
- **QUICK-REFERENCE.md** - Fast feature lookup
- **VALIDATION-CHECKLIST.md** - Post-task validation (MANDATORY)

### Database Documentation
- **database/README.md** - Database overview and navigation
- **database/QUICK_REFERENCE.md** - Fast table lookup
- **database/schema-core.md** - profiles, business_info, reviews, responses, review_photos
- **database/schema-auth.md** - Auth and verification tables
- **database/schema-billing.md** - Credits and subscriptions
- **database/schema-notifications.md** - Email notifications
- **database/schema-reviews.md** - Review management tables
- **database/schema-conversations.md** - Messaging tables
- **database/schema-access.md** - Access control tables
- **database/constraints.md** - All foreign keys and constraints
- **database/rls-policies.md** - Row Level Security policies

### Edge Functions Documentation
- **edge-functions/README.md** - Functions overview (32 total)
- **edge-functions/auth-functions.md** - Authentication (8 functions)
- **edge-functions/billing-functions.md** - Stripe integration (9 functions)
- **edge-functions/email-functions.md** - Resend integration (3 functions)
- **edge-functions/notification-functions.md** - Email notifications (2 functions)
- **edge-functions/user-functions.md** - Profile and admin (8 + 2 functions)

### Architecture Documentation
(Note: Full deep-dive docs may not exist yet - use database and edge function docs for detailed flows)

---

## Context Management

**Load efficiently:**
- Don't read all 28 tables unless needed
- Use domain-specific schema files
- Load only relevant Edge Function docs
- Check QUICK-REFERENCE first for fast lookups

**Database is chunked by domain:**
- Core (5 tables)
- Auth (5 tables)
- Billing (4 tables)
- Notifications (4 tables)
- Reviews (4 tables)
- Conversations (2 tables)
- Access (4 tables)

**Load only what you need for your task.**

---

## Critical Rules

From AI-CODING-GUIDELINES.md:

❌ **NEVER**:
- Use severity labels (CRITICAL, HIGH, etc.)
- Create timelines or deadlines
- Finish tasks early/incompletely
- Create unit tests
- Add legacy comments ("used to be...")
- Reference Twilio (we use Resend)
- Create pointless documentation
- **Use console.log, console.debug, console.info (use logger utility)**
- Add fallback mechanisms or backwards compatibility code
- Add test files or unit test frameworks

✅ **ALWAYS**:
- Verify with MCP before documenting
- Update docs after code changes
- Use docs/temp/ for task planning (delete when done)
- Keep context efficient
- Use real code pointers (exact file paths)
- Run VALIDATION-CHECKLIST.md after every task
- Complete tasks fully
- **Use logger utility for all logging (import from '@/utils/logger')**
- **Create contextual loggers: const logger = logger.withContext('ComponentName')**
- **Use appropriate log levels: debug(), info(), warn(), error()**

---

## Technology Stack

**Backend:**
- Supabase (PostgreSQL 15.8.1)
- Edge Functions (Deno runtime)
- Row Level Security (RLS) on all tables

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS (light mode only)
- Capacitor (iOS/Android)

**External Services:**
- Stripe (billing)
- Resend (all email)
- NO Twilio (removed)
- NO push notifications (email only)

---

## Common Tasks Quick Links

**Modifying Authentication?**
→ Read: `database/schema-auth.md`, `edge-functions/auth-functions.md`

**Modifying Reviews?**
→ Read: `database/schema-core.md`, `database/schema-reviews.md`

**Modifying Billing?**
→ Read: `database/schema-billing.md`, `edge-functions/billing-functions.md`

**Adding Database Table?**
→ Read: `database/constraints.md`, `database/rls-policies.md`, then VALIDATION-CHECKLIST.md

**Adding Edge Function?**
→ Read: `edge-functions/README.md`, verify deployment with MCP

---

## After Every Task

**Run through VALIDATION-CHECKLIST.md**

This is NOT optional. It's the forcing function that keeps documentation 100% accurate.

- Verify with MCP tools
- Update all relevant docs
- Check for Twilio references (delete them)
- Remove temp files
- Ensure 100% accuracy

---

## Need Help?

1. **Check QUICK-REFERENCE.md** - Fast feature lookup
2. **Check database/QUICK_REFERENCE.md** - Table lookup by use case
3. **Check edge-functions/README.md** - Function overview
4. **Use MCP tools** - Verify current state
5. **Read AI-CODING-GUIDELINES.md** - Detailed rules and examples

---

**Remember the 4-step workflow:**
1. Read startup context
2. Ask user for task
3. Thorough doc discovery (with MCP verification)
4. Code discovery + plan display + self-audit + user confirmation

**Then and only then**: Execute the task.
