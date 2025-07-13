
# Profile Management System Documentation

## Overview
Complete user profile management system supporting both business and customer account types with real-time data synchronization and comprehensive form validation.

## Core Components

### Main Files
- `src/pages/Profile.tsx` - Main profile display page
- `src/pages/EditProfile.tsx` - Profile editing interface
- `src/components/profile/ProfileForm.tsx` - Main profile form component
- `src/components/profile/PersonalInfoForm.tsx` - Personal information section
- `src/components/profile/ContactInfoForm.tsx` - Contact information section
- `src/components/profile/BusinessInfoForm.tsx` - Business-specific information
- `src/contexts/auth/` - Authentication context with profile management

### Profile Data Structure

#### Customer Profiles
- Basic personal information (name, email, phone)
- Address details (street, city, state, zip code)
- Profile bio and avatar
- Account preferences

#### Business Profiles
- All customer profile fields
- Business-specific information:
  - Business name and license details
  - License type and verification status
  - Business address (can differ from personal)
  - Professional credentials

### Database Integration

#### profiles Table
```sql
- id: uuid (primary key, references auth.users)
- name: text (full name)
- email: text (contact email)
- phone: text (formatted phone number)
- address: text (street address)
- city: text
- state: text
- zipcode: text
- bio: text (profile description)
- avatar: text (profile image URL)
- type: text (business|customer|admin)
- business_id: text (EIN or license number)
- verified: boolean (verification status)
```

#### business_info Table
```sql
- id: uuid (references profiles.id)
- business_name: text
- license_number: text
- license_type: text
- license_state: text
- verified: boolean
- license_status: text
- additional_info: text
```

### Form Validation

#### Validation Schema (Zod)
- Email format validation
- Phone number formatting
- Required field validation
- Business-specific field requirements
- Address format validation

#### Real-time Validation
- Field-level validation on blur
- Form-level validation on submit
- Error message display
- Success feedback

### Profile Updates

#### Update Process
1. Form data collection and validation
2. Data transformation and formatting
3. Database update via Supabase
4. Real-time UI feedback
5. Navigation to profile view

#### Data Synchronization
- Immediate UI updates
- Context state synchronization
- Database persistence
- Error handling and rollback

### Authentication Integration

#### Profile Creation
- Automatic profile creation on signup
- Initial data population from auth metadata
- Business vs customer differentiation
- Verification status initialization

#### Profile Access Control
- Row-level security policies
- User can only edit own profile
- Admin override capabilities
- Guest access restrictions

### Business Profile Features

#### License Information Management
- License type selection
- License number validation
- State-specific requirements
- Verification status display

#### Verification Integration
- Real-time verification badge display
- Verification status updates
- Manual verification requests
- Verification history tracking

### Avatar Management

#### Image Upload
- File size and format validation
- Image compression and optimization
- Secure storage in Supabase Storage
- URL generation and management

#### Avatar Display
- Fallback to initials
- Responsive sizing
- Consistent styling across app
- Accessibility compliance

### Error Handling

#### Common Scenarios
1. **Network Connectivity Issues**
   - Offline detection and messaging
   - Retry mechanisms
   - Data preservation

2. **Validation Errors**
   - Field-specific error messages
   - Form-level error display
   - User guidance for corrections

3. **Permission Errors**
   - Access control enforcement
   - Clear error messaging
   - Appropriate redirects

### Performance Optimization

#### Form Performance
- Debounced validation
- Lazy loading of form sections
- Optimized re-rendering
- Memory management

#### Data Loading
- Efficient database queries
- Caching strategies
- Progressive enhancement
- Loading state management

## Testing Considerations

### Profile Form Testing
1. **Field Validation**
   - Required field enforcement
   - Format validation (email, phone)
   - Character limits and restrictions
   - Cross-field validation

2. **Business Profile Testing**
   - License information accuracy
   - Verification status updates
   - Business-specific field requirements
   - State-dependent validations

3. **Update Process Testing**
   - Successful update scenarios
   - Error handling and recovery
   - Concurrent update handling
   - Data consistency verification

## Security Considerations

### Data Protection
- Sensitive information encryption
- Secure data transmission
- Access logging
- Privacy compliance

### Input Validation
- Server-side validation
- SQL injection prevention
- XSS protection
- File upload security

## Future Enhancements

### Planned Features
- Multiple contact methods
- Social media integration
- Professional certifications
- Team member management (for businesses)

### Technical Improvements
- Real-time collaborative editing
- Advanced image editing
- Bulk profile operations
- API integration for business data

## API Endpoints

### Profile Management
```typescript
// Get user profile with business info
const { data: profile } = await supabase
  .from('profiles')
  .select(`
    *, 
    business_info(*)
  `)
  .eq('id', userId)
  .single();

// Update profile information
const { error } = await supabase
  .from('profiles')
  .update(profileData)
  .eq('id', userId);
```

## Configuration Options

### Form Customization
- Field visibility controls
- Validation rule configuration
- Business type specific fields
- Regional customizations

### UI Customization
- Theme and styling options
- Layout configurations
- Accessibility settings
- Mobile responsiveness

## Troubleshooting

### Common Issues
1. **Profile Data Not Saving**
   - Check user authentication
   - Verify database permissions
   - Review validation errors
   - Check network connectivity

2. **Business Information Missing**
   - Verify account type
   - Check business_info table sync
   - Review form field mappings
   - Validate license data format

3. **Avatar Upload Failures**
   - Check file size limits
   - Verify storage permissions
   - Review file format support
   - Check network timeouts
