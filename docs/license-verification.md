
# License Verification System Documentation

## Overview
Real-time business license verification system that validates licenses against state databases and assigns verified badges to legitimate businesses.

## Core Components

### Main Files
- `src/utils/verification/index.ts` - Main verification logic
- `src/utils/realLicenseVerification.ts` - State database integration
- `src/hooks/useBusinessVerification.ts` - Verification workflow management (262 lines - consider refactoring)
- `src/components/verification/InstantVerificationSection.tsx` - UI for instant verification
- `src/pages/VerifyLicense.tsx` - Manual verification form page

### Verification Types

#### Automatic (Real-time) Verification
**Process:**
1. User provides license number and type
2. System determines appropriate state database
3. API call to state licensing authority
4. Real-time validation result
5. Immediate verified badge assignment

**Supported License Types:**
- EIN (Federal tax ID)
- Contractor licenses (state-specific)
- Professional licenses (varies by state)
- Business licenses (municipal/state)

#### Manual Verification
**Fallback Process:**
1. Automatic verification fails or unavailable
2. User submits detailed verification request
3. Manual review by system administrators
4. Email notification of verification status
5. Badge assignment upon approval

## Database Integration

### business_info Table
```sql
- id: uuid (references profiles.id)
- business_name: text
- license_number: text
- license_type: text (ein, contractor, professional, etc.)
- license_state: text
- verified: boolean
- license_status: text (Active, Inactive, Expired)
- additional_info: text
```

### verification_requests Table
```sql
- id: uuid
- user_id: uuid
- business_name: text
- primary_license: text
- license_type: text
- status: text (pending, approved, rejected)
- verification_token: uuid
- verified_at: timestamp
```

## State Database Integration

### Supported States
Current implementation includes connectors for:
- California (CSLB for contractors)
- Texas (State licensing database)
- Florida (Professional licensing)
- New York (State business registry)

### API Endpoints
Each state requires specific API integration:
- Authentication methods vary by state
- Rate limiting considerations
- Data format standardization
- Error handling for service outages

## Verification Logic Flow

### verifyBusinessId() Function
```typescript
export const verifyBusinessId = async (
  businessId: string, 
  businessType: string,
  state: string
): Promise<VerificationResult>
```

**Process:**
1. Clean and format license number
2. Determine verification method based on type/state
3. Call appropriate state database API
4. Parse and standardize response
5. Return verification result with details

### Error Handling
- Network timeouts (30-second limit)
- Invalid license formats
- State database unavailability
- Rate limiting responses
- Authentication failures

## UI Components

### InstantVerificationSection
- Triggers real-time verification
- Shows verification progress
- Displays success/failure results
- Updates business_info table immediately

### VerificationFormWrapper
- Manual verification form
- File upload for supporting documents
- Progress tracking
- Email notification preferences

### VerificationSuccessPopup
- Congratulations messaging
- Verification details display
- Verified badge preview
- Navigation to profile

## Verified Badge System

### Badge Assignment
**Criteria for Verified Status:**
- Real-time verification success
- Manual verification approval
- Active license status
- Current contact information

### Badge Display
- Profile pages show verified badge
- Review listings highlight verified businesses
- Search results prioritize verified businesses
- Public verification status API

### Badge Management
- Automatic removal if license expires
- Re-verification requirements
- Manual override capabilities
- Status change notifications

## Edge Functions

### verify-business
**Purpose:** Real-time license verification
**Input:** `{ licenseNumber, licenseType, state, businessName }`
**Output:** `{ verified, details, isRealVerification }`

### send-verification-request
**Purpose:** Manual verification submission
**Input:** `{ userInfo, formData }`
**Output:** `{ success, requestId }`

## Testing & Development

### Mock Verification
- Development mode fallback
- Configurable success/failure rates
- Standardized test license numbers
- State database simulation

### Production Testing
- Sandbox accounts with state databases
- Rate limiting compliance
- Error scenario testing
- Performance benchmarking

## Security Considerations

### Data Protection
- License numbers encrypted at rest
- Secure API communication (HTTPS)
- Access logging for verification attempts
- Compliance with state privacy requirements

### Fraud Prevention
- Verification attempt rate limiting
- Suspicious pattern detection
- Cross-reference with known valid licenses
- Manual review triggers

## Performance Optimization

### Caching Strategy
- Verification results cached for 24 hours
- State database response caching
- Failed verification cooldown periods
- Batch processing for bulk verifications

### Rate Limiting
- Per-user verification limits
- State database API rate compliance
- Graceful degradation during outages
- Queue system for high-volume periods

## Configuration

### Required Secrets
- State database API keys
- Authentication credentials
- Rate limiting parameters
- Notification service keys

### Environment Variables
- Verification service endpoints
- Timeout configurations
- Cache duration settings
- Debug mode flags

## Monitoring & Analytics

### Success Metrics
- Verification success rate by state
- Average verification time
- Manual vs automatic verification ratio
- User satisfaction scores

### Error Tracking
- State database service availability
- API timeout frequency
- Invalid license number patterns
- User abandonment rates

## Future Enhancements

### Planned Features
- Additional state database integrations
- International license verification
- Bulk business verification
- Automated license renewal notifications
- Integration with business registration services

### Technical Improvements
- GraphQL API for verification status
- Real-time WebSocket updates
- Machine learning for fraud detection
- Blockchain verification registry
- Mobile app integration

## Troubleshooting Guide

### Common Issues
1. **State Database Unavailable**
   - Fallback to manual verification
   - Notify user of temporary issue
   - Queue for retry when service restored

2. **Invalid License Format**
   - Format validation before API call
   - User guidance on correct format
   - Examples by license type and state

3. **Rate Limiting Exceeded**
   - Queue verification requests
   - Notify user of delay
   - Implement backoff strategy

4. **Verification Conflicts**
   - Manual review process
   - Business owner notification
   - Appeal mechanism

### Support Procedures
- Escalation path for verification disputes
- Documentation requirements
- Response time commitments
- Status communication protocols
