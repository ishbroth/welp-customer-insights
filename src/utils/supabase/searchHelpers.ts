
import { supabase } from "@/integrations/supabase/client";
import type { SearchParams } from "@/types/supabase";

/**
 * Search for customers by various parameters
 * @param params Search parameters
 * @param requestingUserType The type of user making the request (business, customer, admin)
 */
export const searchCustomers = async (params: SearchParams, requestingUserType?: string) => {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      reviews!customer_id(
        id,
        rating,
        content,
        created_at,
        business:business_id(
          id,
          profiles!business_id(
            first_name,
            last_name
          ),
          business_info!id(
            business_name
          )
        )
      )
    `)
    .eq('type', 'customer');

  // Apply filters based on provided parameters
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
    query = query.ilike('address', `%${params.address.trim()}%`);
  }
  
  if (params.city && params.city.trim()) {
    query = query.ilike('city', `%${params.city.trim()}%`);
  }
  
  if (params.state && params.state.trim()) {
    query = query.ilike('state', `%${params.state.trim()}%`);
  }
  
  if (params.zipCode && params.zipCode.trim()) {
    query = query.ilike('zipcode', `%${params.zipCode.trim()}%`);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error searching for customers:", error);
    throw error;
  }
  
  // TypeScript fix: Ensure we return an array even if data is null
  if (!data) {
    return [];
  }
  
  // If the requesting user is a customer, remove address information from 
  // any business profiles that might be included in the nested data
  if (requestingUserType === 'customer' && Array.isArray(data)) {
    return data.map(customer => {
      // Remove address from reviews where the business profile is included
      if (customer.reviews && Array.isArray(customer.reviews)) {
        customer.reviews = customer.reviews.map(review => {
          if (review.business && review.business.profiles) {
            // Remove address information from the business profile
            delete review.business.profiles.address;
          }
          return review;
        });
      }
      return customer;
    });
  }
  
  return data;
};
