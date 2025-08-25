# Technical Specification - Application Snapshot
*Date: 2025-01-30*

## System Architecture

### Technology Stack
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **Routing**: React Router DOM 6.26.2
- **Form Management**: React Hook Form 7.53.0 with Zod validation
- **State Management**: React Context + Custom Hooks
- **HTTP Client**: Supabase JavaScript client
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Deno runtime
- **Payment Processing**: Stripe
- **SMS Service**: AWS SNS (primary) + Twilio (fallback)

### Database Schema Overview

#### Core Tables
1. **profiles** - User profile information
2. **business_info** - Business-specific information
3. **reviews** - Customer reviews
4. **review_photos** - Review photo attachments
5. **credits** - User credit balances
6. **credit_transactions** - Credit transaction history
7. **subscriptions** - User subscription information
8. **verification_codes** - Phone verification codes
9. **verification_requests** - Manual verification requests
10. **notifications_log** - Notification history
11. **notification_preferences** - User notification settings

#### Authentication Tables (Supabase managed)
- **auth.users** - Core user authentication
- **auth.sessions** - User sessions

#### Storage Buckets
- **review-photos** - Review image uploads
- **avatars** - User profile pictures
- **documents** - Business documents

### Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form components
│   ├── verification/   # Verification-related components
│   └── signup/         # Signup flow components
├── contexts/           # React contexts
│   └── auth/          # Authentication context
├── hooks/             # Custom React hooks
│   ├── useCredits.ts
│   ├── useCustomerSearch/
│   └── useNotifications.ts
├── pages/             # Page components
│   ├── profile/       # Profile management pages
│   └── signup/        # Registration pages
├── services/          # Business logic services
├── utils/             # Utility functions
│   └── verification/  # License verification utilities
├── types/             # TypeScript type definitions
└── integrations/      # External service integrations
    └── supabase/      # Supabase client and types
```

### Edge Functions

#### Authentication & Registration
- **create-profile** - Creates user profiles during registration
- **send-verification-code** - Sends SMS verification codes
- **verify-phone-code** - Validates SMS codes and activates accounts

#### Business Verification
- **verify-business** - Real-time license verification
- **check-duplicates** - Prevents duplicate account creation
- **send-verification-request** - Manual verification requests

#### Payment & Credits
- **process-credit-purchase** - Handles Stripe credit purchases
- **create-checkout-session** - Creates Stripe checkout sessions
- **stripe-webhook** - Processes Stripe webhooks

#### Notifications
- **send-email-notification** - Email notification service
- **send-push-notification** - Push notification service

### Security Implementation

#### Row Level Security (RLS)
- **Enabled on all tables** with appropriate policies
- **User isolation** - Users can only access their own data
- **Role-based access** - Different access levels for customer/business/admin
- **Public read access** where appropriate (reviews, business listings)

#### Data Validation
- **Client-side validation** using Zod schemas
- **Server-side validation** in edge functions
- **Database constraints** for data integrity
- **Input sanitization** to prevent XSS

#### Authentication Security
- **JWT tokens** managed by Supabase
- **Session persistence** with automatic refresh
- **Password requirements** enforced
- **Email verification** required for activation

### API Integration Points

#### External Services
- **Stripe** - Payment processing
  - Checkout sessions
  - Webhook processing
  - Subscription management
- **AWS SNS** - Primary SMS service
- **Twilio** - Fallback SMS service
- **State License Databases** - Real-time verification

#### Internal APIs
- **Supabase REST API** - Database operations
- **Supabase Auth API** - Authentication
- **Supabase Storage API** - File uploads
- **Edge Functions** - Custom business logic

### Performance Considerations

#### Database Optimization
- **Indexed columns** on frequently queried fields
- **Efficient queries** with proper joins and filtering
- **Connection pooling** managed by Supabase
- **Query optimization** for search functionality

#### Frontend Optimization
- **Code splitting** with React.lazy
- **Memoization** of expensive computations
- **Debounced inputs** for search and form validation
- **Lazy loading** of images and components

#### Caching Strategy
- **Browser caching** for static assets
- **Application caching** for user session data
- **Query caching** with React Query patterns
- **CDN caching** through Supabase

### Error Handling Strategy

#### Client-Side Error Handling
- **Error boundaries** for component-level errors
- **Try-catch blocks** for async operations
- **User-friendly error messages** via toast notifications
- **Graceful degradation** for non-critical features

#### Server-Side Error Handling
- **Structured error responses** from edge functions
- **Error logging** for debugging
- **Retry mechanisms** for transient failures
- **Fallback services** for critical operations

### Testing Strategy

#### Component Testing
- **Unit tests** for utility functions
- **Component tests** for UI components
- **Integration tests** for user flows
- **E2E tests** for critical paths

#### API Testing
- **Edge function testing** with test data
- **Database operation testing** with RLS validation
- **External service mocking** for reliable tests
- **Performance testing** for scalability

### Deployment Architecture

#### Frontend Deployment
- **Static site hosting**
- **CDN distribution** for global performance
- **Environment-based configuration**
- **Automated deployment** on code changes

#### Backend Deployment
- **Supabase hosting** for database and auth
- **Edge function deployment** via Supabase CLI
- **Database migrations** for schema changes
- **Monitoring and logging** via Supabase dashboard

### Monitoring & Analytics

#### Application Monitoring
- **Error tracking** via console logs
- **Performance monitoring** via browser tools
- **User behavior tracking** via application events
- **Business metrics** via custom analytics

#### Infrastructure Monitoring
- **Database performance** via Supabase dashboard
- **Edge function logs** via Supabase
- **API response times** monitoring
- **Uptime monitoring** for critical services

### Security Compliance

#### Data Protection
- **GDPR compliance** considerations
- **Data encryption** at rest and in transit
- **Secure data transmission** via HTTPS
- **PII handling** with appropriate safeguards

#### Access Control
- **Authentication required** for sensitive operations
- **Authorization checks** at multiple levels
- **Audit trails** for sensitive operations
- **Rate limiting** to prevent abuse

### Scalability Considerations

#### Horizontal Scaling
- **Stateless application design**
- **Database read replicas** capability
- **CDN distribution** for global reach
- **Load balancing** at infrastructure level

#### Vertical Scaling
- **Database performance tuning**
- **Query optimization** for efficiency
- **Resource monitoring** and alerting
- **Capacity planning** for growth

This technical specification represents the complete current state of the application as of January 30, 2025.