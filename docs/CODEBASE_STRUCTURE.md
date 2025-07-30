# Codebase Structure Documentation

## 📁 Project Architecture

### Root Structure
```
├── src/                          # Main source code
├── public/                       # Static assets
├── docs/                         # Documentation files
├── supabase/                     # Database migrations and config
├── components.json               # shadcn/ui configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## 🎯 Source Code Organization (`src/`)

### Core Application Files
```
src/
├── main.tsx                     # Application entry point
├── App.tsx                      # Root app component with routing
├── index.css                    # Global styles and design tokens
└── vite-env.d.ts               # Vite type definitions
```

### Component Architecture
```
src/components/
├── ui/                          # Base UI components (shadcn/ui)
│   ├── button.tsx              # Button component with variants
│   ├── input.tsx               # Form input components
│   ├── dialog.tsx              # Modal dialog components
│   ├── toast.tsx               # Notification toast system
│   └── [20+ other UI components]
│
├── profile/                     # Profile-related components
│   ├── hooks/                  # Profile-specific hooks
│   │   ├── useProfileReviewsData.ts    # Review data processing
│   │   └── useProfileReviewsActions.ts # Review action handlers
│   ├── ProfileHeader.tsx       # Profile page header
│   ├── ReviewsList.tsx         # Reviews listing component
│   └── [other profile components]
│
├── auth/                       # Authentication components
├── reviews/                    # Review management components
├── credits/                    # Credit system components
└── LoadingScreen.tsx          # App loading screen
```

### Custom Hooks (`src/hooks/`)
```
src/hooks/
├── useAuth.ts                  # Authentication state management
├── useCredits.ts              # Credit balance and transactions
├── useReviewAccess.ts         # Review unlock and access control
├── useReviewClaims.ts         # Global review claiming system
├── useReviewMatching.ts       # Customer-review matching logic
└── [other specialized hooks]
```

### Context Providers (`src/contexts/`)
```
src/contexts/
├── auth.tsx                   # Authentication context
└── [other context providers]
```

### Page Components (`src/pages/`)
```
src/pages/
├── Index.tsx                  # Landing/home page
├── Profile.tsx               # User profile page
├── Credits.tsx               # Credit management page
├── Reviews.tsx               # Review management page
└── [other page components]
```

### Integration Layer (`src/integrations/`)
```
src/integrations/
└── supabase/
    ├── client.ts             # Supabase client configuration
    └── types.ts              # Auto-generated database types
```

### Utility Functions (`src/lib/`)
```
src/lib/
├── utils.ts                  # Common utility functions
└── [other utility modules]
```

## 🎨 Design System Implementation

### Tailwind Configuration (`tailwind.config.ts`)
- **Custom Color Palette**: HSL-based semantic color tokens
- **Typography Scale**: Consistent font sizing and spacing
- **Component Variants**: Design system integration
- **Responsive Breakpoints**: Mobile-first responsive design
- **Animation System**: Custom animations and transitions

### Global Styles (`src/index.css`)
```css
/* CSS Custom Properties (Design Tokens) */
:root {
  --background: [HSL values];
  --foreground: [HSL values];
  --primary: [HSL values];
  --primary-foreground: [HSL values];
  /* 50+ semantic color tokens */
}

/* Component Base Styles */
/* Typography Scale */
/* Animation Keyframes */
/* Utility Classes */
```

### Component Patterns

#### UI Components (shadcn/ui based)
- **Composable Architecture**: Small, reusable components
- **Variant System**: Multiple styles per component using CVA
- **Accessibility**: ARIA compliance and keyboard navigation
- **TypeScript**: Full type safety with proper interfaces

#### Business Logic Components
- **Container/Presentation Pattern**: Separated logic and UI
- **Custom Hooks**: Reusable business logic
- **Error Boundaries**: Graceful error handling
- **Loading States**: Consistent loading UI patterns

## 🔧 Core Hooks Deep Dive

### `useCredits.ts`
```typescript
// Credit management functionality
- loadCreditsData(): Fetch balance and transactions
- processSuccessfulPurchase(): Handle Stripe payment completion
- useCredits(): Consume credits for review access
- Real-time balance updates
- Transaction history management
```

### `useReviewAccess.ts`
```typescript
// Review access control
- isReviewUnlocked(): Check if user can access review
- addUnlockedReview(): Claim review with credit deduction
- refreshAccess(): Reload user's accessible reviews
- Persistent access management
```

### `useReviewClaims.ts`
```typescript
// Global review claiming system
- claimReview(): Atomic review claiming operation
- getUserClaimedReviews(): Fetch user's claimed reviews
- isReviewClaimedByUser(): Check claim status
- Conflict prevention and error handling
```

### `useReviewMatching.ts`
```typescript
// Intelligent customer-review matching
- checkReviewMatch(): Compare customer data with review
- Fuzzy string matching algorithms
- Confidence scoring (0-100%)
- Multi-criteria matching (name, phone, address, etc.)
```

## 🗃️ Database Integration

### Supabase Client (`src/integrations/supabase/client.ts`)
- **Configuration**: Project URL and API keys
- **Authentication**: User session management
- **Real-time**: Live data subscriptions
- **Storage**: File upload and management

### Type Safety (`src/integrations/supabase/types.ts`)
- **Auto-generated**: Types from database schema
- **Full Coverage**: All tables, views, and functions
- **Type Guards**: Runtime type checking
- **IntelliSense**: IDE integration and autocomplete

## 🛠️ Development Tools

### TypeScript Configuration
- **Strict Mode**: Maximum type safety
- **Path Mapping**: Clean import statements
- **Build Optimization**: Efficient compilation
- **IDE Integration**: Full development support

### Build System (Vite)
- **Fast Development**: Hot module replacement
- **Optimized Builds**: Tree shaking and minification
- **Asset Processing**: Image optimization and bundling
- **Plugin Ecosystem**: Rich plugin support

### Code Quality
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Component Testing**: Unit and integration tests

## 📦 Dependencies & Packages

### Core Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "latest",
  "vite": "latest",
  "@supabase/supabase-js": "^2.49.4"
}
```

### UI & Styling
```json
{
  "tailwindcss": "latest",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.7.1",
  "lucide-react": "^0.462.0"
}
```

### Form & Validation
```json
{
  "react-hook-form": "^7.53.0",
  "@hookform/resolvers": "^3.9.0",
  "zod": "^3.23.8"
}
```

### Additional Features
```json
{
  "react-router-dom": "^6.26.2",
  "date-fns": "^3.6.0",
  "recharts": "^2.12.7",
  "sonner": "^1.5.0"
}
```

## 🔄 Data Flow Architecture

### State Management Pattern
```
User Action → Hook → Supabase → Database → Response → Hook → UI Update
```

### Authentication Flow
```
Login → Supabase Auth → JWT Token → Context Provider → Protected Routes
```

### Credit System Flow
```
Purchase → Stripe → Webhook → Supabase Function → Database Update → UI Refresh
```

### Review Access Flow
```
Claim Request → Credit Check → Atomic Claim → Database Update → Persistent Access
```

## 🚀 Performance Considerations

### Code Splitting
- **Route-based**: Lazy loading of page components
- **Feature-based**: Dynamic imports for large features
- **Library-based**: Vendor bundle optimization

### Optimization Strategies
- **React.memo**: Component memoization
- **useMemo/useCallback**: Hook optimization
- **Image Lazy Loading**: Performance optimization
- **Bundle Analysis**: Size monitoring and optimization

This codebase structure represents a well-organized, scalable React application with modern development practices and comprehensive feature implementation.