# Documentation Validation Checklist

## MANDATORY: Run After Every Single Task

This checklist is **NOT OPTIONAL**. It is the enforcement mechanism that keeps our documentation system 100% accurate and prevents drift between code and docs.

**Rule**: You cannot mark a task as complete until you've run through the relevant sections of this checklist and verified every applicable item.

**Why This Exists**: Without enforcement, documentation becomes outdated within days. This checklist is your forcing function. It's quick to execute but comprehensive enough to catch everything.

---

## How to Use This Checklist

1. **Identify what changed** - Read through section headers to find relevant categories
2. **Check every applicable item** - Mark YES or NO for each
3. **Run verification commands** - Use MCP tools to validate accuracy
4. **Fix any issues** - Update docs immediately if items fail
5. **Only then** - Mark your task as complete

---

## 1. Database Schema Changes

**If you created, modified, or deleted tables, columns, or constraints:**

- [ ] **Run verification command**: `mcp__supabase__list_tables` with project_id `yftvcixhifvrovwhtgtj`
- [ ] **Compare output** to relevant `docs/database/schema-*.md` files - do they match exactly?
- [ ] **Updated schema docs** for the affected domain (reviews, associates, auth, business)
- [ ] **Updated `docs/database/constraints.md`** if foreign keys, unique constraints, or check constraints changed
- [ ] **Updated `docs/database/rls-policies.md`** if RLS policies were added, modified, or removed
- [ ] **Verified RLS is enabled** on all new tables (run command in Section 10)
- [ ] **Updated `docs/QUICK-REFERENCE.md`** if change affects user-visible behavior
- [ ] **Updated relevant deep-dive docs** in `docs/architecture/` if business logic changed
- [ ] **Removed references** to deleted tables/columns from ALL docs
- [ ] **No Twilio references** remain in database docs

**Files to check/update:**
- `docs/database/schema-[domain].md` (schema-core, schema-reviews, schema-notifications)
- `docs/database/constraints.md`
- `docs/database/rls-policies.md`
- `docs/QUICK-REFERENCE.md`
- Relevant `docs/architecture/deep-dive-*.md`

---

## 2. Edge Function Changes

**If you created, modified, or deleted Edge Functions:**

- [ ] **Run verification command**: `mcp__supabase__list_edge_functions` with project_id `yftvcixhifvrovwhtgtj`
- [ ] **Compare output** to `docs/edge-functions/*.md` - do all deployed functions have docs?
- [ ] **Created/updated** function documentation in appropriate `docs/edge-functions/*.md` file
- [ ] **Added to index** in `docs/edge-functions/README.md` if new function created
- [ ] **Removed from docs** completely if function deleted (check README and group file)
- [ ] **Documented parameters** with exact TypeScript types and validation rules
- [ ] **Documented return values** with exact TypeScript types and all possible responses
- [ ] **Listed all frontend files** that call this function (full paths like `src/pages/ReviewSubmission.tsx`)
- [ ] **Updated deep-dive docs** if this function changes a user flow
- [ ] **Updated `docs/QUICK-REFERENCE.md`** if user-visible behavior changed
- [ ] **No Twilio functions** remain in docs or deployment

**Files to check/update:**
- `docs/edge-functions/[group].md` (auth, billing, user, email, notification)
- `docs/edge-functions/README.md`
- Relevant `docs/architecture/deep-dive-*.md`
- `docs/QUICK-REFERENCE.md`

---

## 3. User-Facing Feature/Flow Changes

**If you modified authentication, review flows, business flows, or any user-visible feature:**

- [ ] **Updated deep-dive docs** - `docs/architecture/deep-dive-*.md` for affected area
- [ ] **Updated `docs/QUICK-REFERENCE.md`** with new behavior patterns
- [ ] **Verified all file paths** in docs point to real files (use Glob to check)
- [ ] **Updated code pointers** if files were moved or renamed
- [ ] **Checked Edge Functions docs** - does this flow call functions? Are they documented?
- [ ] **Checked database docs** - does this flow use tables? Are they documented?
- [ ] **Removed legacy behavior** descriptions from docs (no "used to be" comments)
- [ ] **No severity labels** added (CRITICAL, HIGH, etc.)
- [ ] **No timelines** or deadlines added to docs
- [ ] **No placeholder content** left in docs (TODO, TBD, etc.)

**Files to check/update:**
- `docs/architecture/deep-dive-auth.md`
- `docs/architecture/deep-dive-reviews.md`
- `docs/architecture/deep-dive-billing.md`
- `docs/architecture/deep-dive-search.md`
- `docs/architecture/deep-dive-conversations.md`
- `docs/QUICK-REFERENCE.md`

---

## 4. Authentication System Changes

**If you modified anything auth-related (signup, login, session, permissions):**

- [ ] **Updated `docs/architecture/deep-dive-auth.md`** with exact behavior changes
- [ ] **Updated `docs/database/schema-auth.md`** if auth tables changed
- [ ] **Updated `docs/edge-functions/auth-functions.md`** if auth functions changed
- [ ] **Verified NO Twilio references** remain anywhere in auth docs
- [ ] **Confirmed Resend integration** documented if email verification involved
- [ ] **Updated RLS policies docs** if auth-related policies changed
- [ ] **Verified session handling** documented accurately
- [ ] **Updated `docs/QUICK-REFERENCE.md`** with new auth behavior

**Files to check/update:**
- `docs/architecture/deep-dive-auth.md`
- `docs/database/schema-core.md`
- `docs/edge-functions/auth-functions.md`
- `docs/database/rls-policies.md`
- `docs/QUICK-REFERENCE.md`

---

## 5. Frontend UI/Component Changes

**If you created, modified, or deleted React components, pages, or hooks:**

- [ ] **Updated deep-dive docs** with new component file paths
- [ ] **Updated `docs/QUICK-REFERENCE.md`** if change is user-visible
- [ ] **Verified component paths** in docs are correct (use Glob: `src/components/**/*.tsx`)
- [ ] **Verified page paths** in docs are correct (use Glob: `src/pages/**/*.tsx`)
- [ ] **Updated hook documentation** if custom hooks changed
- [ ] **Removed references** to deleted components from ALL docs
- [ ] **No broken links** to moved or deleted files
- [ ] **Updated Edge Function docs** if components now call different functions
- [ ] **Updated integration docs** if Supabase client usage changed

**Files to check/update:**
- Relevant `docs/architecture/deep-dive-*.md`
- `docs/QUICK-REFERENCE.md`
- `docs/integrations/supabase-client.md` (if applicable)

---

## 6. Environment Variable Changes

**If you added, changed, or removed environment variables:**

- [ ] **Updated `.env.example`** with new variables (with example values, NOT secrets)
- [ ] **Documented in getting-started** if needed for local development
- [ ] **Documented in deployment docs** if needed for production
- [ ] **Marked correctly** as public (VITE_*) or secret (Edge Function only)
- [ ] **Verified NO secrets** in `.env` are committed to git (check git status)
- [ ] **Removed variables** from `.env.example` if deleted from code
- [ ] **Updated relevant docs** that reference these variables

**Files to check/update:**
- `.env.example`
- `docs/getting-started.md`
- `docs/deployment.md`
- Relevant `docs/architecture/deep-dive-*.md`

---

## 7. Dependency/Package Changes

**If you added or removed npm packages:**

- [ ] **Updated `docs/architecture/overview.md`** if major dependency added
- [ ] **Removed related docs** if dependency removed (check integrations/)
- [ ] **Documented new integration** if package adds new capability
- [ ] **Updated tech stack** in overview.md if significant
- [ ] **No references remain** to removed dependencies in docs

**Files to check/update:**
- `docs/architecture/overview.md`
- `docs/integrations/*.md` (if applicable)

---

## 8. Dead Code/File Removal

**If you deleted files, functions, features, or any code:**

- [ ] **Removed references** from ALL documentation files (use Grep to find them)
- [ ] **Deleted related docs** if entire feature removed
- [ ] **Updated `docs/QUICK-REFERENCE.md`** if user-visible feature removed
- [ ] **Updated deep-dive docs** if flows changed due to removal
- [ ] **Updated Edge Functions docs** if functions deleted
- [ ] **Updated database docs** if tables/columns deleted
- [ ] **Grep verification**: Search docs for deleted item names - should return ZERO results
- [ ] **No "deprecated" or "legacy" comments** added - just remove entirely

**Verification command:**
```bash
# Replace DELETED_ITEM_NAME with actual name
grep -r "DELETED_ITEM_NAME" /Users/isaac/vcs/github/welp-customer-insights/docs/
# Should return NO results
```

---

## 9. General Validation (Run After EVERY Task)

**These items apply to ALL changes, no exceptions:**

- [ ] **NO Twilio references** anywhere in docs (run Grep command below)
- [ ] **NO legacy comments** like "used to be", "previously", "old system"
- [ ] **NO severity labels** added (CRITICAL, HIGH, MEDIUM, LOW, INFO)
- [ ] **NO timelines** or deadlines added ("by next week", "Q2 goal", etc.)
- [ ] **NO relative paths** - all file paths are absolute (`/Users/isaac/vcs/...` or `src/*`)
- [ ] **All function names** are actual function names (verify in code)
- [ ] **All table names** are actual table names (verify with MCP)
- [ ] **All file paths** point to real files (use Glob to verify)
- [ ] **Deleted temp planning files** if any were created (`temp/*.md`)
- [ ] **NO new pointless docs** created (no random READMEs, no redundant guides)
- [ ] **Consistent formatting** with existing docs (headings, code blocks, lists)

**Grep commands to run:**
```bash
# Verify NO Twilio references
grep -ri "twilio" /Users/isaac/vcs/github/welp-customer-insights/docs/

# Verify NO severity labels
grep -ri "CRITICAL\|HIGH PRIORITY\|MEDIUM\|LOW PRIORITY" /Users/isaac/vcs/github/welp-customer-insights/docs/

# Should return ZERO results for both
```

---

## 10. MCP Verification Commands

**Run these commands to verify documentation accuracy against live system:**

### Verify Database Tables
```
Tool: mcp__supabase__list_tables
Parameters: { "project_id": "yftvcixhifvrovwhtgtj" }

Compare output to:
- docs/database/schema-reviews.md
- docs/database/schema-core.md
- docs/database/schema-notifications.md

Every table in output should have documentation.
Every table in docs should exist in output.
```

### Verify Edge Functions
```
Tool: mcp__supabase__list_edge_functions
Parameters: { "project_id": "yftvcixhifvrovwhtgtj" }

Compare output to:
- docs/edge-functions/README.md
- docs/edge-functions/auth-functions.md
- docs/edge-functions/billing-functions.md
- docs/edge-functions/user-functions.md
- docs/edge-functions/email-functions.md
- docs/edge-functions/notification-functions.md

Every deployed function should have documentation.
Every function in docs should exist in deployment.
```

### Verify RLS Enabled
```
Tool: mcp__supabase__execute_sql
Parameters: {
  "project_id": "yftvcixhifvrovwhtgtj",
  "query": "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
}

Compare output to docs/database/rls-policies.md
All tables should have rowsecurity = true
```

### Verify No Twilio Functions
```
Tool: mcp__supabase__list_edge_functions
Parameters: { "project_id": "yftvcixhifvrovwhtgtj" }

Verify NO functions with "twilio" in name exist.
```

### Verify Tables Match Schema Docs
```
For each table, run:
Tool: mcp__supabase__execute_sql
Parameters: {
  "project_id": "yftvcixhifvrovwhtgtj",
  "query": "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'TABLE_NAME' ORDER BY ordinal_position;"
}

Compare to relevant docs/database/schema-*.md
Column names, types, and nullable status should match exactly.
```

---

## 11. Final Checklist Before Task Completion

**Before you mark ANY task as complete:**

- [ ] **All relevant sections** of this checklist completed
- [ ] **All MCP verification commands** run and passed
- [ ] **All file paths verified** to point to real files
- [ ] **All Grep commands** returned expected results (usually zero)
- [ ] **No documentation drift** detected
- [ ] **No broken references** found
- [ ] **Git status checked** - no secrets committed
- [ ] **Ready to commit** - all docs are accurate

---

## Enforcement Philosophy

This checklist exists because **documentation without enforcement becomes fiction**.

- Code changes constantly
- Humans (and AIs) forget to update docs
- Small drift compounds into massive inaccuracy
- This checklist is the forcing function that prevents drift

**The Rule**: If you didn't run the checklist, you didn't finish the task.

No exceptions. No shortcuts. This is how we maintain 100% accuracy.

---

## Quick Reference: Common Verification Patterns

### After Database Migration
1. Run `mcp__supabase__list_tables`
2. Update `docs/database/schema-*.md`
3. Check constraints.md and rls-policies.md
4. Grep for old table/column names
5. Update QUICK-REFERENCE.md if needed

### After Edge Function Deployment
1. Run `mcp__supabase__list_edge_functions`
2. Update `docs/edge-functions/*.md`
3. Add to README.md index
4. Update deep-dive docs with calling files
5. Update QUICK-REFERENCE.md if user-visible

### After Component Changes
1. Glob verify file paths (`src/components/**/*.tsx`)
2. Update deep-dive docs with new paths
3. Update QUICK-REFERENCE.md if user-visible
4. Check if Edge Function calls changed
5. Remove references to deleted components

### After Feature Removal
1. Grep for ALL references to removed feature
2. Delete from deep-dive docs
3. Delete from QUICK-REFERENCE.md
4. Check Edge Functions docs
5. Check database docs
6. Verify zero Grep results for feature name

---

## You're Done When...

- [ ] All applicable checklist items marked
- [ ] All MCP commands run and verified
- [ ] All documentation matches live system
- [ ] Zero drift detected
- [ ] Zero broken references
- [ ] Ready to commit with confidence

**Now and only now can you mark your task complete.**
