
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Types for our app
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Response = Database['public']['Tables']['responses']['Row'];

// User search function that works with Supabase
export async function searchUsers(params: Record<string, string>) {
  let query = supabase
    .from('profiles')
    .select('*');

  // Apply filters based on search params
  if (params.firstName && params.firstName.trim()) {
    query = query.ilike('first_name', `%${params.firstName.trim()}%`);
  }
  
  if (params.lastName && params.lastName.trim()) {
    query = query.ilike('last_name', `%${params.lastName.trim()}%`);
  }
  
  if (params.phone && params.phone.trim()) {
    query = query.ilike('phone', `%${params.phone.trim()}%`);
  }
  
  if (params.address && params.address.trim()) {
    // Use only the first word of the address for searching
    const firstWordOfAddress = params.address.trim().split(/\s+/)[0];
    query = query.ilike('address', `%${firstWordOfAddress}%`);
  }
  
  if (params.city && params.city.trim()) {
    query = query.ilike('city', `%${params.city.trim()}%`);
  }
  
  if (params.state && params.state !== '') {
    query = query.eq('state', params.state);
  }
  
  if (params.zipCode && params.zipCode.trim()) {
    query = query.ilike('zipcode', `%${params.zipCode.trim()}%`);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error searching users:', error);
    throw error;
  }
  
  return data || [];
}

// Function to get reviews for a specific customer
export async function getCustomerReviews(customerId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      business: business_id (
        id,
        name
      ),
      responses (
        *,
        profile: profiles (
          id,
          name
        )
      )
    `)
    .eq('customer_id', customerId);
    
  if (error) {
    console.error('Error fetching customer reviews:', error);
    throw error;
  }
  
  return data || [];
}

// Function to create a new review
export async function createReview(reviewData: {
  business_id: string,
  customer_id: string,
  content: string,
  rating: number
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([reviewData])
    .select();
    
  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }
  
  return data?.[0];
}

// Function to update a review
export async function updateReview(
  reviewId: string, 
  updates: {
    content?: string,
    rating?: number
  }
) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select();
    
  if (error) {
    console.error('Error updating review:', error);
    throw error;
  }
  
  return data?.[0];
}

// Function to delete a review
export async function deleteReview(reviewId: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);
    
  if (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
  
  return true;
}

// Function to create a response to a review
export async function createResponse(responseData: {
  review_id: string,
  content: string
}) {
  const { data, error } = await supabase
    .from('responses')
    .insert([responseData])
    .select();
    
  if (error) {
    console.error('Error creating response:', error);
    throw error;
  }
  
  return data?.[0];
}

// Function to update a response
export async function updateResponse(
  responseId: string,
  updates: {
    content: string
  }
) {
  const { data, error } = await supabase
    .from('responses')
    .update(updates)
    .eq('id', responseId)
    .select();
    
  if (error) {
    console.error('Error updating response:', error);
    throw error;
  }
  
  return data?.[0];
}

// Function to delete a response
export async function deleteResponse(responseId: string) {
  const { error } = await supabase
    .from('responses')
    .delete()
    .eq('id', responseId);
    
  if (error) {
    console.error('Error deleting response:', error);
    throw error;
  }
  
  return true;
}

// Check subscription status
export async function checkSubscriptionStatus(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('Error checking subscription:', error);
    throw error;
  }
  
  return data && data.length > 0;
}
