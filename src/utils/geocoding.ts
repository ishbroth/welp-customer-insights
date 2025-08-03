import { supabase } from "@/integrations/supabase/client";
import { COMMON_CITY_COORDINATES, normalizeCityName } from "@/data/commonCities";

export interface CityCoordinates {
  lat: number;
  lng: number;
}

// Cache for geocoded coordinates
const coordinatesCache = new Map<string, CityCoordinates | null>();
let geocodingCallsCount = 0;

// Reset geocoding call count (called at start of each search)
export const resetGeocodingCallCount = () => {
  geocodingCallsCount = 0;
};

// Get coordinates from local cache first, then common cities, then Google API
export const getCityCoordinates = async (
  city: string, 
  state: string,
  maxCalls: number = 5
): Promise<CityCoordinates | null> => {
  if (!city || !state) return null;
  
  const normalizedKey = normalizeCityName(city, state);
  
  // Check cache first
  if (coordinatesCache.has(normalizedKey)) {
    return coordinatesCache.get(normalizedKey) || null;
  }
  
  // Check common cities database
  if (COMMON_CITY_COORDINATES[normalizedKey]) {
    const coords = COMMON_CITY_COORDINATES[normalizedKey];
    coordinatesCache.set(normalizedKey, coords);
    return coords;
  }
  
  // Check if we've exceeded max geocoding calls
  if (geocodingCallsCount >= maxCalls) {
    console.log(`Geocoding limit reached (${maxCalls} calls)`);
    coordinatesCache.set(normalizedKey, null);
    return null;
  }
  
  try {
    geocodingCallsCount++;
    console.log(`Geocoding ${normalizedKey} (call ${geocodingCallsCount}/${maxCalls})`);
    
    const { data, error } = await supabase.functions.invoke('geocode-city', {
      body: { city, state }
    });
    
    if (error || !data?.coordinates) {
      console.warn(`Failed to geocode ${normalizedKey}:`, error);
      coordinatesCache.set(normalizedKey, null);
      return null;
    }
    
    const coords: CityCoordinates = {
      lat: data.coordinates.lat,
      lng: data.coordinates.lng
    };
    
    coordinatesCache.set(normalizedKey, coords);
    return coords;
    
  } catch (error) {
    console.error(`Error geocoding ${normalizedKey}:`, error);
    coordinatesCache.set(normalizedKey, null);
    return null;
  }
};

// Load cached coordinates from localStorage on init
export const loadCachedCoordinates = () => {
  try {
    const cached = localStorage.getItem('cityCoordinatesCache');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      Object.entries(parsedCache).forEach(([key, coords]) => {
        coordinatesCache.set(key, coords as CityCoordinates | null);
      });
    }
  } catch (error) {
    console.warn('Failed to load cached coordinates:', error);
  }
};

// Save coordinates cache to localStorage
export const saveCachedCoordinates = () => {
  try {
    const cacheObject = Object.fromEntries(coordinatesCache.entries());
    localStorage.setItem('cityCoordinatesCache', JSON.stringify(cacheObject));
  } catch (error) {
    console.warn('Failed to save coordinates cache:', error);
  }
};

// Initialize cache on module load
loadCachedCoordinates();