/**
 * Database services - Main export
 *
 * Usage:
 *   import { reviewsService, usersService } from '@/services/database';
 *   const review = await reviewsService.getById(id);
 */

// Export services
export { reviewsService } from './domains/reviews.service';
export { usersService } from './domains/users.service';

// Export types
export type {
  Review,
  Profile,
  BusinessInfo,
  Conversation,
  ConversationMessage,
  ReviewResponse,
  Subscription,
  CreditTransaction,
  NotificationPreferences,
  InsertReview,
  InsertProfile,
  InsertBusinessInfo,
  InsertConversation,
  InsertConversationMessage,
  InsertReviewResponse,
  InsertSubscription,
  InsertCreditTransaction,
  InsertNotificationPreferences,
  UpdateReview,
  UpdateProfile,
  UpdateBusinessInfo,
  UpdateConversation,
  UpdateConversationMessage,
  UpdateReviewResponse,
  UpdateSubscription,
  UpdateCreditTransaction,
  UpdateNotificationPreferences,
  QueryOptions,
  PaginationResult,
  SearchOptions,
  ReviewWithBusiness,
  ConversationWithMessages,
  ProfileWithBusinessInfo
} from './types';

// Export errors
export {
  DatabaseError,
  NotFoundError,
  ValidationError,
  DuplicateError,
  UnauthorizedError
} from './errors';

// Export database client (for advanced usage)
export { db } from './client';

// Export query builder utilities
export { QueryBuilder } from './utils/queryBuilder';
