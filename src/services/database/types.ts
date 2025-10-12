/**
 * Database types and interfaces
 * Based on Supabase schema but cleaned up for application use
 */

// Re-export base types from Supabase
export type { Database, Json } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';

// Table row types (extract from Supabase types)
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type BusinessInfo = Database['public']['Tables']['business_info']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationMessage = Database['public']['Tables']['conversation_messages']['Row'];
export type ReviewResponse = Database['public']['Tables']['review_responses']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
export type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];

// Insert types (for creating new records)
export type InsertReview = Database['public']['Tables']['reviews']['Insert'];
export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertBusinessInfo = Database['public']['Tables']['business_info']['Insert'];
export type InsertConversation = Database['public']['Tables']['conversations']['Insert'];
export type InsertConversationMessage = Database['public']['Tables']['conversation_messages']['Insert'];
export type InsertReviewResponse = Database['public']['Tables']['review_responses']['Insert'];
export type InsertSubscription = Database['public']['Tables']['subscriptions']['Insert'];
export type InsertCreditTransaction = Database['public']['Tables']['credit_transactions']['Insert'];
export type InsertNotificationPreferences = Database['public']['Tables']['notification_preferences']['Insert'];

// Update types (for updating existing records)
export type UpdateReview = Database['public']['Tables']['reviews']['Update'];
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateBusinessInfo = Database['public']['Tables']['business_info']['Update'];
export type UpdateConversation = Database['public']['Tables']['conversations']['Update'];
export type UpdateConversationMessage = Database['public']['Tables']['conversation_messages']['Update'];
export type UpdateReviewResponse = Database['public']['Tables']['review_responses']['Update'];
export type UpdateSubscription = Database['public']['Tables']['subscriptions']['Update'];
export type UpdateCreditTransaction = Database['public']['Tables']['credit_transactions']['Update'];
export type UpdateNotificationPreferences = Database['public']['Tables']['notification_preferences']['Update'];

// Query helper types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
}

export interface PaginationResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  page?: number;
  pageSize?: number;
}

export interface SearchOptions extends QueryOptions {
  searchTerm?: string;
  filters?: Record<string, any>;
}

// Composite types for joined queries
export type ReviewWithBusiness = Review & {
  business?: Profile;
};

export type ConversationWithMessages = Conversation & {
  messages?: ConversationMessage[];
};

export type ProfileWithBusinessInfo = Profile & {
  business_info?: BusinessInfo;
};
