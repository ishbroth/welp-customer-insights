import { calculateStringSimilarity, calculateNameSimilarity } from "@/utils/stringSimilarity";

export interface FieldCombinationContext {
  searchParams: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  hasFirstName: boolean;
  hasLastName: boolean;
  hasPhone: boolean;
  hasAddress: boolean;
  hasCity: boolean;
  hasState: boolean;
  hasZipCode: boolean;
  combinationType: 'weak' | 'moderate' | 'strong';
}

export interface FieldCombinationRule {
  name: string;
  applies: (context: FieldCombinationContext) => boolean;
  validate: (
    context: FieldCombinationContext,
    reviewData: {
      customer_name?: string;
      customer_phone?: string;
      customer_address?: string;
      customer_city?: string;
      customer_zipcode?: string;
      business_state?: string;
    }
  ) => boolean;
  minScoreRequired: number;
  description: string;
}

export const analyzeFieldCombination = (searchParams: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}): FieldCombinationContext => {
  const hasFirstName = Boolean(searchParams.firstName?.trim());
  const hasLastName = Boolean(searchParams.lastName?.trim());
  const hasPhone = Boolean(searchParams.phone?.trim());
  const hasAddress = Boolean(searchParams.address?.trim());
  const hasCity = Boolean(searchParams.city?.trim());
  const hasState = Boolean(searchParams.state?.trim());
  const hasZipCode = Boolean(searchParams.zipCode?.trim());

  // Determine combination strength
  let combinationType: 'weak' | 'moderate' | 'strong' = 'weak';
  
  const fieldCount = [hasFirstName, hasLastName, hasPhone, hasAddress, hasCity, hasState, hasZipCode].filter(Boolean).length;
  const strongIdentifiers = [hasPhone, hasAddress, (hasFirstName && hasLastName)].filter(Boolean).length;
  
  if (strongIdentifiers >= 2 || fieldCount >= 4) {
    combinationType = 'strong';
  } else if (strongIdentifiers >= 1 || fieldCount >= 3) {
    combinationType = 'moderate';
  }

  return {
    searchParams,
    hasFirstName,
    hasLastName,
    hasPhone,
    hasAddress,
    hasCity,
    hasState,
    hasZipCode,
    combinationType
  };
};

export const FIELD_COMBINATION_RULES: FieldCombinationRule[] = [
  {
    name: 'last_name_state_only',
    applies: (context) => 
      context.hasLastName && context.hasState && 
      !context.hasFirstName && !context.hasPhone && !context.hasAddress,
    validate: (context, reviewData) => {
      // For last name + state searches, require EXACT state match OR supporting phone/address evidence
      const stateMatches = reviewData.business_state?.toLowerCase().trim() === 
                          context.searchParams.state?.toLowerCase().trim();
      
      const hasPhoneMatch = context.searchParams.phone && reviewData.customer_phone &&
                           reviewData.customer_phone.replace(/\D/g, '') === context.searchParams.phone.replace(/\D/g, '');
      
      const hasAddressSupport = reviewData.customer_address && 
                               reviewData.customer_address.length > 10; // Has meaningful address
      
      return stateMatches || hasPhoneMatch || hasAddressSupport;
    },
    minScoreRequired: 25,
    description: 'Last name + state searches require exact state match or supporting evidence'
  },
  {
    name: 'single_name_location',
    applies: (context) => 
      (context.hasFirstName || context.hasLastName) && 
      (context.hasCity || context.hasZipCode || context.hasState) &&
      !context.hasPhone && !context.hasAddress &&
      !(context.hasFirstName && context.hasLastName),
    validate: (context, reviewData) => {
      // Single name + location requires HIGH name similarity AND EXACT location match
      const searchName = (context.hasFirstName ? context.searchParams.firstName : context.searchParams.lastName) || '';
      const nameSimilarity = reviewData.customer_name ? 
        calculateNameSimilarity(searchName, reviewData.customer_name) : 0;
      
      console.log(`[SINGLE_NAME_LOCATION] Name similarity: "${searchName}" vs "${reviewData.customer_name}" = ${nameSimilarity}`);
      
      // Higher threshold for single name searches to prevent wrong matches like "Isaac Wiley"
      if (nameSimilarity < 0.75) {
        console.log(`[SINGLE_NAME_LOCATION] Name similarity ${nameSimilarity} below threshold 0.75 - REJECTED`);
        return false;
      }
      
      // Require EXACT location matches for single name searches
      let hasExactLocationMatch = false;
      
      // Exact ZIP match
      if (context.hasZipCode && reviewData.customer_zipcode) {
        const searchZip = context.searchParams.zipCode?.replace(/\D/g, '') || '';
        const reviewZip = reviewData.customer_zipcode.replace(/\D/g, '');
        if (searchZip && reviewZip && searchZip === reviewZip) {
          console.log(`[SINGLE_NAME_LOCATION] Exact ZIP match: ${searchZip}`);
          hasExactLocationMatch = true;
        }
      }
      
      // Exact state match
      if (context.hasState && reviewData.business_state) {
        const searchState = context.searchParams.state?.toLowerCase().trim() || '';
        const businessState = reviewData.business_state.toLowerCase().trim();
        if (searchState === businessState) {
          console.log(`[SINGLE_NAME_LOCATION] Exact state match: ${searchState}`);
          hasExactLocationMatch = true;
        }
      }
      
      // High city similarity (still allow some fuzzy matching for cities)
      if (context.hasCity && reviewData.customer_city) {
        const citySimilarity = calculateStringSimilarity(
          context.searchParams.city?.toLowerCase() || '',
          reviewData.customer_city.toLowerCase()
        );
        if (citySimilarity >= 0.9) {
          console.log(`[SINGLE_NAME_LOCATION] High city similarity: ${citySimilarity}`);
          hasExactLocationMatch = true;
        }
      }
      
      if (!hasExactLocationMatch) {
        console.log(`[SINGLE_NAME_LOCATION] No exact location match found - REJECTED`);
        return false;
      }
      
      console.log(`[SINGLE_NAME_LOCATION] ACCEPTED - Name: ${nameSimilarity}, Location match: true`);
      return true;
    },
    minScoreRequired: 20,
    description: 'Single name + location requires high name similarity and exact location match'
  },
  {
    name: 'weak_name_combination',
    applies: (context) => 
      (context.hasFirstName && context.hasCity && !context.hasLastName && !context.hasState && !context.hasZipCode),
    validate: (context, reviewData) => {
      // Only reject very weak combinations like "first name + city only"
      // Allow "first name + zip" or "first name + state" combinations
      return false; 
    },
    minScoreRequired: 100, // Effectively impossible
    description: 'Reject overly weak name combinations (first name + city only)'
  },
  {
    name: 'address_different_name',
    applies: (context) => 
      context.hasAddress && (context.hasFirstName || context.hasLastName),
    validate: (context, reviewData) => {
      // If we have address + name, allow if address match is very strong
      // This handles cases like name changes, married names, etc.
      return true; // Let the scoring system handle this with address similarity
    },
    minScoreRequired: 20,
    description: 'Address + name combinations rely on address similarity scoring'
  },
  {
    name: 'full_name_searches',
    applies: (context) => 
      context.hasFirstName && context.hasLastName,
    validate: (context, reviewData) => {
      // Full name searches are more reliable, allow location differences
      // (people move, but their name stays the same)
      return true;
    },
    minScoreRequired: 15,
    description: 'Full name searches allow location differences'
  }
];

export const validateFieldCombination = (
  searchParams: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  },
  reviewData: {
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    business_state?: string;
  }
): { isValid: boolean; minScoreRequired: number; appliedRules: string[] } => {
  const context = analyzeFieldCombination(searchParams);
  const appliedRules: string[] = [];
  let minScoreRequired = 10; // Default minimum
  let isValid = true;

  // Find and apply all matching rules
  for (const rule of FIELD_COMBINATION_RULES) {
    if (rule.applies(context)) {
      appliedRules.push(rule.name);
      const ruleResult = rule.validate(context, reviewData);
      
      if (!ruleResult) {
        isValid = false;
      }
      
      // Use the highest minimum score requirement
      minScoreRequired = Math.max(minScoreRequired, rule.minScoreRequired);
    }
  }

  return {
    isValid,
    minScoreRequired,
    appliedRules
  };
};