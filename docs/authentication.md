
# Authentication System Documentation

## Overview
Comprehensive authentication system built on Supabase Auth supporting email/password authentication, profile management, and role-based access control.

## Core Components

### Main Files
- `src/contexts/auth/AuthContext.tsx` - Main authentication context
- `src/contexts/auth/AuthProvider.tsx` - Authentication provider wrapper
- `src/pages/Login.tsx` - Login interface
- `src/pages/Signup.tsx` - Registration interface
- `src/hooks/useAuth.ts` - Authentication hook
- `src/components/auth/` - Authentication components

### Authentication Context

#### AuthContext Features
```typescript
interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (userData: SignUpData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
}
```

#### Session Management
- Automatic session persistence
- Token refresh handling
- Session state synchronization
- Multi-tab session management

### User Registration

#### Account Types
- **Business Accounts**: Full verification required
- **Customer Accounts**: Basic registration
- **Admin Accounts**: Special privileges

#### Registration Flow
1. Account type selection
2. Personal information collection
3. Business verification (if applicable)
4. Password setup
5. Phone verification
6. Account activation

#### Data Collection
- Personal information (name, email, phone)
- Address information
- Business details (for business accounts)
- License information (for verification)

### Login System

#### Authentication Methods
- Email/password authentication
- Password reset capability
- Account recovery options
- Session remember functionality

#### Login Flow
1. Email/password input
2. Credential validation
3. Session establishment
4. Profile data loading
5. Route redirection

#### Security Features
- Rate limiting on login attempts
- Secure password handling
- Session token management
- CSRF protection

### Profile Integration

#### Profile Creation
- Automatic profile creation on signup
- Profile data population
- Business information setup
- Verification status initialization

#### Profile Updates
- Real-time profile synchronization
- Business information updates
- Verification status changes
- Avatar management

### Role-Based Access Control

#### User Roles
- **Customer**: Basic access to reviews and profiles
- **Business**: Review creation and management
- **Admin**: Full system access and management

#### Permission Management
- Route-level access control
- Component-level permissions
- Feature flag management
- Dynamic permission checking

### Password Management

#### Password Requirements
- Minimum 6 characters
- Strong password recommendations
- Password confirmation validation
- Secure password storage

#### Password Reset
- Email-based reset flow
- Secure reset token generation
- Time-limited reset links
- Password change confirmation

### Session Security

#### Token Management
- JWT token handling
- Automatic token refresh
- Token expiration management
- Secure token storage

#### Session Validation
- Real-time session checking
- Cross-tab session sync
- Session timeout handling
- Invalid session cleanup

### Database Integration

#### User Data Storage
- Supabase Auth integration
- Profile table synchronization
- Business information linking
- Verification status tracking

#### Row-Level Security
- User-specific data access
- Business data isolation
- Admin privilege enforcement
- Guest access restrictions

### Error Handling

#### Authentication Errors
- Invalid credentials
- Account not found
- Email not verified
- Password reset failures
- Network connectivity issues

#### Recovery Mechanisms
- Graceful error messaging
- Retry mechanisms
- Fallback authentication
- User guidance

### Security Measures

#### Data Protection
- Encrypted data transmission
- Secure password hashing
- Session token encryption
- Personal data protection

#### Attack Prevention
- SQL injection prevention
- XSS protection
- CSRF protection
- Brute force protection

### Multi-Device Support

#### Session Synchronization
- Cross-device session management
- Real-time session updates
- Device-specific settings
- Session conflict resolution

#### Mobile Integration
- Responsive authentication UI
- Mobile-optimized flows
- Touch-friendly interfaces
- App integration support

## Implementation Details

### AuthProvider Setup
```typescript
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
};
```

### Protected Route Implementation
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/login" />;
  
  return <>{children}</>;
};
```

### Authentication Hook Usage
```typescript
const LoginComponent = () => {
  const { signIn, loading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      // Handle login error
    } else {
      // Successful login
    }
  };
};
```

## Testing Considerations

### Authentication Testing
1. **Login Flow Testing**
   - Valid credential login
   - Invalid credential handling
   - Password reset functionality
   - Session persistence

2. **Registration Testing**
   - Account creation flow
   - Email verification
   - Profile data setup
   - Business verification

3. **Security Testing**
   - Session timeout handling
   - Cross-site scripting prevention
   - SQL injection prevention
   - Rate limiting validation

## Performance Optimization

### Authentication Performance
- Lazy loading of auth components
- Optimized session checking
- Efficient state management
- Minimal re-renders

### Caching Strategy
- Session data caching
- Profile information caching
- Permission caching
- Route access caching

## Monitoring and Analytics

### Authentication Metrics
- Login success rates
- Registration conversion
- Password reset frequency
- Session duration analytics

### Security Monitoring
- Failed login attempts
- Suspicious activity detection
- Session anomaly detection
- Security event logging

## Configuration Options

### Authentication Settings
- Session timeout duration
- Password complexity requirements
- Email verification settings
- Multi-factor authentication

### UI Customization
- Login form styling
- Registration flow customization
- Error message customization
- Branding integration

## Future Enhancements

### Planned Features
- Social login integration
- Multi-factor authentication
- Biometric authentication
- Single sign-on (SSO)

### Technical Improvements
- Enhanced security measures
- Performance optimizations
- Mobile app integration
- Advanced session management

## Troubleshooting Guide

### Common Issues
1. **Session Persistence Problems**
   - Check local storage settings
   - Verify Supabase configuration
   - Review token expiration
   - Check browser compatibility

2. **Registration Failures**
   - Verify email settings
   - Check database permissions
   - Review validation rules
   - Check network connectivity

3. **Login Errors**
   - Validate credentials
   - Check account status
   - Review error logs
   - Verify authentication flow

## API Documentation

### Authentication Methods
```typescript
// Sign in user
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
});

// Sign up user
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: `${window.location.origin}/`
  }
});

// Sign out user
const { error } = await supabase.auth.signOut();
```

### Session Management
```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state changes
});
```
