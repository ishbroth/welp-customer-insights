# Dialog and Messaging Consistency Plan

## Overview
Standardize all dialog, modal, alert, and toast patterns to ensure consistent user experience.

## Current State
- 29 dialog-related files with varying patterns
- Mix of Dialog, AlertDialog, and custom implementations
- Inconsistent button labels
- Inconsistent messaging patterns
- Toast notifications using Sonner

## Work to be Done

### 1. Create Dialog Standards
Define standard dialog types:
- **Confirmation Dialog** - Yes/No decisions
- **Alert Dialog** - Info/Warning/Error messages
- **Form Dialog** - Input collection
- **Info Dialog** - Display information
- **Loading Dialog** - Processing states

### 2. Create Standard Components
Build reusable dialog components:

#### ConfirmDialog
```tsx
<ConfirmDialog
  title="Delete Review"
  message="Are you sure you want to delete this review?"
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

#### AlertDialog
```tsx
<AlertDialog
  type="success" | "error" | "warning" | "info"
  title="Success"
  message="Your review has been submitted"
  onClose={handleClose}
/>
```

#### FormDialog
```tsx
<FormDialog
  title="Edit Profile"
  submitText="Save"
  onSubmit={handleSubmit}
>
  {/* Form fields */}
</FormDialog>
```

### 3. Messaging Utility
Create `src/lib/messaging.ts`:

```typescript
// Success messages
messaging.success(title, description)

// Error messages
messaging.error(title, description)

// Warning messages
messaging.warning(title, description)

// Info messages
messaging.info(title, description)

// Confirmation dialogs
messaging.confirm(options)

// Loading states
messaging.loading(message)
messaging.hideLoading()
```

### 4. Toast Standards
Standardize toast usage:
- Success toasts (green, checkmark)
- Error toasts (red, x icon)
- Warning toasts (yellow, warning icon)
- Info toasts (blue, info icon)
- Loading toasts (spinner)

### 5. Button Label Standards
Standardize button text:
- Confirmations: "Confirm", "Delete", "Remove", "Save"
- Cancellations: "Cancel", "Go Back", "Close"
- Affirmative: "OK", "Got it", "Continue"
- Avoid mixing styles in same dialog

### 6. Message Tone
Create tone guidelines:
- Error messages: Helpful, not blaming
- Success messages: Encouraging, specific
- Warning messages: Clear, actionable
- Info messages: Concise, relevant

### 7. Replace Existing Dialogs
Update all 29 dialog files to use standard components:
- DuplicateAccountDialog → ConfirmDialog
- PhotoEditDialog → FormDialog
- BusinessVerificationSuccessPopup → AlertDialog
- ContentRejectionDialog → AlertDialog
- Etc.

### 8. Loading States
Standardize loading indicators:
- Button loading states
- Page loading states
- Inline loading states
- Dialog loading states

## Files to Create
- `src/components/ui/confirm-dialog.tsx`
- `src/components/ui/alert-dialog-standard.tsx`
- `src/components/ui/form-dialog.tsx`
- `src/components/ui/info-dialog.tsx`
- `src/lib/messaging.ts` - Messaging utility
- `src/lib/toastConfig.ts` - Toast configuration

## Files to Update
All 29 existing dialog files:
- AccountCreatedPopup
- VerificationSuccessPopup
- DuplicateCustomerDialog
- DuplicateAccountDialog
- PhotoEditDialog
- ClaimReviewDialog
- ReviewDeleteDialog
- ResponseDeleteDialog
- ContentRejectionDialog
- And 20 more...

## Deliverables
- Consistent dialog patterns
- Reusable dialog components
- Centralized messaging utility
- User experience improvements
- Dialog usage documentation
