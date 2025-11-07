
import { supabase } from "@/integrations/supabase/client";
import { SearchParams, ProfileCustomer } from "./types";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('ProfileSearch');

export const searchProfiles = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  hookLogger.debug("Searching profiles table with combined OR filtering...");

  // COMBINED OR FILTERING STRATEGY
  // Build a single query using ALL provided fields with OR logic
  // This casts a wide net, then client-side fuzzy matching validates precisely
  // All provided fields are included to maximize chances of finding relevant records

  const baseSelect = 'id, first_name, last_name, phone, address, city, state, zipcode';

  // Build array of OR conditions based on provided fields
  const orConditions: string[] = [];
  const appliedFilters: string[] = [];

  // Add phone condition if provided
  if (phone && phone.trim() !== '') {
    const cleanPhone = phone.replace(/\D/g, '');
    orConditions.push(`phone.ilike.%${cleanPhone}%`);
    appliedFilters.push(`phone: ${cleanPhone}`);
  }

  // Add address condition if provided
  if (address && address.trim() !== '') {
    orConditions.push(`address.ilike.%${address}%`);
    appliedFilters.push(`address: ${address}`);
  }

  // Add name conditions if provided
  if (firstName && firstName.trim() !== '') {
    orConditions.push(`first_name.ilike.%${firstName}%`);
    appliedFilters.push(`firstName: ${firstName}`);
  }
  if (lastName && lastName.trim() !== '') {
    orConditions.push(`last_name.ilike.%${lastName}%`);
    appliedFilters.push(`lastName: ${lastName}`);
  }

  // Add city condition if provided
  if (city && city.trim() !== '') {
    orConditions.push(`city.ilike.%${city}%`);
    appliedFilters.push(`city: ${city}`);
  }

  // Add state condition if provided
  if (state && state.trim() !== '') {
    orConditions.push(`state.ilike.%${state}%`);
    appliedFilters.push(`state: ${state}`);
  }

  // Add zipcode condition if provided
  if (zipCode && zipCode.trim() !== '') {
    const cleanZip = zipCode.replace(/\D/g, '');
    orConditions.push(`zipcode.ilike.%${cleanZip}%`);
    appliedFilters.push(`zipcode: ${cleanZip}`);
  }

  let allProfiles: any[] = [];
  let error = null;

  // Execute query with OR conditions
  if (orConditions.length > 0) {
    hookLogger.debug(`🔍 Building combined OR query with ${orConditions.length} conditions: ${appliedFilters.join(', ')}`);

    const { data, error: queryError } = await supabase
      .from('profiles')
      .select(baseSelect)
      .eq('type', 'customer')
      .or(orConditions.join(','))
      .limit(500);

    if (queryError) {
      error = queryError;
      hookLogger.error('Query error:', queryError);
    } else {
      allProfiles = data || [];
      hookLogger.debug(`✅ Combined OR query returned ${allProfiles.length} results`);
    }
  } else {
    // No search criteria provided - fetch first 500 records
    hookLogger.debug(`🔍 No search criteria provided, fetching first 500 records`);

    const { data, error: fallbackError } = await supabase
      .from('profiles')
      .select(baseSelect)
      .eq('type', 'customer')
      .limit(500);

    if (fallbackError) {
      error = fallbackError;
    } else {
      allProfiles = data || [];
      hookLogger.debug(`📊 Fallback fetch: ${allProfiles.length} records`);
    }
  }

  hookLogger.debug(`🎯 Database query complete: ${allProfiles.length} profiles fetched`);
  
  if (error) {
    hookLogger.error("Profile search error:", error);
    throw error;
  }

  if (!allProfiles || allProfiles.length === 0) {
    hookLogger.debug("No profiles found in initial query");
    return [];
  }

  hookLogger.debug(`Found ${allProfiles.length} profiles in initial query`);

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
    let nameMatch = false;
    let phoneMatch = false;
    
    // Multi-field validation: for Name + Phone searches, BOTH must have meaningful matches
    const isNamePhoneSearch = (firstName || lastName) && cleanPhone;
    
    // Name matching with stricter requirements
    if (firstName || lastName) {
      const searchName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
      const profileName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').toLowerCase();
      
      if (profileName) {
        const similarity = calculateStringSimilarity(searchName, profileName);
        hookLogger.debug(`Name similarity for "${searchName}" vs "${profileName}": ${similarity}`);
        
        // Stricter thresholds - no more weak name matches
        const threshold = isSingleFieldSearch ? 0.6 : 0.7; // Increased from 0.4/0.5
        if (similarity > threshold) {
          score += similarity * 3;
          matches++;
          nameMatch = true;
          hookLogger.debug(`✅ Name match: ${similarity} > ${threshold}`);
        }
        
        // Word matching - require exact word matches or strong prefixes
        const searchWords = searchName.split(/\s+/).filter(word => word.length >= 3);
        const profileWords = profileName.split(/\s+/).filter(word => word.length >= 3);
        
        for (const searchWord of searchWords) {
          for (const profileWord of profileWords) {
            // Exact word match only (remove fuzzy word matching)
            if (searchWord === profileWord || 
                (searchWord.length >= 4 && profileWord.startsWith(searchWord) && profileWord.length <= searchWord.length + 2)) {
              score += 1;
              if (!nameMatch) {
                matches++;
                nameMatch = true;
              }
              hookLogger.debug(`✅ Word match: "${searchWord}" matches "${profileWord}"`);
            }
          }
        }
      }
    }
    
    // Phone matching - much more precise
    if (cleanPhone && profile.phone) {
      const profilePhone = profile.phone.replace(/\D/g, '');
      
      // Exact match
      if (profilePhone === cleanPhone) {
        score += 5;
        matches++;
        phoneMatch = true;
        hookLogger.debug(`✅ Exact phone match: ${cleanPhone}`);
      }
      // 7+ digit match (not just area code)
      else if (cleanPhone.length >= 7 && profilePhone.length >= 7) {
        const searchLast7 = cleanPhone.slice(-7);
        const profileLast7 = profilePhone.slice(-7);
        if (searchLast7 === profileLast7) {
          score += 3;
          matches++;
          phoneMatch = true;
          hookLogger.debug(`✅ 7-digit phone match: ${searchLast7}`);
        }
      }
      // Area code only match - very weak, requires other strong evidence
      else if (cleanPhone.length >= 3 && profilePhone.length >= 3 && 
               cleanPhone.slice(0, 3) === profilePhone.slice(0, 3)) {
        score += 0.5; // Very low score for area code only
        hookLogger.debug(`⚠️ Area code only match: ${cleanPhone.slice(0, 3)} (weak)`);
      }
    }
    
    // Multi-field validation: reject if searching for Name + Phone but either field fails
    if (isNamePhoneSearch && (!nameMatch || !phoneMatch)) {
      hookLogger.debug(`❌ Name+Phone search failed - Name match: ${nameMatch}, Phone match: ${phoneMatch}`);
      return { ...profile, searchScore: 0, matchCount: 0 };
    }
    
    // Address matching with fuzzy logic
    if (address && profile.address) {
      const similarity = calculateStringSimilarity(address.toLowerCase(), profile.address.toLowerCase());
      const threshold = isSingleFieldSearch ? 0.4 : 0.6;
      hookLogger.debug(`Address similarity for "${address}" vs "${profile.address}": ${similarity}`);
      if (similarity > threshold) {
        score += similarity * 2;
        matches++;
        hookLogger.debug(`✅ Address match: ${similarity} > ${threshold}`);
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
      const threshold = isSingleFieldSearch ? 0.4 : 0.7;
      hookLogger.debug(`City similarity for "${city}" vs "${profile.city}": ${similarity}`);
      if (similarity > threshold || 
          (similarity > 0.8 && (profile.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(profile.city.toLowerCase())))) {
        score += similarity * 1.5;
        matches++;
        hookLogger.debug(`✅ City match: ${similarity} > ${threshold}`);
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
        hookLogger.debug(`State match found: "${profile.state}" matches "${state}" for profile ${profile.first_name} ${profile.last_name}`);
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
    
    return { ...profile, searchScore: score, matchCount: matches, nameMatch };
  });
  
  // Apply stricter filtering for multi-field searches
  let minScore = isSingleFieldSearch ? 1.0 : 3.0; // Increased minimum scores
  let minMatches = isSingleFieldSearch ? 1 : 2;

  if (isStateOnlySearch) {
    minScore = 0;
    minMatches = 1;
  }

  hookLogger.debug(`Filtering with minScore: ${minScore}, minMatches: ${minMatches}, isSingleField: ${isSingleFieldSearch}`);

  // Check if this is a name + location search (without phone/address specifics)
  const isNameLocationSearch = (firstName || lastName) && (city || state || zipCode) && !phone && !address;

  const filteredProfiles = scoredProfiles
    .filter(profile => {
      hookLogger.debug(`Profile ${profile.first_name} ${profile.last_name}: score=${profile.searchScore}, matches=${profile.matchCount}, nameMatch=${profile.nameMatch}`);

      if (isStateOnlySearch) {
        return profile.matchCount > 0;
      }

      // STRICT NAME REQUIREMENT for name + location searches
      // This prevents false positives like "Isaac Wiley" appearing when searching for "Sal Sardina in La Mesa"
      // Even if the city matches, the name must also match strongly
      if (isNameLocationSearch && !profile.nameMatch) {
        hookLogger.debug(`❌ Profile ${profile.first_name} ${profile.last_name} rejected - Name+Location search requires name match`);
        return false;
      }

      // For multi-field searches, require both minimum score AND minimum matches
      if (!isSingleFieldSearch) {
        return profile.searchScore >= minScore && profile.matchCount >= minMatches;
      }

      // For single field searches, be more lenient
      return profile.searchScore >= minScore || profile.matchCount >= minMatches;
    })
    .sort((a, b) => {
      // Sort by match count first, then by score
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.searchScore - a.searchScore;
    })
    .slice(0, 100); // Increased final results limit
  
  hookLogger.debug("Profile search results:", filteredProfiles.length);
  filteredProfiles.forEach(profile => {
    hookLogger.debug(`Profile: ${profile.first_name} ${profile.last_name}, State: ${profile.state}, Zip: ${profile.zipcode}, Score: ${profile.searchScore}, Matches: ${profile.matchCount}`);
  });
  
  return filteredProfiles as ProfileCustomer[];
};
