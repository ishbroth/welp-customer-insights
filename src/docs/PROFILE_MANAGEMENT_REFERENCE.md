
# Profile Management System Reference

## Overview
User profile management for business and customer accounts with form validation.

## Core Components
- **ProfileForm**: Main profile editing form
- **PersonalInfoForm**: Personal information section
- **ContactInfoForm**: Contact information section
- **BusinessInfoForm**: Business-specific information

## Profile Types
- **Customer**: Basic personal and contact info
- **Business**: Personal info + business details + license info
- **Admin**: Full access to all profile features

## Key Functions

### Profile Update
```typescript
const updateProfile = async (updates: Partial<User>): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);
}
```

### Form Validation
```typescript
const form = useForm<ProfileFormValues>({
  resolver: zodResolver(profileSchema),
  defaultValues: { /* current user data */ }
});
```

## Common Issues & Solutions

### Issue 1: Profile Updates Not Saving
**Symptoms**: Form submits but changes don't persist
**Cause**: Database permissions or validation errors
**Solution**: Check RLS policies, verify field validation

### Issue 2: Business Fields Not Showing
**Symptoms**: License fields missing for business accounts
**Cause**: Account type not properly detected
**Solution**: Verify currentUser.type === 'business' or 'admin'

### Issue 3: Form Validation Errors
**Symptoms**: Valid data rejected by form
**Cause**: Schema validation too strict
**Solution**: Review profileSchema, ensure proper field types

## Testing Checklist
- [ ] Profile form loads with current data
- [ ] Updates save successfully
- [ ] Business fields show for business accounts
- [ ] Form validation works correctly
- [ ] Navigation back to profile works
- [ ] Error handling displays proper messages
