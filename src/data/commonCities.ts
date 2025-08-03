// Pre-populated coordinates for common cities to reduce API calls
export const COMMON_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // San Diego County
  'san diego, ca': { lat: 32.7157, lng: -117.1611 },
  'chula vista, ca': { lat: 32.6401, lng: -117.0842 },
  'national city, ca': { lat: 32.6781, lng: -117.0992 },
  'bonita, ca': { lat: 32.6581, lng: -117.0202 },
  'el cajon, ca': { lat: 32.7948, lng: -116.9625 },
  'santee, ca': { lat: 32.8384, lng: -116.9739 },
  'la mesa, ca': { lat: 32.7678, lng: -117.0231 },
  'spring valley, ca': { lat: 32.7448, lng: -116.9989 },
  'lemon grove, ca': { lat: 32.7425, lng: -117.0317 },
  'coronado, ca': { lat: 32.6859, lng: -117.1831 },
  'imperial beach, ca': { lat: 32.5837, lng: -117.1131 },
  'poway, ca': { lat: 33.0136, lng: -117.0358 },
  'encinitas, ca': { lat: 33.0370, lng: -117.2920 },
  'escondido, ca': { lat: 33.1192, lng: -117.0864 },
  'carlsbad, ca': { lat: 33.1581, lng: -117.3506 },
  'oceanside, ca': { lat: 33.1959, lng: -117.3795 },
  'vista, ca': { lat: 33.2000, lng: -117.2425 },
  'san marcos, ca': { lat: 33.1434, lng: -117.1661 },
  
  // Orange County
  'irvine, ca': { lat: 33.6846, lng: -117.8265 },
  'anaheim, ca': { lat: 33.8366, lng: -117.9143 },
  'santa ana, ca': { lat: 33.7455, lng: -117.8677 },
  'huntington beach, ca': { lat: 33.6603, lng: -117.9992 },
  'orange, ca': { lat: 33.7879, lng: -117.8531 },
  'fullerton, ca': { lat: 33.8704, lng: -117.9243 },
  'costa mesa, ca': { lat: 33.6411, lng: -117.9187 },
  'newport beach, ca': { lat: 33.6189, lng: -117.9298 },
  
  // Los Angeles County
  'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
  'long beach, ca': { lat: 33.7701, lng: -118.1937 },
  'glendale, ca': { lat: 34.1425, lng: -118.2551 },
  'pasadena, ca': { lat: 34.1478, lng: -118.1445 },
  'burbank, ca': { lat: 34.1808, lng: -118.3090 },
  'torrance, ca': { lat: 33.8358, lng: -118.3406 },
  'compton, ca': { lat: 33.8958, lng: -118.2201 },
  'inglewood, ca': { lat: 33.9617, lng: -118.3531 },
  
  // Riverside County  
  'riverside, ca': { lat: 33.9533, lng: -117.3962 },
  'corona, ca': { lat: 33.8753, lng: -117.5664 },
  'murrieta, ca': { lat: 33.5539, lng: -117.2139 },
  'temecula, ca': { lat: 33.4936, lng: -117.1484 },
  'palm springs, ca': { lat: 33.8303, lng: -116.5453 },
  
  // Imperial County
  'el centro, ca': { lat: 32.7920, lng: -115.5631 },
  'calexico, ca': { lat: 32.6789, lng: -115.4989 },
  'brawley, ca': { lat: 32.9787, lng: -115.5281 }
};

// Normalize city name for lookup
export const normalizeCityName = (city: string, state: string): string => {
  const normalizedCity = city.toLowerCase().trim();
  const normalizedState = state.toLowerCase().trim();
  return `${normalizedCity}, ${normalizedState}`;
};