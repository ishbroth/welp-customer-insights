import { calculateStringSimilarity } from "@/utils/stringSimilarity";

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
      // Single name + location requires moderate name similarity AND location match
      const searchName = (context.hasFirstName ? context.searchParams.firstName : context.searchParams.lastName) || '';
      const nameSimilarity = reviewData.customer_name ? 
        calculateStringSimilarity(searchName.toLowerCase(), reviewData.customer_name.toLowerCase()) : 0;
      
      console.log(`🔍 Name similarity: "${searchName}" vs "${reviewData.customer_name}" = ${nameSimilarity}`);
      
      // Lower threshold for fuzzy matching (0.65 allows "Samantha" vs "smanantha")
      if (nameSimilarity < 0.65) return false;
      
      // AND require at least one location match
      const cityMatches = context.hasCity && reviewData.customer_city &&
                         calculateStringSimilarity(
                           context.searchParams.city?.toLowerCase() || '',
                           reviewData.customer_city.toLowerCase()
                         ) >= 0.8;
      
      const zipMatches = context.hasZipCode && reviewData.customer_zipcode &&
                        reviewData.customer_zipcode.replace(/\D/g, '').startsWith(
                          context.searchParams.zipCode?.replace(/\D/g, '') || ''
                        );
      
      // Check both business_state and derive from customer location
      const customerState = reviewData.business_state;
      const stateMatches = context.hasState && customerState &&
                          customerState.toLowerCase().trim() === 
                          context.searchParams.state?.toLowerCase().trim();
      
      console.log(`🔍 Location matches - City: ${cityMatches}, Zip: ${zipMatches}, State: ${stateMatches}`);
      
      return cityMatches || zipMatches || stateMatches;
    },
    minScoreRequired: 15,
    description: 'Single name + location requires moderate name similarity and location match'
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