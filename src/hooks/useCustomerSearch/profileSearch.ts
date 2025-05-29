
import { supabase } from "@/integrations/supabase/client";
import { SearchParams, ProfileCustomer } from "./types";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

// State mapping for flexible state search
const stateMap: { [key: string]: string[] } = {
  'AL': ['AL', 'Alabama'],
  'AK': ['AK', 'Alaska'],
  'AZ': ['AZ', 'Arizona'],
  'AR': ['AR', 'Arkansas'],
  'CA': ['CA', 'California'],
  'CO': ['CO', 'Colorado'],
  'CT': ['CT', 'Connecticut'],
  'DE': ['DE', 'Delaware'],
  'FL': ['FL', 'Florida'],
  'GA': ['GA', 'Georgia'],
  'HI': ['HI', 'Hawaii'],
  'ID': ['ID', 'Idaho'],
  'IL': ['IL', 'Illinois'],
  'IN': ['IN', 'Indiana'],
  'IA': ['IA', 'Iowa'],
  'KS': ['KS', 'Kansas'],
  'KY': ['KY', 'Kentucky'],
  'LA': ['LA', 'Louisiana'],
  'ME': ['ME', 'Maine'],
  'MD': ['MD', 'Maryland'],
  'MA': ['MA', 'Massachusetts'],
  'MI': ['MI', 'Michigan'],
  'MN': ['MN', 'Minnesota'],
  'MS': ['MS', 'Mississippi'],
  'MO': ['MO', 'Missouri'],
  'MT': ['MT', 'Montana'],
  'NE': ['NE', 'Nebraska'],
  'NV': ['NV', 'Nevada'],
  'NH': ['NH', 'New Hampshire'],
  'NJ': ['NJ', 'New Jersey'],
  'NM': ['NM', 'New Mexico'],
  'NY': ['NY', 'New York'],
  'NC': ['NC', 'North Carolina'],
  'ND': ['ND', 'North Dakota'],
  'OH': ['OH', 'Ohio'],
  'OK': ['OK', 'Oklahoma'],
  'OR': ['OR', 'Oregon'],
  'PA': ['PA', 'Pennsylvania'],
  'RI': ['RI', 'Rhode Island'],
  'SC': ['SC', 'South Carolina'],
  'SD': ['SD', 'South Dakota'],
  'TN': ['TN', 'Tennessee'],
  'TX': ['TX', 'Texas'],
  'UT': ['UT', 'Utah'],
  'VT': ['VT', 'Vermont'],
  'VA': ['VA', 'Virginia'],
  'WA': ['WA', 'Washington'],
  'WV': ['WV', 'West Virginia'],
  'WI': ['WI', 'Wisconsin'],
  'WY': ['WY', 'Wyoming'],
  'DC': ['DC', 'District of Columbia']
};

export const searchProfiles = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("Searching profiles table with flexible matching...");
  
  // Start with a broader query - we'll filter more intelligently in JavaScript
  let profileQuery = supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, address, city, state, zipcode')
    .eq('type', 'customer')
    .limit(500); // Increased limit for broader search

  // For state-only searches, add a more targeted filter using both abbreviation and full name
  if (state && !firstName && !lastName && !phone && !address && !city && !zipCode) {
    const stateVariants = stateMap[state] || [state];
    console.log(`Searching for state variants: ${stateVariants.join(', ')}`);
    
    // Use OR condition to search for either abbreviation or full name
    profileQuery = profileQuery.or(
      stateVariants.map(variant => `state.ilike.%${variant}%`).join(',')
    );
  }

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

  // Check if this is a single field search
  const searchFields = [firstName, lastName, phone, address, city, state, zipCode].filter(Boolean);
  const isSingleFieldSearch = searchFields.length === 1;

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
    
    // Improved state matching - check against both abbreviation and full name
    if (state && profile.state) {
      const stateVariants = stateMap[state] || [state];
      let stateMatch = false;
      
      for (const variant of stateVariants) {
        if (profile.state.toLowerCase().includes(variant.toLowerCase()) || 
            variant.toLowerCase().includes(profile.state.toLowerCase()) ||
            calculateStringSimilarity(variant.toLowerCase(), profile.state.toLowerCase()) > 0.3) {
          stateMatch = true;
          break;
        }
      }
      
      if (stateMatch) {
        // Give higher score if this is a state-only search
        score += isSingleFieldSearch ? 10 : 2;
        matches++;
      }
    }
    
    // Zip code matching
    if (cleanZip && profile.zipcode) {
      const profileZip = profile.zipcode.replace(/\D/g, '');
      if (profileZip.startsWith(cleanZip) || profileZip.includes(cleanZip) || cleanZip.includes(profileZip)) {
        score += 2;
        matches++;
      }
    }
    
    return { ...profile, searchScore: score, matchCount: matches };
  });
  
  // For single field searches, be very lenient - return anything with any match
  let minScore = 0.1;
  if (isSingleFieldSearch) {
    minScore = 0; // Return anything with any score at all for single field searches
  }
  
  const filteredProfiles = scoredProfiles
    .filter(profile => profile.searchScore > minScore || profile.matchCount > 0)
    .sort((a, b) => {
      // Sort by match count first, then by score
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.searchScore - a.searchScore;
    })
    .slice(0, 100); // Increased final results limit
  
  console.log("Flexible profile search results:", filteredProfiles.length);
  return filteredProfiles as ProfileCustomer[];
};
