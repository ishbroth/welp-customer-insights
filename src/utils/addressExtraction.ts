
import { normalizeAddress } from "./addressNormalization";

export interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export const extractAddressComponents = (place: google.maps.places.PlaceResult): AddressComponents => {
  if (!place.address_components) {
    return { streetAddress: '', city: '', state: '', zipCode: '' };
  }

  let streetNumber = '';
  let route = '';
  let city = '';
  let state = '';
  let zipCode = '';
  
  place.address_components.forEach((component) => {
    const types = component.types;
    
    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    } else if (types.includes('route')) {
      route = component.long_name;
    } else if (types.includes('locality')) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = component.short_name; // Use short_name for state abbreviation
    } else if (types.includes('postal_code')) {
      zipCode = component.long_name;
    }
  });
  
  // Create the street address (just street number + route) for this field
  const streetAddress = `${streetNumber} ${route}`.trim();
  const normalizedAddress = normalizeAddress(streetAddress);
  
  return {
    streetAddress: normalizedAddress,
    city,
    state,
    zipCode
  };
};
