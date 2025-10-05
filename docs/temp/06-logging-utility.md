# Logging Utility Plan

## Overview
Replace all console.log statements with a proper logging system that supports log levels, environment-based filtering, and structured logging.

## Current State
- 1,399 console.log/error/warn statements across 193 files
- No log level management
- Console statements running in production
- No structured logging
- No log aggregation

## Work to be Done

### 1. Create Logger Utility
Create `src/utils/logger.ts`:

```typescript
// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Logger interface
logger.debug(message, ...data)
logger.info(message, ...data)
logger.warn(message, ...data)
logger.error(message, ...data)
logger.group(label)
logger.groupEnd()
logger.table(data)
```

### 2. Environment Configuration
Configure based on environment:
- **Development**: All logs enabled (DEBUG+)
- **Staging**: INFO+ only
- **Production**: ERROR only
- Set via `VITE_LOG_LEVEL` environment variable

### 3. Structured Logging
Add context to logs:
- Timestamp
- Log level
- Component/file name
- User ID (if available)
- Session ID
- Additional metadata

### 4. Log Categories
Create category-based logging:
```typescript
logger.auth.debug('Login attempt', { email })
logger.api.info('API call', { endpoint, method })
logger.db.error('Query failed', { query, error })
logger.ui.warn('Render issue', { component })
```

### 5. Performance Logging
Add performance helpers:
```typescript
logger.time('operationName')
logger.timeEnd('operationName')
logger.measure('Custom metric', duration)
```

### 6. Error Tracking Integration
Prepare for error tracking service:
- Structure errors for Sentry/similar
- Include stack traces
- Include breadcrumbs
- User context

### 7. Replace Console Statements
Systematic replacement:
1. Search for `console.log` → `logger.debug`
2. Search for `console.info` → `logger.info`
3. Search for `console.warn` → `logger.warn`
4. Search for `console.error` → `logger.error`

Process files by priority:
- Services first
- Hooks second
- Components third
- Pages last

### 8. Edge Functions Logging
Create Edge Function version:
- `supabase/functions/_shared/logger.ts`
- Deno-compatible logging
- Use Deno's built-in console with levels

### 9. ESLint Rule
Add ESLint rule to prevent direct console usage:
```javascript
{
  "no-console": ["error", {
    "allow": []
  }]
}
```

### 10. Log Viewer (Optional)
For development:
- Filter logs by level
- Filter logs by category
- Export logs
- Clear logs

## Files to Create
- `src/utils/logger.ts` - Main logger
- `src/utils/loggerConfig.ts` - Configuration
- `supabase/functions/_shared/logger.ts` - Edge Function logger
- `src/components/dev/LogViewer.tsx` - Dev tool (optional)

## Files to Update
All 193 files with console statements:
- All service files
- All hook files
- All component files
- All page files
- Edge functions

## Deliverables
- Production-ready logging system
- Environment-based log levels
- No console statements in production
- Structured, searchable logs
- Developer-friendly logging experience
- ESLint protection against console usage
