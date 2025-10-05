# Database Utility Extraction Plan

## Overview
Create abstraction layer for database operations to centralize query patterns, error handling, and data transformations.

## Current State
- Direct Supabase client usage scattered across components
- No centralized query builders
- Inconsistent error handling
- Data transformation logic in components

## Work to be Done

### 1. Create Database Service Layer
Organize services by domain:
- `src/services/db/reviews.ts`
- `src/services/db/profiles.ts`
- `src/services/db/auth.ts`
- `src/services/db/billing.ts`
- `src/services/db/notifications.ts`
- `src/services/db/conversations.ts`

### 2. Query Builders
Create reusable query patterns:
- `getReviewById(id)`
- `getReviewsByBusinessId(businessId, options)`
- `getUserProfile(userId)`
- `searchCustomers(criteria)`
- Pagination helpers
- Filtering helpers
- Sorting helpers

### 3. Error Handling
- Centralized error handling wrapper
- Typed error responses
- User-friendly error messages
- Logging integration

### 4. Data Transformers
Create type-safe transformers:
- Database model → UI model
- UI model → Database model
- Handle null/undefined consistently
- Format nested objects

### 5. React Query Integration
- Create custom hooks using React Query
- Centralize cache configuration
- Implement optimistic updates
- Handle background refetching

### 6. Type Safety
- Export database types from Supabase
- Create UI-specific types
- Type all query functions
- Type all transformers

### 7. Connection Management
- Ensure single Supabase client instance
- Handle connection errors
- Implement retry logic
- Add connection health checks

### 8. Common Patterns
Extract repeated patterns:
- Soft delete queries
- Created/Updated timestamp handling
- User ownership checks
- RLS-aware queries

## Files to Create
- `src/services/db/index.ts` - Main export
- `src/services/db/reviews.ts`
- `src/services/db/profiles.ts`
- `src/services/db/auth.ts`
- `src/services/db/billing.ts`
- `src/services/db/notifications.ts`
- `src/services/db/conversations.ts`
- `src/services/db/types.ts` - Shared types
- `src/services/db/errors.ts` - Error utilities
- `src/services/db/transforms.ts` - Data transformers
- `src/lib/queryClient.ts` - React Query config

## Files to Update
- All components/hooks directly using Supabase client
- Replace direct queries with service functions
- Update error handling

## Deliverables
- Clean database abstraction layer
- Type-safe database operations
- Centralized error handling
- Easier to maintain and test
- Clear separation of concerns
