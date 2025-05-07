
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/supabase";

/**
 * Search for businesses by name or category
 */
export const searchBusinesses = async (query: string, filters?: { category?: string, location?: string }) => {
  let queryBuilder = supabase
    .from('profiles')
    .select(`
      *,
      business_info:id (*)
    `)
    .eq('type', 'business');

  if (query) {
    // Try to match against business name if available
    queryBuilder = queryBuilder.or(`business_info.business_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
  }

  if (filters?.category) {
    queryBuilder = queryBuilder.ilike('business_info.license_type', `%${filters.category}%`);
  }

  if (filters?.location) {
    queryBuilder = queryBuilder.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,zipcode.ilike.%${filters.location}%`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error("Error searching businesses:", error);
    throw error;
  }

  return data || [];
};

/**
 * Search for customers by name or location
 */
export const searchCustomers = async (query: string, filters?: { location?: string }) => {
  let queryBuilder = supabase
    .from('profiles')
    .select('*')
    .eq('type', 'customer');

  if (query) {
    queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,name.ilike.%${query}%`);
  }

  if (filters?.location) {
    queryBuilder = queryBuilder.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,zipcode.ilike.%${filters.location}%`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error("Error searching customers:", error);
    throw error;
  }

  return data || [];
};

/**
 * Search for reviews by business or customer
 */
export const searchReviews = async (params: { businessId?: string, customerId?: string }) => {
  const { businessId, customerId } = params;
  
  let queryBuilder = supabase.from('reviews').select('*');
  
  if (businessId) {
    queryBuilder = queryBuilder.eq('business_id', businessId);
  }
  
  if (customerId) {
    queryBuilder = queryBuilder.eq('customer_id', customerId);
  }
  
  const { data, error } = await queryBuilder;
  
  if (error) {
    console.error("Error searching reviews:", error);
    throw error;
  }
  
  return data;
};

// Functions for search history
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error getting search history:", error);
    return [];
  }
};

export const addToSearchHistory = (query: string) => {
  try {
    const history = getSearchHistory();
    // Add the new query at the beginning and limit to 10 items
    const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    return newHistory;
  } catch (error) {
    console.error("Error adding to search history:", error);
    return [];
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('searchHistory');
    return [];
  } catch (error) {
    console.error("Error clearing search history:", error);
    return [];
  }
};
