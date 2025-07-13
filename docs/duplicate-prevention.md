
# Duplicate Account Prevention System Documentation

## Overview
Comprehensive system to prevent duplicate user accounts by checking email addresses and phone numbers across business and customer account types during registration.

## Core Components

### Main Files
- `src/services/duplicateAccount/` - Duplicate checking services
- `src/hooks/useCustomerDuplicateCheck.ts` - Customer duplicate detection
- `src/hooks/useBusinessDuplicateCheck.ts` - Business duplicate detection  
- `src/components/signup/DuplicateAccountDialog.tsx` - User notification dialog
- `supabase/functions/check-duplicates/` - Edge function for validation

### Duplicate Detection Methods

#### Real-time Validation
**Triggers:**
- Email field blur event (500ms debounce)
- Phone number field change (500ms debounce)
- Form submission attempt
- Account creation initiation

**Validation Scope:**
- Email uniqueness across all account types
- Phone number uniqueness within account type
- Cross-reference with existing profiles
- Check against unverified accounts

#### Edge Function Integration
**check-duplicates Function:**
```typescript
Input: {
  email: string,
  phone: string,
  businessName?: string,
  licenseNumber?: string,
  accountType: 'business' | 'customer'
}

Output: {
  isDuplicate: boolean,
  duplicateType: 'email' | 'phone' | 'both',
  existingEmail?: string,
  existingPhone?: string,
  allowContinue: boolean
}
```

## Database Queries

### Email Duplicate Check
```sql
SELECT id, email, type 
FROM profiles 
WHERE email = $1 
  AND id != $2
LIMIT 1;
```

### Phone Duplicate Check
```sql
SELECT id, phone, type 
FROM profiles 
WHERE phone = $1 
  AND type = $2 
  AND id != $3
LIMIT 1;
```

### Comprehensive Duplicate Check
- Combines email and phone validation
- Account type specific logic
- Unverified account handling
- Business name similarity checking

## User Experience Flow

### Duplicate Detection Response
1. **Email Duplicate Found**
   - Show dialog: "Account with email exists"
   - Options: Sign in, Reset password, Use different email
   - Block registration until resolved

2. **Phone Duplicate Found**
   - Show dialog: "Phone number already registered"
   - Options: Sign in, Use different number
   - Account type specific messaging

3. **Business Name Similarity**
   - Warning about similar business names
   - Option to continue or modify name
   - Manual verification may be required

### Dialog Actions

#### DuplicateAccountDialog Component
**Available Actions:**
- **Sign In**: Redirect to login page with pre-filled email
- **Reset Password**: Open password reset dialog
- **Use Different Info**: Close dialog, allow form editing
- **Contact Support**: Link to support system

#### PasswordResetDialog Component
- Integrated password reset flow
- Email sending via edge function
- Status feedback to user
- Return to signup option

## Prevention Strategies

### Email Validation
- Format validation (RFC 5322 compliance)
- Domain verification
- Disposable email detection
- Corporate email preferences

### Phone Number Validation
- E.164 format standardization
- Country code handling
- Invalid number detection
- VoIP/virtual number identification

### Business-Specific Validation
- License number uniqueness
- Business name similarity analysis
- Address verification
- EIN duplicate prevention

## Error Handling

### Network Issues
- Offline detection
- Retry mechanisms
- Fallback validation
- User notification

### Service Outages
- Graceful degradation
- Local validation fallback
- Error message customization
- Recovery procedures

### Edge Cases
- Partial form submissions
- Race conditions
- Concurrent registrations
- Data synchronization issues

## Security Considerations

### Data Protection
- Minimal data transmission
- Secure hash comparisons
- No sensitive data logging
- GDPR compliance measures

### Rate Limiting
- Duplicate check frequency limits
- IP-based restrictions
- Account creation throttling
- Abuse prevention measures

## Performance Optimization

### Caching Strategy
- Recent check results caching
- Database query optimization
- Index utilization
- Memory management

### Debouncing
- Input validation delays
- API call optimization
- User experience smoothing
- Resource conservation

## Testing Scenarios

### Duplicate Prevention Testing
1. **Same Email Registration**
   - Business and customer accounts
   - Verified and unverified accounts
   - Active and inactive accounts

2. **Same Phone Registration**
   - Within same account type
   - Cross account type scenarios
   - International number formats

3. **Edge Cases**
   - Concurrent registration attempts
   - Network connectivity issues
   - Partial form submissions
   - Browser refresh scenarios

## Configuration

### Validation Rules
- Email uniqueness scope
- Phone number sharing policies
- Business name similarity thresholds
- Account type restrictions

### User Interface
- Dialog appearance timing
- Message customization
- Action button configuration
- Accessibility options

## Analytics & Monitoring

### Prevention Metrics
- Duplicate detection rate
- User response to dialogs
- Registration abandonment
- False positive rates

### System Performance
- Validation response times
- Database query efficiency
- Edge function execution
- Error occurrence frequency

## Integration Points

### Authentication System
- Existing account identification
- Login redirection
- Session management
- Password reset integration

### Registration Flow
- Form validation integration
- Progress interruption handling
- Data preservation
- User guidance

### Notification System
- Email alerts for duplicates
- Admin notifications
- User communication
- Status updates

## Maintenance Procedures

### Data Cleanup
- Orphaned account removal
- Unverified account expiration
- Duplicate data consolidation
- Archive management

### System Updates
- Validation rule modifications
- Performance optimizations
- Security enhancements
- Feature additions

## API Documentation

### Duplicate Check Endpoints
```typescript
POST /functions/v1/check-duplicates
POST /functions/v1/check-email-exists
POST /functions/v1/check-phone-exists
```

### Response Formats
```typescript
interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType?: 'email' | 'phone' | 'business';
  existingEmail?: string;
  existingPhone?: string;
  allowContinue: boolean;
  suggestedActions?: string[];
}
```

## Troubleshooting Guide

### Common Issues
1. **False Positives**
   - Data normalization problems
   - Case sensitivity issues
   - Special character handling
   - Format inconsistencies

2. **Performance Problems**
   - Slow database queries
   - Edge function timeouts
   - High API call volume
   - Memory usage spikes

3. **User Experience Issues**
   - Dialog timing problems
   - Confusing error messages
   - Action button failures
   - Mobile responsiveness

### Resolution Procedures
- Step-by-step troubleshooting
- Log analysis techniques
- Performance profiling
- User support escalation
