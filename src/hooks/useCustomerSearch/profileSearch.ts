
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

  // Get all customer profiles first, then we'll do intelligent filtering in JavaScript
  const { data: allProfiles, error } = await profileQuery;
  
  if (error) {
    console.error("Profile search error:", error);
    throw error;
  }

  if (!allProfiles || allProfiles.length === 0) {
    return [];
  }

  // Format phone and zip for search by removing non-digit characters
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanZip = zipCode ? zipCode.replace(/\D/g, '') : '';

  // Score each profile based on how well it matches the search criteria
  const scoredProfiles = allProfiles.map(profile => {
    let score = 0;
    let matches = 0;
    
    // Name matching with fuzzy logic
    if (firstName || lastName) {
      const searchName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
      const profileName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').toLowerCase();
      
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
      
      // Check for house number match - safely handle regex match results
      const addressMatches = address.match(/\d+/g);
      const profileMatches = profile.address.match(/\d+/g);
      const addressNumbers: string[] = addressMatches || [];
      const profileNumbers: string[] = profileMatches || [];
      
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
};
