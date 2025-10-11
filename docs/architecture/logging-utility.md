# Logging Utility Documentation

## Overview

The logging utility (`src/utils/logger.ts`) provides a centralized, environment-aware logging system for the Welp application. It replaces direct `console.*` usage with a structured logging approach.

## Features

- **Environment-aware**: Automatically adjusts log levels based on environment
  - Development: All log levels enabled (debug, info, warn, error)
  - Production: Only warnings and errors shown
- **Structured logging**: Consistent format with log level prefixes
- **Context support**: Create loggers with specific contexts for better organization
- **Type-safe**: Full TypeScript support with proper types

## Usage

### Basic Logging

```typescript
import { logger } from '@/utils/logger';

// Debug - only in development
logger.debug('User clicked button', { buttonId: 'submit' });

// Info - only in development
logger.info('Data fetched successfully', { count: results.length });

// Warn - always shown
logger.warn('API rate limit approaching', { remaining: 10 });

// Error - always shown
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

**Note**: This utility is ready to use, but existing `console.*` statements have NOT been replaced yet. That will happen during Phase 4 (console cleanup) after this utility is tested.

When migrating console statements:

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

This warns developers to use the logger utility but doesn't break builds. During Phase 4, this will be changed to "error".

## Environment Configuration

The logger automatically detects the environment:

```typescript
// Checks import.meta.env.MODE and import.meta.env.DEV
const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
```

No additional configuration needed!

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
// Development: { isDevelopment: true, enabledLevels: Set(['debug', 'info', 'warn', 'error']) }
// Production: { isDevelopment: false, enabledLevels: Set(['warn', 'error']) }

// Test all levels
logger.debug('Debug message'); // Only visible in dev
logger.info('Info message');   // Only visible in dev
logger.warn('Warning message'); // Always visible
logger.error('Error message');  // Always visible
```

## Future Enhancements

Potential future improvements (not implemented yet):

- Remote logging service integration (e.g., Sentry, LogRocket)
- Log file persistence
- Performance metrics tracking
- Custom log formatters
- Log filtering by context

## Files

- **Implementation**: `src/utils/logger.ts`
- **Documentation**: `docs/architecture/logging-utility.md` (this file)
- **ESLint Config**: `eslint.config.js`

## Related Documentation

- Phase 4: Console Cleanup (`docs/temp/14-console-cleanup.md`) - When to replace console statements
- AI Coding Guidelines (`docs/AI-CODING-GUIDELINES.md`) - General development practices

---

**Created**: October 9, 2025  
**Status**: ✅ Ready to use (console replacement in Phase 4)  
**Environment**: Works in both development and production
