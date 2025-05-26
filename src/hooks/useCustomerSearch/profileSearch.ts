
import { supabase } from "@/integrations/supabase/client";
import { SearchParams, ProfileCustomer } from "./types";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

export const searchProfiles = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("Searching profiles table with flexible matching...");
  
  // Start with a broader query - we'll filter more intelligently in JavaScript
  let profileQuery = supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, address, city, state, zipcode')
    .eq('type', 'customer')
    .limit(200); // Increased limit for broader search

  // Build arrays to store potential matches
  const searchCriteria = [];
  
  // Name search - more flexible
  if (firstName || lastName) {
    const nameSearch = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
    if (nameSearch.length >= 2) { // Only search if at least 2 characters
      // Search in both first_name, last_name, and name fields with partial matches
      searchCriteria.push(
        supabase.or(`first_name.ilike.%${nameSearch}%,last_name.ilike.%${nameSearch}%,name.ilike.%${nameSearch}%`)
      );
    }
  }
  
  // Phone search - very flexible
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  if (cleanPhone.length >= 3) { // At least 3 digits
    // Search for any part of the phone number
    const phonePattern = cleanPhone.slice(-10); // Last 10 digits
    const areaCode = phonePattern.slice(0, 3);
    const localNumber = phonePattern.slice(-7);
    
    searchCriteria.push(
      supabase.or(`phone.ilike.%${phonePattern}%,phone.ilike.%${areaCode}%,phone.ilike.%${localNumber}%`)
    );
  }
  
  // Address search - very flexible
  if (address && address.trim().length >= 2) {
    const addressTerms = address.toLowerCase().trim().split(/\s+/);
    const houseNumber = addressTerms.find(term => /^\d+/.test(term)); // Find house number
    const streetName = addressTerms.filter(term => !/^\d+/.test(term)).join(' '); // Street name parts
    
    if (houseNumber) {
      searchCriteria.push(supabase.ilike('address', `%${houseNumber}%`));
    }
    if (streetName.length >= 2) {
      searchCriteria.push(supabase.ilike('address', `%${streetName}%`));
    }
  }
  
  // City search - flexible
  if (city && city.trim().length >= 2) {
    searchCriteria.push(supabase.ilike('city', `%${city.trim()}%`));
  }
  
  // State search
  if (state && state.trim().length >= 2) {
    searchCriteria.push(supabase.ilike('state', `%${state.trim()}%`));
  }
  
  // Zip code search - flexible
  if (zipCode && zipCode.trim().length >= 3) {
    const cleanZip = zipCode.replace(/\D/g, '');
    if (cleanZip.length >= 3) {
      // Search for zip codes that start with the input or contain it
      searchCriteria.push(
        supabase.or(`zipcode.ilike.${cleanZip}%,zipcode.ilike.%${cleanZip}%`)
      );
    }
  }
  
  // If we have search criteria, apply them with OR logic for broader results
  if (searchCriteria.length > 0) {
    // Get all profiles first, then we'll do more intelligent filtering
    const { data: allProfiles, error } = await profileQuery;
    
    if (error) {
      console.error("Profile search error:", error);
      throw error;
    }
    
    // Now do fuzzy matching and scoring
    const scoredProfiles = (allProfiles || []).map(profile => {
      let score = 0;
      let matches = 0;
      
      // Name matching with fuzzy logic
      if (firstName || lastName) {
        const searchName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
        const profileName = [profile.first_name, profile.last_name, profile.name].filter(Boolean).join(' ').toLowerCase();
        
        if (profileName) {
          const similarity = calculateStringSimilarity(searchName, profileName);
          if (similarity > 0.4) { // Lower threshold for more matches
            score += similarity * 3; // Weight name matches heavily
            matches++;
          }
          
          // Also check if any word in the search matches any word in the profile name
          const searchWords = searchName.split(/\s+/);
          const profileWords = profileName.split(/\s+/);
          
          for (const searchWord of searchWords) {
            for (const profileWord of profileWords) {
              if (searchWord.length >= 2 && profileWord.includes(searchWord)) {
                score += 1;
                matches++;
              }
            }
          }
        }
      }
      
      // Phone matching
      if (cleanPhone && profile.phone) {
        const profilePhone = profile.phone.replace(/\D/g, '');
        if (profilePhone.includes(cleanPhone) || cleanPhone.includes(profilePhone.slice(-7))) {
          score += 2;
          matches++;
        }
      }
      
      // Address matching with fuzzy logic
      if (address && profile.address) {
        const similarity = calculateStringSimilarity(address.toLowerCase(), profile.address.toLowerCase());
        if (similarity > 0.3) {
          score += similarity * 2;
          matches++;
        }
        
        // Check for house number match
        const addressNumbers = address.match(/\d+/g) || [];
        const profileNumbers = profile.address.match(/\d+/g) || [];
        
        for (const num of addressNumbers) {
          if (profileNumbers.includes(num)) {
            score += 1.5;
            matches++;
          }
        }
      }
      
      // City matching
      if (city && profile.city) {
        const similarity = calculateStringSimilarity(city.toLowerCase(), profile.city.toLowerCase());
        if (similarity > 0.5) {
          score += similarity * 1.5;
          matches++;
        }
      }
      
      // State matching
      if (state && profile.state) {
        const similarity = calculateStringSimilarity(state.toLowerCase(), profile.state.toLowerCase());
        if (similarity > 0.6) {
          score += similarity;
          matches++;
        }
      }
      
      // Zip code matching
      if (cleanZip && profile.zipcode) {
        const profileZip = profile.zipcode.replace(/\D/g, '');
        if (profileZip.startsWith(cleanZip) || profileZip.includes(cleanZip)) {
          score += 2;
          matches++;
        }
      }
      
      return { ...profile, searchScore: score, matchCount: matches };
    });
    
    // Filter and sort by relevance
    const filteredProfiles = scoredProfiles
      .filter(profile => profile.searchScore > 0.5 || profile.matchCount > 0) // Very lenient threshold
      .sort((a, b) => {
        // Sort by match count first, then by score
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return b.searchScore - a.searchScore;
      })
      .slice(0, 50); // Limit final results
    
    console.log("Flexible profile search results:", filteredProfiles.length);
    return filteredProfiles as ProfileCustomer[];
  }
  
  // If no search criteria, return empty array
  return [];
};
