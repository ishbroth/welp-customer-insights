# Logging Utility Documentation

## Overview

The logging utility (`src/utils/logger.ts`) provides a centralized, environment-aware logging system for the Welp application. It replaces direct `console.*` usage with a structured logging approach.

**Status**: ✅ **COMPLETE** - Fully deployed across entire codebase

## Features

- **Environment-aware**: Automatically adjusts log levels based on environment
  - Local development (localhost): All log levels enabled (debug, info, warn, error)
  - Production/Deployed: Only errors shown
- **Structured logging**: Consistent format with log level prefixes
- **Context support**: Create loggers with specific contexts for better organization
- **Type-safe**: Full TypeScript support with proper types
- **Centralized configuration**: Change log levels from one place (`src/config/logging.ts`)

## Usage

### Basic Logging

```typescript
import { logger } from '@/utils/logger';

// Debug - only in development
logger.debug('User clicked button', { buttonId: 'submit' });

// Info - only in development
logger.info('Data fetched successfully', { count: results.length });

// Warn - shown in all environments
logger.warn('API rate limit approaching', { remaining: 10 });

// Error - shown in all environments
try {
  // some code
} catch (error) {
  logger.error('Failed to save data', error);
}
```

### Context Loggers

Create component or feature-specific loggers:

```typescript
import { logger } from '@/utils/logger';

// In your component or module
const authLogger = logger.withContext('Auth');
const reviewLogger = logger.withContext('Reviews');

// Use them
authLogger.info('User logged in'); // [INFO] [Auth] User logged in
reviewLogger.error('Failed to load reviews', error); // [ERROR] [Reviews] Failed to load reviews
```

### Log Levels

| Level | When to Use | Visible In |
|-------|-------------|------------|
| **debug** | Detailed debugging information, variable values, function calls | Development only |
| **info** | General informational messages, successful operations | Development only |
| **warn** | Recoverable issues, deprecated features, potential problems | All environments |
| **error** | Errors, exceptions, failed operations | All environments |

## Environment Configuration

The logger automatically detects the environment via `src/config/logging.ts`:

**Local Development (localhost)**:
- Log level: `debug` (all logs visible)
- Detects localhost URLs (127.0.0.1, localhost, 192.168.*, 10.*, *.local)

**Production/Deployed (GitHub, mywelp.com)**:
- Log level: `error` (only errors visible)
- All deployed environments automatically use error-only logging

**Changing Log Levels** (for troubleshooting):
Edit `src/config/logging.ts` and modify the `getCurrentLogLevel()` function to return your desired log level during development.

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ Good
logger.debug('Fetching user data', { userId });
logger.info('User data loaded successfully');
logger.warn('Using cached data because API is slow');
logger.error('Failed to fetch user data', error);

// ❌ Bad
logger.error('Button clicked'); // Not an error
logger.debug('Database connection failed'); // Should be error
```

### 2. Provide Context

```typescript
// ✅ Good
logger.error('Failed to submit review', error, {
  reviewId: review.id,
  userId: currentUser.id,
  timestamp: new Date().toISOString()
});

// ❌ Bad
logger.error('Error'); // No context
```

### 3. Use Context Loggers for Components

```typescript
// ✅ Good
const componentLogger = logger.withContext('ReviewCard');

export const ReviewCard = ({ review }) => {
  componentLogger.debug('Rendering review', { reviewId: review.id });
  // ...
};

// ❌ Bad - harder to trace where logs come from
export const ReviewCard = ({ review }) => {
  logger.debug('Rendering review', { reviewId: review.id });
  // ...
};
```

### 4. Don't Log Sensitive Data

```typescript
// ✅ Good
logger.info('User authenticated', { userId: user.id });

// ❌ Bad
logger.info('User authenticated', {
  password: user.password, // Never log passwords
  apiKey: user.apiKey,     // Never log API keys
  ssn: user.ssn            // Never log PII
});
```

## Migration from Console

**Status**: ✅ **COMPLETE** - All console statements have been migrated to the logger utility.

**Pattern used for migration**:

```typescript
// Before
console.log('User logged in', user);
console.warn('Session expiring soon');
console.error('Login failed', error);

// After
import { logger } from '@/utils/logger';

logger.info('User logged in', { userId: user.id });
logger.warn('Session expiring soon');
logger.error('Login failed', error);
```

## ESLint Configuration

ESLint is configured to warn about console usage:

```javascript
// eslint.config.js
rules: {
  "no-console": ["warn", { allow: [] }]
}
```

This warns developers to use the logger utility instead of console statements. All console usage has been eliminated from the codebase (except in logger.ts itself).

## Examples by Use Case

### Component Rendering

```typescript
const componentLogger = logger.withContext('ProfilePage');

export const ProfilePage = () => {
  componentLogger.debug('Component mounted');

  useEffect(() => {
    componentLogger.info('Fetching user profile');
    // ...
  }, []);

  return <div>...</div>;
};
```

### API Calls

```typescript
const apiLogger = logger.withContext('API');

export const fetchUserData = async (userId: string) => {
  apiLogger.debug('Fetching user data', { userId });

  try {
    const response = await fetch(`/api/users/${userId}`);
    apiLogger.info('User data fetched successfully', { userId });
    return response.json();
  } catch (error) {
    apiLogger.error('Failed to fetch user data', error, { userId });
    throw error;
  }
};
```

### Form Submission

```typescript
const formLogger = logger.withContext('ReviewForm');

const handleSubmit = async (data) => {
  formLogger.debug('Form submitted', { hasPhotos: data.photos.length > 0 });

  try {
    await submitReview(data);
    formLogger.info('Review submitted successfully', { reviewId: data.id });
  } catch (error) {
    formLogger.error('Failed to submit review', error);
    toast.error('Submission failed');
  }
};
```

### Authentication

```typescript
const authLogger = logger.withContext('Auth');

export const login = async (email: string, password: string) => {
  authLogger.debug('Login attempt', { email }); // Don't log password!

  try {
    const user = await signIn(email, password);
    authLogger.info('User logged in successfully', { userId: user.id });
    return user;
  } catch (error) {
    authLogger.error('Login failed', error, { email });
    throw error;
  }
};
```

## Testing

To verify the logger works in different environments:

```typescript
import { logger } from '@/utils/logger';

// Check configuration
console.log(logger.getConfig());
// Development: { isDevelopment: true, currentLevel: 'debug' }
// Production: { isDevelopment: false, currentLevel: 'error' }

// Test all levels
logger.debug('Debug message'); // Only visible on localhost
logger.info('Info message');   // Only visible on localhost
logger.warn('Warning message'); // Visible on deployed sites with warn level
logger.error('Error message');  // Always visible
```

## Files

- **Implementation**: `src/utils/logger.ts`
- **Configuration**: `src/config/logging.ts`
- **Test file**: `src/utils/logger.test.ts`
- **Documentation**: `docs/architecture/logging-utility.md` (this file)
- **ESLint Config**: `eslint.config.js`

## Migration Stats

**Total files migrated**: 190+
- Authentication files: 13 files
- Customer/Review hooks: 26 files
- Other hooks: 16 files
- Services: 18 files
- Pages: 9 files
- Business/Customer components: 13 files
- Other components: 70+ files
- Utils: 24 files

**Console statements replaced**: 800+
- console.log → logger.debug() or logger.info()
- console.info → logger.info()
- console.warn → logger.warn()
- console.error → logger.error()

**Verification**: Only `src/utils/logger.ts` contains console statements (as expected)

## Related Documentation

- AI Coding Guidelines (`docs/AI-CODING-GUIDELINES.md`) - Logging requirements
- Quick Reference (`docs/QUICK-REFERENCE.md`) - Feature overview
- Configuration (`src/config/logging.ts`) - Log level control

---

**Created**: October 9, 2025
**Migration Completed**: October 11, 2025
**Status**: ✅ **COMPLETE** - Fully deployed across entire codebase
**Environment**: Automatic detection (localhost = debug, deployed = errors only)
