
# Authentication System Reference

## Overview
Complete authentication system with business/customer accounts, phone verification, and session management.

## Core Components
- **AuthProvider**: Main authentication context
- **useAuth**: Authentication hook
- **useAuthState**: State management
- **useAuthMethods**: Login/logout/signup methods

## Key Functions

### Login Process
```typescript
const login = async (email: string, password: string): Promise<LoginResult>
```
- Validates credentials via Supabase Auth
- Handles incomplete registration detection
- Returns phone verification needs if account incomplete

### Signup Process
```typescript
const signup = async (signupData: SignupData): Promise<{ success: boolean; error?: string }>
```
- Creates new user account
- Sends email verification
- Handles business vs customer differentiation

### Profile Management
```typescript
const updateProfile = async (updates: Partial<User>): Promise<void>
```
- Updates user profile information
- Syncs with database
- Updates local state

## Common Issues & Solutions

### Issue 1: User Not Found But Profile Exists
**Symptoms**: Login fails but profile exists in database
**Cause**: User created profile but didn't complete auth signup
**Solution**: Check for phone verification needs, redirect to verification

### Issue 2: Session Not Persisting
**Symptoms**: User gets logged out on page refresh
**Cause**: Auth state listener not properly initialized
**Solution**: Ensure auth state listener is set up before session check

### Issue 3: Profile Data Not Loading
**Symptoms**: currentUser is null despite valid session
**Cause**: Profile initialization failing
**Solution**: Check initUserData function, ensure proper error handling

## Testing Checklist
- [ ] Login with valid credentials works
- [ ] Signup creates account and sends verification
- [ ] Phone verification completes registration
- [ ] Profile updates persist
- [ ] Session persists across page refreshes
- [ ] Logout clears all state
