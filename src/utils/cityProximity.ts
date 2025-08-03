import { getCityCoordinates, CityCoordinates, resetGeocodingCallCount, saveCachedCoordinates } from "./geocoding";
import { REVIEW_SEARCH_CONFIG } from "@/hooks/useCustomerSearch/reviewSearchConfig";

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  coords1: CityCoordinates,
  coords2: CityCoordinates
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(coords2.lat - coords1.lat);
  const dLng = toRadians(coords2.lng - coords1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.lat)) *
      Math.cos(toRadians(coords2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Check if two cities are within proximity distance
export const areCitiesInProximity = async (
  searchCity: string,
  searchState: string,
  reviewCity: string,
  reviewState: string
): Promise<{ isInProximity: boolean; distance?: number }> => {
  if (!searchCity || !searchState || !reviewCity || !reviewState) {
    return { isInProximity: false };
  }
  
  try {
    const [searchCoords, reviewCoords] = await Promise.all([
      getCityCoordinates(searchCity, searchState, REVIEW_SEARCH_CONFIG.MAX_GEOCODING_CALLS_PER_SEARCH),
      getCityCoordinates(reviewCity, reviewState, REVIEW_SEARCH_CONFIG.MAX_GEOCODING_CALLS_PER_SEARCH)
    ]);
    
    if (!searchCoords || !reviewCoords) {
      return { isInProximity: false };
    }
    
    const distance = calculateDistance(searchCoords, reviewCoords);
    const isInProximity = distance <= REVIEW_SEARCH_CONFIG.CITY_PROXIMITY_MILES;
    
    return { isInProximity, distance };
    
  } catch (error) {
    console.error('Error calculating city proximity:', error);
    return { isInProximity: false };
  }
};

// Calculate proximity score based on distance
export const calculateProximityScore = (distance: number): number => {
  const maxDistance = REVIEW_SEARCH_CONFIG.CITY_PROXIMITY_MILES;
  
  if (distance > maxDistance) return 0;
  if (distance === 0) return REVIEW_SEARCH_CONFIG.SCORES.CITY_PROXIMITY_MULTIPLIER;
  
  // Linear decay: closer cities get higher scores
  const proximityRatio = (maxDistance - distance) / maxDistance;
  return proximityRatio * REVIEW_SEARCH_CONFIG.SCORES.CITY_PROXIMITY_MULTIPLIER;
};

// Initialize geocoding for a new search
export const initializeGeocodingForSearch = () => {
  resetGeocodingCallCount();
};

// Cleanup after search completion
export const cleanupAfterSearch = () => {
  saveCachedCoordinates();
};