
import { normalizeAddress } from "./addressNormalization";

export interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export const extractAddressComponents = (place: google.maps.places.PlaceResult): AddressComponents => {
  console.log('🔧 extractAddressComponents - Starting extraction with place:', {
    formatted_address: place.formatted_address,
    address_components: place.address_components
  });

  if (!place.address_components) {
    console.log('❌ extractAddressComponents - No address components found');
    return { streetAddress: '', city: '', state: '', zipCode: '' };
  }

  let streetNumber = '';
  let route = '';
  let city = '';
  let state = '';
  let zipCode = '';
  
  // Log each component for debugging
  place.address_components.forEach((component, index) => {
    console.log(`🔧 Component ${index}:`, {
      long_name: component.long_name,
      short_name: component.short_name,
      types: component.types
    });
  });
  
  place.address_components.forEach((component) => {
    const types = component.types;
    
    if (types.includes('street_number')) {
      streetNumber = component.long_name;
      console.log('🔧 Found street_number:', streetNumber);
    } else if (types.includes('route')) {
      route = component.long_name;
      console.log('🔧 Found route:', route);
    } else if (types.includes('locality')) {
      city = component.long_name;
      console.log('🔧 Found locality (city):', city);
    } else if (types.includes('administrative_area_level_1')) {
      state = component.short_name; // Use short_name for state abbreviation
      console.log('🔧 Found administrative_area_level_1 (state):', state);
    } else if (types.includes('postal_code')) {
      zipCode = component.long_name;
      console.log('🔧 Found postal_code:', zipCode);
    }
  });
  
  // Create the street address (ONLY street number + route)
  const rawStreetAddress = `${streetNumber} ${route}`.trim();
  console.log('🔧 Raw street address before normalization:', rawStreetAddress);
  
  // Apply normalization only to the street address
  const normalizedStreetAddress = normalizeAddress(rawStreetAddress);
  console.log('🔧 Normalized street address:', normalizedStreetAddress);
  
  const result = {
    streetAddress: normalizedStreetAddress,
    city,
    state,
    zipCode
  };
  
  console.log('🔧 extractAddressComponents - Final result:', result);
  return result;
};
