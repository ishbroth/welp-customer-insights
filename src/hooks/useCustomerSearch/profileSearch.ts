
import { supabase } from "@/integrations/supabase/client";
import { SearchParams, ProfileCustomer } from "./types";

export const searchProfiles = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("Searching profiles table...");
  let profileQuery = supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, address, city, state, zipcode')
    .eq('type', 'customer')
    .limit(50);
  
  // Add filters for each provided parameter for profiles
  if (firstName) {
    profileQuery = profileQuery.ilike('first_name', `%${firstName}%`);
  }
  
  if (lastName) {
    profileQuery = profileQuery.ilike('last_name', `%${lastName}%`);
  }
  
  // Format phone for search by removing non-digit characters
  const formattedPhone = phone ? phone.replace(/\D/g, '') : '';
  if (formattedPhone) {
    profileQuery = profileQuery.ilike('phone', `%${formattedPhone}%`);
  }
  
  if (address) {
    // Extract first word of address for search
    const firstWordOfAddress = address.trim().split(/\s+/)[0];
    profileQuery = profileQuery.ilike('address', `%${firstWordOfAddress}%`);
  }
  
  if (city) {
    profileQuery = profileQuery.ilike('city', `%${city}%`);
  }
  
  if (state) {
    profileQuery = profileQuery.ilike('state', `%${state}%`);
  }
  
  if (zipCode) {
    profileQuery = profileQuery.ilike('zipcode', `%${zipCode}%`);
  }
  
  const { data: profilesData, error: profileError } = await profileQuery;

  if (profileError) {
    console.error("Profile search error:", profileError);
    throw profileError;
  }
  
  console.log("Profile search results:", profilesData);
  return profilesData as ProfileCustomer[] || [];
};
