
import { supabase } from "@/integrations/supabase/client";
import { SearchParams, ReviewData } from "./types";

export const searchReviews = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, zipCode } = searchParams;

  console.log("Searching reviews table...");
  let reviewQuery = supabase
    .from('reviews')
    .select('id, customer_name, customer_address, customer_city, customer_zipcode, customer_phone, rating')
    .limit(50);
  
  // Add filters for each provided parameter for reviews
  if (firstName || lastName) {
    const nameSearch = [firstName, lastName].filter(Boolean).join(' ');
    if (nameSearch) {
      reviewQuery = reviewQuery.ilike('customer_name', `%${nameSearch}%`);
    }
  }
  
  // Format phone for search by removing non-digit characters
  const formattedPhone = phone ? phone.replace(/\D/g, '') : '';
  if (formattedPhone) {
    reviewQuery = reviewQuery.ilike('customer_phone', `%${formattedPhone}%`);
  }
  
  if (address) {
    // Extract first word of address for search
    const firstWordOfAddress = address.trim().split(/\s+/)[0];
    reviewQuery = reviewQuery.ilike('customer_address', `%${firstWordOfAddress}%`);
  }
  
  if (city) {
    reviewQuery = reviewQuery.ilike('customer_city', `%${city}%`);
  }
  
  if (zipCode) {
    reviewQuery = reviewQuery.ilike('customer_zipcode', `%${zipCode}%`);
  }
  
  const { data: reviewsData, error: reviewError } = await reviewQuery;

  if (reviewError) {
    console.error("Review search error:", reviewError);
    throw reviewError;
  }
  
  console.log("Review search results:", reviewsData);
  return reviewsData as ReviewData[] || [];
};
