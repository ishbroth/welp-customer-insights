// State normalization utility for consistent state matching
// Maps state abbreviations to full names and vice versa

const stateMapping: Record<string, string> = {
  // Abbreviations to full names
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia',
  
  // Full names to abbreviations
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC'
};

/**
 * Normalizes a state input to a consistent format
 * Returns the abbreviation form for consistent comparison
 */
export const normalizeState = (state: string): string => {
  if (!state) return '';
  
  const cleanState = state.trim().toLowerCase();
  
  // If it's already an abbreviation, return uppercase
  if (cleanState.length === 2) {
    return cleanState.toUpperCase();
  }
  
  // If it's a full name, convert to abbreviation
  const abbreviation = stateMapping[cleanState];
  if (abbreviation) {
    return abbreviation;
  }
  
  // Return original if no mapping found
  return state.trim().toUpperCase();
};

/**
 * Compares two states after normalization
 * Returns true if they represent the same state
 */
export const compareStates = (state1: string, state2: string): boolean => {
  if (!state1 || !state2) return false;
  
  const normalized1 = normalizeState(state1);
  const normalized2 = normalizeState(state2);
  
  return normalized1 === normalized2;
};

/**
 * Gets the full state name from abbreviation or returns the input if already full
 */
export const getFullStateName = (state: string): string => {
  if (!state) return '';
  
  const normalized = normalizeState(state);
  const fullName = stateMapping[normalized];
  
  return fullName || state;
};

/**
 * Gets the state abbreviation from full name or returns the input if already abbreviated
 */
export const getStateAbbreviation = (state: string): string => {
  return normalizeState(state);
};