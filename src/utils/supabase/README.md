
# Supabase Utility Functions

This directory contains utility functions for interacting with Supabase.

## Modules

- **profileHelpers.ts** - Functions for user profile operations
- **businessHelpers.ts** - Functions for business-related operations
- **searchHelpers.ts** - Functions for search operations

## Usage

Import the functions you need:

```typescript
// Import specific utilities
import { getUserProfile, updateUserProfile } from "@/utils/supabase/profileHelpers";
import { getBusinessProfile } from "@/utils/supabase/businessHelpers";
import { searchCustomers } from "@/utils/supabase/searchHelpers";

// Or import everything from the index file
import { getUserProfile, getBusinessProfile, searchCustomers } from "@/utils/supabase";
```

For backwards compatibility, you can also import from the legacy location:

```typescript
import { getUserProfile } from "@/utils/supabaseHelpers";
```

However, this is deprecated and will be removed in a future update.
