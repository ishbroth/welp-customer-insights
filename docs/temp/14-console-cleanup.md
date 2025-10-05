# Console.log Cleanup Plan

## Overview
Remove all console.log statements from production code and replace with proper logging utility.

## Current State
- 1,399 console statements across 193 files
- No centralized logging
- Console statements in production
- No log level management

## Prerequisites
This plan depends on:
- **06-logging-utility.md** - Must be implemented first
- Logging utility must be created and configured

## Work to be Done

### 1. Create Search and Replace Strategy
Search patterns to replace:
- `console.log(` → `logger.debug(`
- `console.info(` → `logger.info(`
- `console.warn(` → `logger.warn(`
- `console.error(` → `logger.error(`
- `console.table(` → `logger.table(`
- `console.group(` → `logger.group(`
- `console.groupEnd()` → `logger.groupEnd()`

### 2. Systematic Replacement Process
Process files in order:

**Phase 1: Services (Priority 1)**
- All files in `src/services/`
- Database operations, API calls
- Most critical for production debugging

**Phase 2: Utilities (Priority 2)**
- All files in `src/utils/`
- Shared functionality
- Used across application

**Phase 3: Hooks (Priority 3)**
- All files in `src/hooks/`
- Data fetching and state management
- Important for debugging

**Phase 4: Components (Priority 4)**
- All files in `src/components/`
- UI components
- Lower priority for logging

**Phase 5: Pages (Priority 5)**
- All files in `src/pages/`
- Route components
- Can use less logging

**Phase 6: Edge Functions**
- All Supabase Edge Functions
- Use Deno-compatible logger

### 3. Add Logger Imports
For each file being updated:
```typescript
import { logger } from '@/utils/logger'
```

Or for categorized logging:
```typescript
import { logger } from '@/utils/logger'
const log = logger.category('ComponentName')
```

### 4. Context Enhancement
When replacing, add context:
```typescript
// Before
console.log('User data', data)

// After
logger.debug('User data fetched', {
  userId: data.id,
  email: data.email
})
```

### 5. Remove Debug Logging
Identify and remove logs that were only for debugging:
- Temporary debug statements
- Unused variable logging
- Redundant state logging
- Performance logs without purpose

### 6. Enhance Error Logging
Improve error logs:
```typescript
// Before
console.error('Error:', error)

// After
logger.error('Failed to fetch user profile', {
  error: error.message,
  userId,
  stack: error.stack
})
```

### 7. Add ESLint Rule
Prevent future console usage:

Update `.eslintrc.js` or `eslint.config.js`:
```javascript
{
  rules: {
    'no-console': 'error'
  }
}
```

This will:
- Prevent new console statements
- Show errors in IDE
- Fail build if console.log added

### 8. Handle Special Cases
Some console statements are intentional:
```typescript
// CLI tools, build scripts
if (process.env.NODE_ENV === 'development') {
  console.log('[Build]', 'Starting build...')
}
```

Add ESLint disable comments if needed:
```typescript
// eslint-disable-next-line no-console
console.log('[Build]', message)
```

### 9. Verification
After replacement:
```bash
# Search for remaining console statements
grep -r "console\." src/

# Should return zero or only intentional ones
```

### 10. Update Git Hooks
Add pre-commit hook to check:
```bash
# .husky/pre-commit
#!/bin/sh
if git diff --cached | grep -E "console\.(log|info|warn|error)"; then
  echo "❌ Console statements found. Use logger instead."
  exit 1
fi
```

## Files to Update (193 total)
Process systematically:

**Services (16 files)**
- conversationService.ts
- photoUploadService.ts
- carouselReviewsService.ts
- reviewSubmissionService.ts
- customerService.ts
- subscriptionService.ts
- mobilePushNotifications.ts
- reviewsService.ts
- businessProfileService.ts
- duplicateAccount/*.ts (7 files)

**Hooks (78 files)**
- All files in `src/hooks/`
- Priority: useCustomerSearch, useReviewSubmission, useBusinessReviews

**Components (65+ files)**
- All files in `src/components/`
- Priority: business/, review/, signup/ components

**Pages (30+ files)**
- All files in `src/pages/`

**Utilities (12 files)**
- All files in `src/utils/`

**Edge Functions**
- All functions in `supabase/functions/`

## Automation Script
Create script to help with replacement:
```bash
#!/bin/bash
# replace-console.sh

find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Add logger import if not exists
  if ! grep -q "import.*logger" "$file"; then
    # Add import at top of file
  fi

  # Replace console statements
  sed -i '' 's/console\.log(/logger.debug(/g' "$file"
  sed -i '' 's/console\.info(/logger.info(/g' "$file"
  sed -i '' 's/console\.warn(/logger.warn(/g' "$file"
  sed -i '' 's/console\.error(/logger.error(/g' "$file"
done
```

## Testing After Replacement
- Run full build to catch errors
- Test in development mode (all logs visible)
- Test in production mode (only errors visible)
- Verify log levels work correctly
- Check performance impact

## Deliverables
- Zero console statements in production code
- All logging through logger utility
- ESLint rule enforced
- Environment-based log levels working
- Git hooks preventing console usage
- Documentation updated
- Cleaner, more maintainable codebase
