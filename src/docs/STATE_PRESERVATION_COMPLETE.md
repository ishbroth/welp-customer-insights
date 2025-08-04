# Complete State Preservation Documentation

## Overview
Complete snapshot of the Welp application state as of 2025-08-04.
This document preserves all visual, functional, and architectural aspects for potential restoration.

## Visual Design System Preservation

### Color Palette (HSL Values)
```css
/* Light Mode Colors */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 260 76% 74%;
--primary-foreground: 0 0% 100%;
--secondary: 260 32% 54%;
--secondary-foreground: 0 0% 100%;
--accent: 260 100% 94%;
--accent-foreground: 260 32% 54%;
--destructive: 0 84.2% 60.2%;
--border: 214.3 31.8% 91.4%;
--ring: 260 76% 74%;

/* Dark Mode Colors */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 260 76% 74%;
--secondary: 260 32% 54%;
--accent: 260 20% 25%;
--accent-foreground: 260 100% 94%;
--border: 217.2 32.6% 17.5%;
```

### Brand-Specific Design Elements
```css
/* Welp Brand Colors */
.welp-gradient { @apply bg-[#ea384c] text-white; }
.welp-button { @apply bg-[#ea384c] hover:bg-[#d02e40] text-white font-semibold py-2 px-4 rounded-md; }
.welp-input { @apply border-2 border-gray-300 rounded-md px-3 py-2 focus:ring-[#ea384c]; }
.welp-card { @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg; }
```

### Typography & Layout
- Font: System fonts with Tailwind defaults
- Radius: 0.5rem global border radius
- Container: Responsive with proper padding
- Spacing: Consistent 4-unit spacing system

## Critical Loading Screen Animation
```tsx
// EXACT SPECIFICATIONS - DO NOT MODIFY
<svg width="200" height="200" viewBox="0 0 200 200">
  <g transform="translate(100, 100) rotate(12)">
    {/* 5 asterisk arms at specific rotations: 0°, 72°, 144°, 216°, plus period at 288° */}
    {/* Background: #ea384c red */}
    {/* Arms: white with CSS animations */}
    {/* Period: white circle at specific position */}
  </g>
</svg>
```

## Functional State Preservation

### Search System Configuration
```typescript
// CRITICAL: Search scoring thresholds
SIMILARITY_THRESHOLD: 0.7
CITY_SIMILARITY_THRESHOLD: 0.6
MINIMUM_SCORE_MULTI_FIELD: 4.0
MINIMUM_MATCHES_MULTI_FIELD: 2
```

### Authentication System State
```typescript
// Current auth flow configuration
- Email verification required
- Phone verification via SMS
- Profile creation after verification
- Session persistence enabled
- RLS policies active
```

### Navigation & Route Protection
```typescript
// Current route structure preserved
Public: /, /login, /signup, /verify-email, /customer-benefits, /search
Private: /profile, /profile/edit, /profile/reviews, /notifications
Business: /profile/business-reviews, /profile/billing
```

## Component Architecture Preservation

### Key Component Structure
```
Header (sticky navigation)
├── Brand logo with tagline
├── Search link (business users only)
├── Post Review (business users only)
├── User profile with avatar
└── Mobile responsive menu

SearchBox (main search interface)
├── Form fields with validation
├── Google Maps integration
├── State management via useSearchForm
└── Address component extraction

LoadingScreen (page transitions)
├── Fixed overlay with brand background
├── Asterisk animation (12° tilt)
└── Context-controlled visibility
```

### Hook Dependencies
```typescript
// Critical hooks and their exact behavior
useAuth() - Authentication state management
useCustomerSearch() - Search functionality with scoring
useSearchForm() - Form state and validation
usePhoneVerification() - SMS verification flow
useLoading() - Page transition loading
```

### Database Schema State
```sql
-- Key tables and their current structure
profiles: User account information
business_info: Business-specific data
reviews: Customer review data with scoring
phone_verifications: SMS verification codes
credits: User credit balances
subscriptions: Subscription management
```

## Performance Baseline
- Initial load: ~2-3 seconds
- Search results: ~1-2 seconds
- Page transitions: ~500ms with loading screen
- Bundle size: ~2MB (current dependencies)

## Dependencies Snapshot (package.json v0.0.0)
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "@supabase/supabase-js": "^2.49.4",
  "@tanstack/react-query": "^5.56.2",
  "@radix-ui/*": "Latest stable versions",
  "tailwindcss": "^3.4.11",
  "zod": "^3.23.8"
}
```

## Critical Configuration Files
- tailwind.config.ts: Color system and responsive breakpoints
- src/index.css: Design tokens and component classes
- src/App.tsx: Provider hierarchy and routing setup
- vite.config.ts: Build configuration (if exists)

## Business Logic Preservation

### Search Algorithm
- Multi-field fuzzy matching
- Scoring system with configurable thresholds
- Geographic proximity calculations
- Profile + review data merging
- Exact word match prioritization

### User Access Control
- Customer: Basic search, limited results
- Business: Full search, post reviews, business features
- Admin: All permissions

### Payment Integration
- Stripe integration for subscriptions
- Credit-based system for individual access
- Subscription tiers with different features

## Testing State
- All core functionalities working
- Search returning expected results
- Authentication flow complete
- Payment processing functional
- Mobile responsiveness verified

## Restoration Instructions
1. Copy all design tokens to index.css exactly
2. Restore component structure as documented
3. Implement search configuration with exact thresholds
4. Verify loading screen animation matches specifications
5. Test all authentication flows
6. Confirm payment integration functionality

---
**Document Created**: 2025-08-04
**Application Version**: Perfect State (User Confirmed)
**Purpose**: Complete restoration capability for future reference