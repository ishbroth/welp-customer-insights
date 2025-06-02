
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
    .limit(500); // Increased limit for broader search

  // For state searches, use a simpler and more reliable approach
  if (state && state.trim() !== '') {
    console.log(`Searching for state: ${state}`);
    
    // Use a simpler ilike query for state - this should be more reliable
    profileQuery = profileQuery.ilike('state', `%${state}%`);
  }

  const { data: allProfiles, error } = await profileQuery;
  
  if (error) {
    console.error("Profile search error:", error);
    throw error;
  }

  if (!allProfiles || allProfiles.length === 0) {
    console.log("No profiles found in initial query");
    return [];
  }

  console.log(`Found ${allProfiles.length} profiles in initial query`);

  // Format phone and zip for search by removing non-digit characters
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanZip = zipCode ? zipCode.replace(/\D/g, '') : '';

  // Check if this is a single field search
  const searchFields = [firstName, lastName, phone, address, city, state, zipCode].filter(Boolean);
  const isSingleFieldSearch = searchFields.length === 1;
  const isStateOnlySearch = state && searchFields.length === 1 && searchFields[0] === state;

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
        if (similarity > 0.2) { // Very low threshold for single field searches
          score += similarity * 3;
          matches++;
        }
        
        // Also check if any word in the search matches any word in the profile name
        const searchWords = searchName.split(/\s+/);
        const profileWords = profileName.split(/\s+/);
        
        for (const searchWord of searchWords) {
          for (const profileWord of profileWords) {
            if (searchWord.length >= 2 && (profileWord.includes(searchWord) || searchWord.includes(profileWord))) {
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
      if (similarity > 0.2) { // Lower threshold
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
      if (similarity > 0.3 || profile.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(profile.city.toLowerCase())) {
        score += similarity * 1.5;
        matches++;
      }
    }
    
    // Enhanced state matching - much more flexible and reliable
    if (state && profile.state) {
      const searchStateUpper = state.toUpperCase().trim();
      const profileStateUpper = profile.state.toUpperCase().trim();
      
      // Check for exact match, contains, or abbreviation match
      const stateMatch = profileStateUpper === searchStateUpper || 
                        profileStateUpper.includes(searchStateUpper) || 
                        searchStateUpper.includes(profileStateUpper) ||
                        (searchStateUpper.length === 2 && profileStateUpper.startsWith(searchStateUpper)) ||
                        (profileStateUpper.length === 2 && searchStateUpper.startsWith(profileStateUpper));
      
      if (stateMatch) {
        // Give very high score for state-only searches, but still allow other matches
        score += isStateOnlySearch ? 100 : 5;
        matches++;
        console.log(`State match found: "${profile.state}" matches "${state}" for profile ${profile.first_name} ${profile.last_name}`);
      }
    }
    
    // Enhanced zip code matching with proximity scoring
    if (cleanZip && profile.zipcode) {
      const profileZip = profile.zipcode.replace(/\D/g, '');
      
      // Exact match gets highest priority
      if (profileZip === cleanZip) {
        score += 10; // Very high score for exact matches
        matches++;
      }
      // Check for partial matches or nearby zip codes
      else if (profileZip.startsWith(cleanZip) || cleanZip.startsWith(profileZip)) {
        score += 5; // High score for prefix matches
        matches++;
      }
      // Check for nearby zip codes (within ~20 miles approximation)
      else if (cleanZip.length >= 5 && profileZip.length >= 5) {
        const searchZipNum = parseInt(cleanZip.slice(0, 5));
        const profileZipNum = parseInt(profileZip.slice(0, 5));
        const zipDifference = Math.abs(searchZipNum - profileZipNum);
        
        // Approximate 20-mile radius using zip code ranges
        // This is a rough approximation as zip code proximity varies by region
        if (zipDifference <= 50) { // Within ~20 miles for most areas
          const proximityScore = Math.max(0, 2 - (zipDifference / 25)); // Closer zips get higher scores
          score += proximityScore;
          matches++;
        }
      }
    }
    
    return { ...profile, searchScore: score, matchCount: matches };
  });
  
  // For state-only searches, be very lenient with scoring
  let minScore = 0.1;
  if (isStateOnlySearch) {
    minScore = 0; // Return anything with any score at all for state-only searches
  }
  
  const filteredProfiles = scoredProfiles
    .filter(profile => {
      // For state-only searches, include any profile that has a state match
      if (isStateOnlySearch) {
        return profile.matchCount > 0 || profile.searchScore > 0;
      }
      return profile.searchScore > minScore || profile.matchCount > 0;
    })
    .sort((a, b) => {
      // Sort by match count first, then by score
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.searchScore - a.searchScore;
    })
    .slice(0, 100); // Increased final results limit
  
  console.log("Profile search results:", filteredProfiles.length);
  filteredProfiles.forEach(profile => {
    console.log(`Profile: ${profile.first_name} ${profile.last_name}, State: ${profile.state}, Zip: ${profile.zipcode}, Score: ${profile.searchScore}, Matches: ${profile.matchCount}`);
  });
  
  return filteredProfiles as ProfileCustomer[];
};
