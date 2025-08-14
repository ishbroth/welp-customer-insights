export interface MatchIndicators {
  nameMatch: boolean;
  phoneMatch: boolean;
  addressMatch: boolean;
  cityMatch: boolean;
  matchScore?: number;
  matchReasons?: string[];
}

export const createMatchIndicators = (
  review: any,
  customerData?: any,
  matchType?: string,
  matchScore?: number,
  matchReasons?: string[]
): MatchIndicators => {
  // If we have explicit match data, use it
  if (matchType && ['high_quality', 'potential', 'claimed'].includes(matchType)) {
    return {
      nameMatch: true,
      phoneMatch: !!review.customer_phone,
      addressMatch: !!review.customer_address,
      cityMatch: !!review.customer_city,
      matchScore,
      matchReasons
    };
  }

  // Otherwise, infer matches based on data availability
  return {
    nameMatch: !!(review.customer_name || customerData?.firstName),
    phoneMatch: !!(review.customer_phone || customerData?.phone),
    addressMatch: !!(review.customer_address || customerData?.address),
    cityMatch: !!(review.customer_city || customerData?.city),
    matchScore,
    matchReasons
  };
};

export const formatMatchIndicators = (indicators: MatchIndicators): string[] => {
  const matches: string[] = [];
  
  if (indicators.nameMatch) matches.push("Name matched ✓");
  if (indicators.phoneMatch) matches.push("Phone matched ✓");
  if (indicators.addressMatch) matches.push("Address matched ✓");
  if (indicators.cityMatch) matches.push("City matched ✓");
  
  return matches;
};

export const getLocationDisplay = (
  city?: string,
  state?: string,
  zipCode?: string
): string => {
  const parts = [];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  return parts.join(', ');
};
