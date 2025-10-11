import { logger } from "@/utils/logger";

const utilLogger = logger.withContext('addressExtraction');

export interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export const extractAddressComponents = (place: google.maps.places.PlaceResult): AddressComponents => {
  utilLogger.debug('extractAddressComponents - Starting extraction for place:', place);
  
  const components: AddressComponents = {
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };

  if (!place.address_components) {
    utilLogger.warn('No address components found in place');
    return components;
  }

  utilLogger.debug('Address components to process:', place.address_components);

  // Extract street number and route to build street address
  let streetNumber = '';
  let route = '';
  
  place.address_components.forEach((component) => {
    const types = component.types;
    utilLogger.debug('Processing component:', component.long_name, 'Types:', types);

    if (types.includes('street_number')) {
      streetNumber = component.long_name;
      utilLogger.debug('Found street number:', streetNumber);
    } else if (types.includes('route')) {
      route = component.long_name;
      utilLogger.debug('Found route:', route);
    } else if (types.includes('locality')) {
      components.city = component.long_name;
      utilLogger.debug('Found city:', components.city);
    } else if (types.includes('administrative_area_level_1')) {
      components.state = component.short_name;
      utilLogger.debug('Found state:', components.state);
    } else if (types.includes('postal_code')) {
      components.zipCode = component.long_name;
      utilLogger.debug('Found zip code:', components.zipCode);
    } else if (types.includes('country')) {
      components.country = component.short_name;
      utilLogger.debug('Found country:', components.country);
    }
  });

  // Build street address from components
  if (streetNumber && route) {
    components.streetAddress = `${streetNumber} ${route}`;
  } else if (route) {
    components.streetAddress = route;
  } else if (streetNumber) {
    components.streetAddress = streetNumber;
  }

  utilLogger.debug('Final extracted components:', components);

  return components;
};
