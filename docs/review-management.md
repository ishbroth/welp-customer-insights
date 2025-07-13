
# Review Management System Documentation

## Overview
Comprehensive review system allowing businesses to create, edit, and manage customer reviews with photo support, claiming functionality, and response capabilities.

## Core Components

### Main Files
- `src/pages/CreateReview.tsx` - Review creation interface
- `src/pages/Reviews.tsx` - Review listing and management
- `src/components/reviews/` - Review-related components
- `src/hooks/useReviewSubmission.ts` - Review submission logic
- `src/services/reviewService.ts` - Review API operations

### Review Data Structure

#### reviews Table
```sql
- id: uuid (primary key)
- business_id: uuid (reviewer - business owner)
- customer_id: uuid (subject - customer, nullable)
- customer_name: text (if not registered user)
- customer_phone: text
- customer_address: text
- customer_city: text
- customer_zipcode: text
- rating: integer (1-5 stars)
- content: text (review description)
- claimed_at: timestamp (when customer claimed)
- claimed_by: uuid (customer who claimed it)
- created_at: timestamp
- updated_at: timestamp
- deleted_at: timestamp (soft delete)
```

#### review_photos Table
```sql
- id: uuid (primary key)
- review_id: uuid (references reviews.id)
- photo_url: text (Supabase Storage URL)
- caption: text (optional photo description)
- display_order: integer (photo ordering)
- created_at: timestamp
```

### Review Creation Flow

#### Step 1: Customer Information
- Customer name input
- Phone number with formatting
- Address information collection
- Existing customer detection

#### Step 2: Review Content
- Star rating selection (1-5)
- Detailed review text
- Photo upload capability
- Review preview

#### Step 3: Submission
- Data validation and sanitization
- Database insertion
- Photo processing and storage
- Success confirmation

### Photo Management

#### Upload Process
- File validation (size, format)
- Image compression and optimization
- Secure upload to Supabase Storage
- URL generation and database storage

#### Photo Display
- Responsive image galleries
- Lightbox viewing capability
- Caption support
- Ordering and organization

### Customer Claiming System

#### Claim Process
1. Customer finds their review
2. Verification process (phone/email)
3. Account creation or login
4. Review ownership transfer
5. Response capability activation

#### Claim Verification
- Phone number matching
- Email verification (if available)
- Address verification
- Manual admin approval (fallback)

### Review Responses

#### Customer Responses
- Claimed customers can respond
- Rich text response editing
- Response history tracking
- Notification to business owner

#### Business Counter-Responses
- Business owners can reply to responses
- Conversation threading
- Response moderation
- Public visibility controls

### Review Editing and Management

#### Business Owner Capabilities
- Edit own reviews (within time limits)
- Delete reviews (soft delete)
- Add/remove photos
- Update customer information

#### Review Status Management
- Draft, published, archived states
- Review visibility controls
- Deletion and restoration
- Audit trail maintenance

### Search and Filtering

#### Review Discovery
- Customer name search
- Date range filtering
- Rating-based filtering
- Location-based search

#### Business Analytics
- Review statistics dashboard
- Rating trend analysis
- Customer interaction metrics
- Response rate tracking

### Notification System

#### Review Notifications
- New review alerts for businesses
- Claim notifications for customers
- Response notifications
- Review update alerts

#### Email Integration
- Review summary emails
- Claim verification emails
- Response notification emails
- Weekly/monthly digests

### Access Control and Security

#### Row-Level Security
- Business owners see only their reviews
- Customers see only claimed reviews
- Admin access to all reviews
- Guest access restrictions

#### Data Privacy
- Customer information protection
- Review content moderation
- Photo privacy controls
- Right to deletion compliance

### Review Moderation

#### Content Filtering
- Inappropriate content detection
- Spam prevention
- Fake review identification
- Community reporting system

#### Administrative Controls
- Review approval workflows
- Content moderation tools
- User behavior monitoring
- Violation handling procedures

## API Integration

### Review CRUD Operations
```typescript
// Create new review
const { data, error } = await supabase
  .from('reviews')
  .insert({
    business_id: user.id,
    customer_name: customerData.name,
    customer_phone: customerData.phone,
    rating: reviewData.rating,
    content: reviewData.content
  });

// Fetch business reviews
const { data: reviews } = await supabase
  .from('reviews')
  .select(`
    *,
    review_photos(*),
    responses(*)
  `)
  .eq('business_id', businessId)
  .order('created_at', { ascending: false });
```

### Photo Upload API
```typescript
// Upload review photo
const { data, error } = await supabase.storage
  .from('review-photos')
  .upload(`${reviewId}/${fileName}`, file);

// Insert photo record
const { error: dbError } = await supabase
  .from('review_photos')
  .insert({
    review_id: reviewId,
    photo_url: photoUrl,
    display_order: order
  });
```

## Performance Optimization

### Database Optimization
- Indexed columns for fast queries
- Pagination for large result sets
- Efficient joins for related data
- Query result caching

### Image Optimization
- Automatic image compression
- Multiple resolution variants
- Lazy loading implementation
- CDN delivery optimization

### User Experience
- Progressive form submission
- Real-time preview updates
- Optimistic UI updates
- Error recovery mechanisms

## Testing Scenarios

### Review Creation Testing
1. **Complete Flow Testing**
   - Customer information validation
   - Review content submission
   - Photo upload functionality
   - Success confirmation

2. **Edge Case Testing**
   - Duplicate customer detection
   - Network interruption handling
   - Large file upload testing
   - Concurrent submission handling

3. **Integration Testing**
   - Database consistency verification
   - Photo storage verification
   - Notification delivery testing
   - Search functionality testing

## Security Considerations

### Input Validation
- Review content sanitization
- Photo file validation
- Customer data verification
- SQL injection prevention

### Access Control
- Review ownership verification
- Photo access permissions
- Admin privilege verification
- Guest access limitations

## Future Enhancements

### Planned Features
- Video review support
- Review templates
- Bulk review operations
- Advanced analytics dashboard
- Integration with external platforms

### Technical Improvements
- Real-time review updates
- Advanced search capabilities
- Machine learning content analysis
- Mobile app integration
- API rate limiting

## Troubleshooting Guide

### Common Issues
1. **Photo Upload Failures**
   - Check file size and format
   - Verify storage permissions
   - Review network connectivity
   - Check browser compatibility

2. **Review Submission Errors**
   - Validate required fields
   - Check authentication status
   - Verify database permissions
   - Review error logs

3. **Claiming Process Issues**
   - Verify customer information
   - Check verification methods
   - Review claim status
   - Validate permissions
